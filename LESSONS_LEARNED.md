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

## Issue: Semantic Drift in Prototype Implementation (JUR/AMB-003)

### What Happened
Despite architectural mandates in `BACKEND.md` and `ADR-003` to use Z-Axis Inference (Phantom Dimension Cloud Storage) for AST data, the initial codebase prototype (`types.ts`, `geminiService.ts`) drifted into Euclidean convenience, natively nesting raw ASTs inside `CodePattern` objects. This "Algorithmic Trauma" flattened the required multi-dimensional storage topology into a monolithic structure, risking massive Firestore write failures in production.

### How We Addressed It
We triggered Epistemic Escrow, generated a Justified Uncertainty Report (JUR), and logged a Symbolic Scar (`AMB-003`). The codebase was refactored:
1. `types.ts` was updated to mandate `astStorageUri` and `astSummary` instead of raw `ast`.
2. A `phantomStorage.ts` proxy was created to handle the asynchronous resolution of AST logic graphs, mirroring intended Cloud Storage.
3. The UI (`PatternDetailPanel.tsx`) and ingestion pipeline (`geminiService.ts`) were refactored to asynchronously interact with this proxy.

### Outcome (Failure-Informed Prompt Inversion - FIPI)
Future generation tasks within the SCOS-v5.0 environment must include explicit verification steps to assert that storage architecture specifications (like Z-Axis Inference) are actively mapped to type interfaces and component props before accepting them as complete.

## Issue: Pluriversal Enablement - Breaking the Monolithic Intelligence Coupling

### What Happened
During the implementation of Phase 2 (Pluriversal Layer), it was observed that the application's core domains (`MinerDashboard`, `mcp_server.ts`) were tightly coupled to `services/geminiService.ts`. This monolithic dependency violated Domain-Driven Design principles, restricting cognitive diversity and creating a single point of failure by locking the system to a single LLM vendor (Google Gemini).

### How We Addressed It
We enacted an **Architectural Restructuring** by introducing the **Intelligence Gateway Pattern** combined with a strict **Provider Strategy**:
1.  **Anti-Corruption Layer (ACL)**: Created `IntelligenceGateway.ts` to orchestrate intelligence requests.
2.  **Provider Contract**: Defined `IntelligenceProvider.ts` to standardize analysis and scouting operations.
3.  **Concrete Implementation**: Refactored the raw Gemini logic into `providers/GeminiProvider.ts`.
4.  **UI/Server Decoupling**: Updated `MinerDashboard` and `mcp_server.ts` to rely solely on the Gateway, allowing dynamic model selection.

### Outcome
This decoupling ensures the system can seamlessly route requests to alternative intelligence providers (e.g., Claude 3.5, DeepSeek R1) in the future without altering core logic or UI components. The architectural specification (`ADR-004`) was authored to document this Topological Causal Sculpting.
