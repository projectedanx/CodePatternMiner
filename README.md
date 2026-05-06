# The Code Pattern Miner // SCOS-v5.0

> **Operationalizing Context Engineering.**  
> *Treating code not as text, but as a structured database of logic.*

![Version](https://img.shields.io/badge/SCOS-v5.0-neon_cyan)
![Status](https://img.shields.io/badge/System-SOVEREIGN-signal_green)
![Tech](https://img.shields.io/badge/Stack-React_D3_Gemini-void)

## 0. Teleology (The "Why")

Traditional coding assistants are "vibe coders"—probabilistic text generators that guess syntax. **The Code Pattern Miner** is a **Context Engineering Protocol**.

It leverages the complementary strengths of:
1.  **Deterministic Static Analysis**: Precise AST (Abstract Syntax Tree) parsing for structure.
2.  **Probabilistic Semantic AI**: Google Gemini models for meaning, rating, and documentation.

The goal is to move from "generating code from scratch" to "mining and assembling verified logic components" (The Verified Lego Set).

## 1. Core Architecture

The system operates on three primary layers:

### Layer 1: The Neural Scout (Ingestion)
*   **Manual Injection**: Users input raw code; the system extracts reusable patterns.
*   **Neural Mining**: Users query a topic (e.g., "Redux Authentication"); the AI hallucinates/retrieves "Platonic Ideal" implementations from its training set.

### Layer 2: The Sovereign Filter (Validation)
*   **Cyclomatic Complexity Analysis**: Scores logic density (1-10).
*   **Sovereign Rating**: Classifies code as `STABLE`, `VOLATILE`, or `CRITICAL`.
*   **AST Topology**: Visualizes the shape of logic using D3.js force-directed trees.

### Layer 3: The Component Catalog (Storage)
*   **Semantic Linking**: Descriptions and docs automatically hyperlink to other known patterns in the library.
*   **Context Injection**: Export verified patterns directly into active development workflows.

## 2. Tech Stack

*   **Frontend**: React 19 (ESM), Tailwind CSS
*   **Visualization**: D3.js (Interactive AST Navigation)
*   **Intelligence**: Google Gemini 1.5/2.0 Flash & Pro (via `@google/genai`)
*   **Styling**: Lucide React + Custom "Void/Neon" Aesthetic

## 3. Installation & Boot Sequence

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/your-org/code-pattern-miner.git
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    Create a `.env` file in the root.
    ```env
    API_KEY=your_google_gemini_api_key
    ```

4.  **Initiate Kernel**:
    ```bash
    npm start
    ```

## 4. Operation Guide

### The Mining Dashboard
*   **Manual Mode**: Paste a messy file. The system dissects it into Functions, Classes, and Hooks.
*   **Scout Mode**: Ask for "High performance debounce utility". The system generates 3 variations.

### The Golden Scar Protocol (Human Adjudication)
*   **Paraconsistent Tension:** A physical embodiment of the Golden Ratio (ϕ=1.618). AI stochastic generation is assigned a weight of 1.0, while human empirical governance (the "Scar") is assigned 1.618.
*   **Adjudication UI:** Humans can inject contextual rationale into AI-mined patterns directly from the UI, overriding "Algorithmic Shame" and ensuring true project alignment without collapsing the underlying logic.

### The Catalog
*   **Filter**: Sort by Confidence, Type, or Sovereign Rating.
*   **Inspect**: Click any card to open the "Context Slide-over".
*   **Visualize**: Use the interactive AST map to understand the branching logic before you read the code.

---

**Architected by SCOS-KERNEL-v5.0 // Strategos**
*Metabolizing entropy into sovereign execution.*

## 5. Development & Contribution

### Available Scripts

In the project directory, you can run:

*   **`npm run dev`**: Runs the app in development mode using Vite. Open [http://localhost:5173](http://localhost:5173) to view it in the browser.
*   **`npm run build`**: Builds the app for production to the `dist` folder.
*   **`npm run preview`**: Locally preview the production build.

### Documentation Standard

We mandate strict documentation standards for the SCOS-v5.0 Kernel. All exported interfaces, functions, and components must feature comprehensive JSDoc annotations detailing their purpose, arguments, return values, and potential exceptions.

### Troubleshooting Setup

If you encounter issues during the setup phase:

1.  **Missing API Key**: Ensure `.env` contains `API_KEY=your_key` exactly. If the key is invalid, the `scoutPatterns` neural generation will fail silently or log an access error in the console.
2.  **Node Version**: We recommend Node.js v18+.
3.  **Dependency Conflicts**: Run `rm -rf node_modules package-lock.json && npm install` if local module resolutions fail.

### Topological Causal Sculpting (VULCAN)
### Visual Intent & Physical Execution Router (VIPER)
*   **Analytic-to-Generative Inversion**: VIPER bridges the 'Semiotic Gap' by serving as a ruthless translation layer between vague human visual intent and precise, physics-grounded Optical State Matrices.
*   **Positive Friction**: To prevent Semantic Saponification, VIPER actively rejects adjectival modifiers and demands hardware-grounded constraints (HGI) before allowing generation logic to proceed.

*   **Vector-Unified Validation**: Architectural models undergo rigorous validation using VULCAN's Antifragile Epistemic Weaver (AEW) to prevent Semantic Saponification and distributed monolith anti-patterns.
*   **Strict Mereological Boundaries**: Transitivity of state and data contracts is mathematically restricted, enforcing Domain-Driven Design principles prior to codebase implementation.
