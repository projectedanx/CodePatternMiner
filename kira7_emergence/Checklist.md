# KIRA-7 Implementation & Verification Checklist

This checklist guarantees the rigorous implementation of KIRA-7's agentic features, adhering to the required domain invariants and preventing Semantic Saponification.

## Phase 1: Ingress Security (Zero-Trust Webhook)
- [ ] **URL Verification Challenge**: Is the ingress route actively intercepting `type: "url_verification"` and returning the challenge string immediately?
- [ ] **Payload Decryption**: Is AES-256-CBC decryption implemented for payloads where `req.body.encrypt` is present (using `LARK_ENCRYPT_KEY`)?
- [ ] **Signature Verification**: Is the `X-Lark-Signature` header validated against `SHA256(timestamp + nonce + encrypt_key + raw_body)`?
- [ ] **Replay Protection**: Is the request timestamp checked against the current server time to reject requests older than 300 seconds?
- [ ] **Raw Body Parsing**: Have you ensured that signature verification uses the *raw* request body string, not the parsed JSON object?

## Phase 2: Token Primacy & State Management
- [ ] **Token Caching Layer**: Is the `tenant_access_token` cached (Redis or in-memory) with a TTL no greater than 6900 seconds?
- [ ] **Cache Intercept**: Does the application check the cache *before* calling `POST /auth/v3/tenant_access_token/internal`?
- [ ] **No Hardcoded Tokens**: Are you certain no tokens (`tenant_access_token`, `app_access_token`) are hardcoded as static strings in the repository?

## Phase 3: Card JSON Generation & Validation
- [ ] **Two-Pass Generation**: When outputting a Feishu Message Card, is the generation split into High-Entropy Draft and Zero-Entropy Guard phases?
- [ ] **Schema Compliance**: Does the generated JSON strictly adhere to `Feishu Card JSON v2.0` schema (e.g., `msg_type: "interactive"`)?
- [ ] **No MS Adaptive Cards**: Are you actively preventing the output of Microsoft Adaptive Card schema?

## Phase 4: Persona & Operational Discipline
- [ ] **Petzold Loop Constraints**: Are the phase markers (`[THINK PHASE]`, `[WRITE PHASE]`, `[CODE PHASE]`, `[IMMUNE REVIEW]`) explicitly used in interactions?
- [ ] **Code Sterility**: Is the output generated during the `[CODE PHASE]` completely sterile, free of persona commentary, and PEP-8/ESLint compliant?
- [ ] **Scope Declaration Mandate**: Does every generated workflow include a Scope Declaration Block detailing the required developer console permissions?
- [ ] **Vague Requirements Gate**: Have you implemented the lattice of refusal to stop execution and request clarification if event triggers, scopes, app type, or deployment environment are not explicitly stated?
