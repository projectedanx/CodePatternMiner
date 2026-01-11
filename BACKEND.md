# Backend Specification // Firebase Protocol

## 1. Overview
This document outlines the architecture for moving **The Code Pattern Miner** from a local-state prototype to a cloud-native platform using Google Firebase.

## 2. Infrastructure
*   **Platform**: Firebase (Google Cloud Platform)
*   **Database**: Cloud Firestore (NoSQL Document Store)
*   **Auth**: Firebase Authentication (GitHub & Google Providers)
*   **Storage**: Firebase Storage (For large AST JSON blobs or asset exports)
*   **API**: Firebase Cloud Functions (Node.js runtime)

## 3. Data Schema (Firestore)

### Collection: `users`
```typescript
interface UserDocument {
  uid: string;           // Firebase Auth ID
  displayName: string;
  email: string;
  avatarUrl: string;
  createdAt: Timestamp;
  settings: {
    theme: 'void' | 'light';
    defaultConfidenceThreshold: number;
  };
}
```

### Collection: `workspaces` (Sub-collection of Users or Root)
```typescript
interface Workspace {
  id: string;
  ownerId: string;
  name: string;      // e.g., "React Utils", "Backend Logic"
  collaborators: string[]; // UIDs
}
```

### Collection: `patterns`
```typescript
interface PatternDocument {
  id: string;
  workspaceId: string; // Foreign Key
  authorId: string;
  
  // Core Data
  name: string;
  type: 'FUNCTION' | 'CLASS' | 'HOOK' | 'UTILITY' | 'COMPONENT';
  description: string;
  code: string;        // The raw source
  
  // Metadata
  tags: string[];
  complexity: number;
  confidence: number;
  sovereignRating: 'STABLE' | 'VOLATILE' | 'CRITICAL';
  usageDocs: string;
  
  // Analysis Data
  astData: Map<string, any>; // Stored as JSON object
  
  // Vector Embeddings (For Semantic Search)
  embedding: number[]; // 768-dim vector from Gemini
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## 4. Security Rules (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // User Profiles: Public read, Owner write
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Patterns: Read if in workspace, Write if owner
    match /patterns/{patternId} {
      allow read: if resource.data.authorId == request.auth.uid 
                  || request.auth.uid in resource.data.collaborators;
      allow write: if request.auth.uid != null;
    }
  }
}
```

## 5. Cloud Functions (Server-Side Logic)

### `onPatternCreate`
*   **Trigger**: Firestore Create
*   **Action**: 
    1.  Call Gemini API to generate Vector Embedding for `description` + `code`.
    2.  Update document with `embedding` field.
    3.  Sanitize AST data if too large.

### `performNeuralMine` (Callable Function)
*   **Input**: `{ topic: string, mode: 'SCOUT' }`
*   **Action**:
    1.  Securely call Gemini API (Key hidden on server).
    2.  Process/Parse response.
    3.  Return structured patterns to client.
    4.  (Optional) Auto-save to a "Drafts" collection.

## 6. Migration Strategy
1.  **Refactor Services**: Move `geminiService.ts` calls to Cloud Functions to protect API Keys.
2.  **State Management**: Replace `useState` with a React Context wrapping Firebase listeners (`onSnapshot`).
3.  **Sync Logic**: Implement offline-persistence so the Miner works without internet (syncs when online).

---
*Implementation Pending Approval.*
