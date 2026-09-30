import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy,
  Firestore
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase Applet Configuration (pre-configured by platform setup)
const firebaseConfig = {
  apiKey: "AIzaSyCSDU_aDAh2mvOLdRnsAPfdSi1jvTXfdog",
  authDomain: "gen-lang-client-0230790809.firebaseapp.com",
  projectId: "gen-lang-client-0230790809",
  storageBucket: "gen-lang-client-0230790809.firebasestorage.app",
  messagingSenderId: "963614236117",
  appId: "1:963614236117:web:5ba70a0782e082a1c5315c"
};

let app: FirebaseApp;
let db: Firestore;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  // Initialize firestore with the custom databaseId provided in applet config
  db = getFirestore(app, "ai-studio-infoshieldsecpor-04b5a160-0f34-400d-8b43-722508495b1b");
} catch (error) {
  console.error("Firebase initialization failed. Falling back to local/in-memory storage.", error);
}

export { app, db };

// Standardized Operation Type Enum as mandated by SDK patterns
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

// Standardized error information structure
export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

/**
 * Handles Firestore security and execution errors, converting them to
 * the strictly mandated FirestoreErrorInfo JSON string.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  let userId: string | null = null;
  let email: string | null = null;
  let emailVerified: boolean | null = null;
  let isAnonymous: boolean | null = null;
  let tenantId: string | null = null;
  let providerInfo: Array<{ providerId: string; email: string | null }> = [];

  try {
    const auth = getAuth(app);
    if (auth.currentUser) {
      userId = auth.currentUser.uid;
      email = auth.currentUser.email;
      emailVerified = auth.currentUser.emailVerified;
      isAnonymous = auth.currentUser.isAnonymous;
      tenantId = auth.currentUser.tenantId;
      providerInfo = auth.currentUser.providerData.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      }));
    }
  } catch (e) {
    // Auth might not be ready or active
  }

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId,
      email,
      emailVerified,
      isAnonymous,
      tenantId,
      providerInfo
    },
    operationType,
    path
  };

  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Generic realtime synchronization helper for collections.
 * Fallback callback is fired if Firebase fails or is not ready.
 */
export function syncCollection<T>(
  collectionName: string,
  onUpdate: (items: T[]) => void,
  fallbackItems: T[]
) {
  if (!db) {
    onUpdate(fallbackItems);
    return () => {};
  }

  try {
    const q = query(collection(db, collectionName));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: T[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as any);
        });
        
        if (items.length === 0 && fallbackItems.length > 0) {
          // Auto-seed empty firestore collections with default records
          fallbackItems.forEach(async (item: any) => {
            const { id, ...rest } = item;
            try {
              await setDoc(doc(db, collectionName, id), rest);
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${id}`);
            }
          });
          onUpdate(fallbackItems);
        } else {
          onUpdate(items);
        }
      },
      (error) => {
        console.warn(`Firestore onSnapshot failed for ${collectionName}:`, error);
        handleFirestoreError(error, OperationType.LIST, collectionName);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.error(`Error subscribing to ${collectionName}:`, err);
    handleFirestoreError(err, OperationType.LIST, collectionName);
  }
}

/**
 * Generic single document snapshot helper (e.g. for BusinessProfile).
 */
export function syncDocument<T>(
  collectionName: string,
  docId: string,
  onUpdate: (item: T | null) => void,
  fallbackItem: T | null
) {
  if (!db) {
    onUpdate(fallbackItem);
    return () => {};
  }

  try {
    const docRef = doc(db, collectionName, docId);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onUpdate({ id: docSnap.id, ...docSnap.data() } as any);
        } else {
          if (fallbackItem) {
            setDoc(docRef, fallbackItem as any).catch(err => {
              handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${docId}`);
            });
          }
          onUpdate(fallbackItem);
        }
      },
      (error) => {
        console.warn(`Firestore document sub failed for ${collectionName}/${docId}:`, error);
        handleFirestoreError(error, OperationType.GET, `${collectionName}/${docId}`);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.error(`Error subscribing to document ${collectionName}/${docId}:`, err);
    handleFirestoreError(err, OperationType.GET, `${collectionName}/${docId}`);
  }
}

/**
 * Add or overwrite document in collection
 */
export async function saveDocument(collectionName: string, docId: string, data: any) {
  if (!db) return false;
  try {
    // Remove 'id' if nested in data to avoid duplicate field
    const { id, ...payload } = data;
    await setDoc(doc(db, collectionName, docId), payload);
    return true;
  } catch (e) {
    console.error(`Error saving document to ${collectionName}/${docId}:`, e);
    handleFirestoreError(e, OperationType.WRITE, `${collectionName}/${docId}`);
  }
}

/**
 * Delete document from collection
 */
export async function deleteDocument(collectionName: string, docId: string) {
  if (!db) return false;
  try {
    await deleteDoc(doc(db, collectionName, docId));
    return true;
  } catch (e) {
    console.error(`Error deleting document from ${collectionName}/${docId}:`, e);
    handleFirestoreError(e, OperationType.DELETE, `${collectionName}/${docId}`);
  }
}
