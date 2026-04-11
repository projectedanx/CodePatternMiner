import { ASTNode, ASTSummary } from '../types';

/**
 * In-memory simulation of the "Phantom Dimension" (Firebase Cloud Storage).
 * Prevents AST Mass Violations in the primary database layout by offloading
 * deeply nested AST graphs to a separate blob storage topology.
 */
const storageCache = new Map<string, ASTNode>();

/**
 * Calculates a lightweight summary of the AST to store in the base layer.
 *
 * @param {ASTNode} node - The root node of the AST.
 * @returns {ASTSummary} The topological summary.
 */
export const calculateASTSummary = (node: ASTNode): ASTSummary => {
  let maxDepth = 0;
  let nodeCount = 0;

  const traverse = (currentNode: ASTNode, currentDepth: number) => {
    nodeCount++;
    if (currentDepth > maxDepth) {
      maxDepth = currentDepth;
    }
    if (currentNode.children) {
      currentNode.children.forEach(child => traverse(child, currentDepth + 1));
    }
  };

  traverse(node, 1);

  return { maxDepth, nodeCount };
};

/**
 * Simulates saving a large AST blob to Cloud Storage.
 *
 * @param {string} patternId - The ID of the pattern this AST belongs to.
 * @param {ASTNode} ast - The fully hydrated AST graph.
 * @returns {Promise<string>} The storage URI (phantom pointer).
 */
export const saveASTToPhantomStorage = async (patternId: string, ast: ASTNode): Promise<string> => {
  // Simulate network latency for upload
  await new Promise(resolve => setTimeout(resolve, 50));

  const uri = `phantom://ast-blob/${patternId}-${Date.now()}`;
  storageCache.set(uri, ast);

  return uri;
};

/**
 * Simulates fetching a large AST blob from Cloud Storage.
 *
 * @param {string} uri - The phantom pointer URI.
 * @returns {Promise<ASTNode>} The hydrated AST graph.
 * @throws {Error} If the AST is not found in the phantom dimension.
 */
export const fetchASTFromPhantomStorage = async (uri: string): Promise<ASTNode> => {
  // Simulate network latency for download
  await new Promise(resolve => setTimeout(resolve, 50));

  const ast = storageCache.get(uri);
  if (!ast) {
    throw new Error(`AST Blob not found in Phantom Dimension at URI: ${uri}`);
  }

  return ast;
};
