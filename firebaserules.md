# IntellectualOS — Firestore Security Rules

Paste these rules in the Firebase console under:
**Firestore → Rules** for the `intellectualos` project.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ── presence ── online player count (unauthenticated write allowed)
    match /presence/{sid} {
      allow read: if true;
      allow create, update: if request.resource.data.keys().hasAll(['ts', 'active'])
                            && request.resource.data.keys().hasOnly(['ts', 'active']);
      allow delete: if true;
    }

    // ── users ── profile + preferences (only the owner can read/write)
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

  }
}
```

## What this fixes
- **Player count showing `--`** — the presence collection previously blocked
  unauthenticated writes, so only signed-in users incremented the count.
  These rules allow any visitor to write a presence doc (restricted to only
  the `ts` and `active` fields so nothing else can be injected).
- **User profiles** — locked to the authenticated owner's UID, unchanged.
