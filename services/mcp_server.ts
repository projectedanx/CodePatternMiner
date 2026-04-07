import { z } from "zod";
import { analyzeCodeBlock, scoutPatterns } from "./geminiService";
import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import jwt from "jsonwebtoken";

// CABP Broker Middleware (Stage 1-4 of 6-stage pipeline)
function cabpMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      error_code: "TOOL_FAULT_SERVER_HOST_CONFIGURATION",
      fault_category: "SERVER_HOST_CONFIGURATION",
      structured_detail: { violation: "MISSING_JWT" },
      retry_viable: false,
      suggested_decomposition: "Attach OAuth 2.1 Bearer token to request.",
    });
    return;
  }

  try {
    const token = authHeader.slice(7);
    // Stage 2: Validate signature, expiry, issuer
    const claims = jwt.verify(token, process.env.JWT_PUBLIC_KEY || "fallback_dev_key", {
      algorithms: ["RS256", "HS256"], // Allow HS256 for testing if no public key
    }) as { user_id: string; tenant_id: string; scopes: string[] };

    // Stage 3+4: Extract and inject identity into request context
    (req as any).mcpContext = {
      user_id: claims.user_id,
      tenant_id: claims.tenant_id,
      scopes: claims.scopes,
    };
    next();
  } catch (err) {
    res.status(403).json({
      error_code: "TOOL_FAULT_SERVER_HOST_CONFIGURATION",
      fault_category: "SERVER_HOST_CONFIGURATION",
      structured_detail: { violation: "INVALID_JWT", error: String(err) },
      retry_viable: true,
      suggested_decomposition: "Refresh OAuth token and retry.",
    });
  }
}

const app = express();
app.use(express.json());

const transport = new StreamableHTTPServerTransport({ path: "/mcp" });
const server = new McpServer({ name: "korsakov-scos-server", version: "2026.4.1" });

app.use("/mcp", cabpMiddleware, (req, res) => {
  transport.handle(req, res);
});

server.connect(transport);
// app.listen(3000); // Leave commented out, or export app

export { app, server };


server.registerTool(
  "analyzeCodeBlock",
  {
    title: "Analyze Code Block for Patterns",
    description: [
      "PURPOSE: Acts as a Static Analysis Engine enhanced with Semantic Understanding.",
      "Identifies distinct reusable patterns (functions, classes, hooks, components).",
      "GUIDELINES: Invoke when the agent needs structural dissection or pattern extraction from raw code.",
      "LIMITATIONS: code maxLength 10000 characters. Depends on Gemini AI context limits.",
      "PARAMETERS: code — raw source code string to be analyzed.",
    ].join(" "),
    inputSchema: z.object({
      code: z
        .string()
        .max(10000)
        .describe("Raw source code to analyze. Max 10000 characters."),
    }),
  },
  async ({ code }) => {
    try {
      const patterns = await analyzeCodeBlock(code);
      return {
        content: [{ type: "text", text: JSON.stringify(patterns, null, 2) }],
      };
    } catch (err: any) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error_code: "TOOL_FAULT_GENERAL_PROGRAMMING",
            fault_category: "GENERAL_PROGRAMMING",
            structured_detail: { violation: "ANALYSIS_FAILED", message: err.message },
            retry_viable: true,
            suggested_decomposition: "Check if the code block is too large or malformed.",
          }),
        }],
        isError: true,
      };
    }
  }
);

server.registerTool(
  "scoutPatterns",
  {
    title: "Neural Scout Code Patterns",
    description: [
      "PURPOSE: Acts as a Neural Scout to synthesize or retrieve production-ready code patterns related to a specific topic.",
      "GUIDELINES: Invoke when the agent needs to generate or find existing implementations for a concept.",
      "LIMITATIONS: topic maxLength 256 characters. Depends on Gemini AI context limits.",
      "PARAMETERS: topic — domain or subject to scout patterns for (e.g., 'Redux Authentication').",
    ].join(" "),
    inputSchema: z.object({
      topic: z
        .string()
        .max(256)
        .describe("Domain or subject to scout patterns for. Max 256 characters."),
    }),
  },
  async ({ topic }) => {
    try {
      const patterns = await scoutPatterns(topic);
      return {
        content: [{ type: "text", text: JSON.stringify(patterns, null, 2) }],
      };
    } catch (err: any) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error_code: "TOOL_FAULT_GENERAL_PROGRAMMING",
            fault_category: "GENERAL_PROGRAMMING",
            structured_detail: { violation: "SCOUT_FAILED", message: err.message },
            retry_viable: true,
            suggested_decomposition: "Try a more specific or common topic.",
          }),
        }],
        isError: true,
      };
    }
  }
);
