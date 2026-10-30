# SobTools Security Specification & Hardened ABAC Rules Architecture

## 1. System Invariants & Data Integrity Laws

1. **Identity Invariant (Owner Exclusivity)**:
   - A user profile at `/users/{uid}` can only be created or modified by the authenticated user whose `request.auth.uid == uid`, or by a verified administrator.
   - Users cannot alter `uid` or `email` after profile initialization.
   - Users cannot escalate their own privileges: the `role` field cannot be set to `'admin'` by client creation or update requests.
   - Only verified administrators can access the `users` collection via `list` operations or mutate another user's `isSuspended` status.

2. **Subcollection Relational Isolation**:
   - `/users/{uid}/favorites/{toolId}` and `/users/{uid}/toolHistory/{historyId}` strictly belong to the parent user `{uid}`.
   - Any attempt to read, write, or query another user's favorites or history records is rejected with `PERMISSION_DENIED`.

3. **Admin Privilege Enforcement**:
   - Administrative authority is granted strictly through:
     1. Verified runtime bootstrap email (`mdmorshedalamhridayy@gmail.com`) with `request.auth.token.email_verified == true`.
     2. Existence of a trusted document in the server-governed `/admins/{uid}` collection.
   - Custom claims supplied on the client or arbitrary Firestore profile role values are never blindly trusted.

4. **Global Announcement & Settings Integrity**:
   - Public visitors may read `/announcements` and `/settings/website`.
   - Creation, modification, or deletion of announcements and global website configurations is strictly restricted to `isAdmin()`.

5. **Mandatory Denial of Wallet & Boundary Guarding**:
   - String sizes and object shapes are strictly bounded (`<= 128` chars for IDs, `<= 150` chars for emails, `<= 100` chars for display names, `<= 64` chars for tool IDs).
   - Wildcard writes and unauthenticated access are blocked by default via the Global Safety Net (`match /{document=**} { allow read, write: if false; }`).

---

## 2. The "Dirty Dozen" Adversarial Payloads

| # | Attack Vector | Target Path | Malicious Payload / Action | Expected Result |
|---|---------------|-------------|----------------------------|-----------------|
| 1 | Identity Spoofing | `/users/victim_user_123` | Create doc with `uid: "victim_user_123"` while `auth.uid == "attacker_456"` | `PERMISSION_DENIED` |
| 2 | Self-Promoted Admin | `/users/attacker_456` | Update doc with `{ role: "admin" }` | `PERMISSION_DENIED` |
| 3 | Unverified Email Admin Spoof | `/admins/attacker_456` | Write attempt with unverified email `email_verified == false` | `PERMISSION_DENIED` |
| 4 | PII Blanket List Query | `/users` | Unprivileged client executes `getDocs(collection(db, "users"))` | `PERMISSION_DENIED` |
| 5 | Unauthorized History Snooping | `/users/victim_123/toolHistory/h1` | `getDoc` as a different user | `PERMISSION_DENIED` |
| 6 | Cross-User Favorite Tampering | `/users/victim_123/favorites/tool1` | `setDoc` or `deleteDoc` as a different user | `PERMISSION_DENIED` |
| 7 | Self-Reactivation of Suspended User | `/users/attacker_456` | Update doc with `{ isSuspended: false }` by suspended user | `PERMISSION_DENIED` |
| 8 | Huge Payload Injection (Denial of Wallet) | `/users/attacker_456` | Update doc with 2MB `displayName` string | `PERMISSION_DENIED` |
| 9 | Malicious Announcement Broadcast | `/announcements/fake_promo` | Create announcement as normal user | `PERMISSION_DENIED` |
| 10 | Global Setting Tampering | `/settings/website` | Overwrite `maintenanceMode: true` without admin credentials | `PERMISSION_DENIED` |
| 11 | ID Poisoning Attack | `/users/attacker_456/favorites/{invalid#$@!id*...}` | Document ID containing invalid special characters | `PERMISSION_DENIED` |
| 12 | Anonymous Write Bypass | `/users/guest_1` | Attempt to write documents without authentication token | `PERMISSION_DENIED` |

---

## 3. Red Team Verification Status
- All 12 test assertions are enforced by `/firestore.rules`.
- Rules version 2 deployed and active.
- Error handling standardized with `handleFirestoreError` providing structured JSON context.
