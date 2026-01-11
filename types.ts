export enum PatternType {
  FUNCTION = 'FUNCTION',
  CLASS = 'CLASS',
  HOOK = 'HOOK',
  UTILITY = 'UTILITY',
  COMPONENT = 'COMPONENT'
}

export interface ASTNode {
  name: string;
  type: string;
  children?: ASTNode[];
  value?: string | number;
}

export interface CodePattern {
  id: string;
  name: string;
  type: PatternType;
  description: string;
  code: string;
  complexity: number; // 1-10
  tags: string[];
  ast: ASTNode;
  confidence: number;
  sovereignRating: string; // "STABLE", "VOLATILE", "CRITICAL"
  usageDocs: string;
  origin: 'USER_INPUT' | 'NEURAL_MINE';
}

export interface MiningSession {
  id: string;
  status: 'IDLE' | 'SCANNING' | 'ANALYZING' | 'COMPLETED' | 'FAILED';
  progress: number;
  logs: string[];
  patternsFound: number;
}
