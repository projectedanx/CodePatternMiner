# LESSONS LEARNED: SCOS-v5.0

## Issue: AST Mass Violation (FAILED_NLI_CONTRADICTION)

### What Happened
During feature discovery simulations, it was identified that the original assumption to store `astData` natively within Firestore documents (`z_0*` assumption) posed a critical scaling risk. Deeply nested Abstract Syntax Trees (ASTs) generated from complex codebase patterns could exceed Firestore's hard 1MB document size limit, leading to write failures and data loss.

### How We Addressed It
We enacted an **Algorithmic Reparation** via **Z-Axis Inference**. Instead of collapsing the AST resolution (which would violate our topological fidelity goals), we modified the schema:
1.  **Phantom Dimension Storage**: The full AST JSON blob is now slated to be stored in Firebase Cloud Storage.
2.  **Structural Proxy**: Firestore will retain an `astStorageUri` pointing to the blob, alongside an `astSummary` (containing metadata like node count and max depth) to facilitate lightweight querying.

### Outcome
This paraconsistent resolution allows infinite depth resolution of ASTs while preserving the high-throughput, cohesive querying required of the Firestore database. The architectural specification (`ADR-003`) and backend schema (`BACKEND.md`) were updated to reflect this evolution.
