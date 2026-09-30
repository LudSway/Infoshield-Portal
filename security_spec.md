# Security Specification: InfoShield compliance portal

## 1. Data Invariants

- **Administrative Exclusivity**: Only authorized administrators (`godwayr.akakpo@gmail.com` and `godswayr.akakpo@gmail.com`) can perform critical write operations on settings, campaigns, compliance status, and directory configurations.
- **Directory & PII Isolation**: User profile information in `infoshield_directory` is strictly private and cannot be read or written by unauthorized users.
- **Suggestions Integrity**: Any user can submit a suggestion to `iso27001_employee_suggestions`, but only the submitter (owner) or an administrator can view or modify it.
- **Immutable Timestamps**: High-audit fields such as `createdAt`, `onboardedAt`, and `submittedAt` must be set to the server timestamp (`request.time`) on creation and remain immutable.
- **Bounded Volumetrics**: All text strings are capped at reasonable lengths (e.g. `<= 256` or `<= 1024` chars) to prevent Denial of Wallet and buffer stuffing attacks.

---

## 2. The "Dirty Dozen" Malicious Payloads

The following 12 payloads represent attacks designed to bypass the security rules of the application. All of these MUST be rejected with `PERMISSION_DENIED`.

### Payload 1: Privilege Escalation (Self-Appointed Admin)
An attacker attempts to write or register a user document with an `admin` role or flag.
```json
{
  "email": "attacker@infoshield.io",
  "name": "Malicious User",
  "role": "CISO",
  "isAdmin": true
}
```

### Payload 2: PII Data Scraping (Unauthorized Directory Reads)
An unauthenticated or basic user attempts to read other users' private profile details in `infoshield_directory`.
```json
// GET /infoshield_directory/some-user-id
// Query for list of all users' emails and details
```

### Payload 3: Spoofed Email Write (Email Impersonation)
An attacker attempts to create a submission claiming to be `godwayr.akakpo@gmail.com` but signed in with a different identity.
```json
{
  "name": "Impersonator",
  "email": "godwayr.akakpo@gmail.com",
  "suggestion": "Malicious payload",
  "submittedBy": "attacker-uid"
}
```

### Payload 4: Invalid Document ID Poisoning
An attacker attempts to create a document using a malformed, ultra-long document ID containing malicious payload characters.
```json
// PUT /infoshield_directory/malicious-script-tag-<script>alert('compromised')</script>
```

### Payload 5: Future Timestamp Injection
An attacker tries to seed compliance readiness reports or suggestions with a spoofed/future creation timestamp.
```json
{
  "title": "Faked Suggestion",
  "submittedAt": "2030-12-31T23:59:59Z"
}
```

### Payload 6: Denial of Wallet (Gigabyte-sized Field Attack)
An attacker tries to flood the database with a massive 1MB string in a configuration field.
```json
{
  "website": "[Repeated 1,000,000 'A' characters]"
}
```

### Payload 7: State Shortcutting (Unvalidated Suggestion Approval)
An attacker attempts to update their own submitted suggestion's state directly to "Approved" without admin authorization.
```json
{
  "status": "Approved"
}
```

### Payload 8: Immutable Field Overwrite
An attacker attempts to modify the `createdAt` value of an existing corrective action item.
```json
{
  "createdAt": "2020-01-01T00:00:00Z"
}
```

### Payload 9: Orphaned Course Assignment Creation
An attacker attempts to register a training assignment for a non-existent course ID.
```json
{
  "courseId": "non-existent-course-id",
  "assignedToUser": "attacker-uid",
  "status": "assigned"
}
```

### Payload 10: Anonymous Writing to Critical Assets
An unauthenticated or anonymous user attempts to write to the `business` profile.
```json
{
  "name": "Hacked Business Profile"
}
```

### Payload 11: Shadow Field Injection
An attacker attempts to create a phishing campaign containing extra unvalidated "Ghost" fields (e.g., `bypassMfa: true`).
```json
{
  "name": "Phishing Campaign A",
  "template": "Standard Template",
  "status": "Active",
  "bypassMfa": true
}
```

### Payload 12: Directory Modification of Other Users
A verified user attempts to modify or delete another user's account settings in the active directory.
```json
// DELETE /infoshield_directory/U-2
```

---

## 3. The Test Runner Spec

The testing logic ensures that any of the 12 scenarios are strictly rejected by the Firestore engine:
- `getAuth` context is validated first.
- If email is not verified, standard operations must be rejected.
- Strict key-set match (`data.keys().hasAll()` & `.size()`) is evaluated.
- Relational integrity check using `exists()` or `get()`.
