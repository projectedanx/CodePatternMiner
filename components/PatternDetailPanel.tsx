import React, { useEffect, useState } from 'react';
import { CodePattern, ASTNode } from '../types';
import { PatternLinkRenderer } from './PatternCard';
import { ASTVisualizer } from './ASTVisualizer';
import { fetchASTFromPhantomStorage } from '../services/phantomStorage';
import { X, Copy, Tag, Code2, FileText, Share2, Loader2 } from 'lucide-react';

interface PatternDetailPanelProps {
  selected: CodePattern | null;
  onClose: () => void;
  allPatternNames: string[];
  onLinkClick: (name: string) => void;
}

export const PatternDetailPanel: React.FC<PatternDetailPanelProps> = ({
  selected,
  onClose,
  allPatternNames,
  onLinkClick
}) => {
  const [ast, setAst] = useState<ASTNode | null>(null);
  const [isLoadingAST, setIsLoadingAST] = useState<boolean>(false);
  const [astError, setAstError] = useState<string | null>(null);

  useEffect(() => {
    if (selected?.astStorageUri) {
      setIsLoadingAST(true);
      setAstError(null);
      fetchASTFromPhantomStorage(selected.astStorageUri)
        .then(resolvedAst => setAst(resolvedAst))
        .catch(err => setAstError(err.message))
        .finally(() => setIsLoadingAST(false));
    } else {
      setAst(null);
    }
  }, [selected?.astStorageUri]);

  if (!selected) return null;

  return (
    <div className="w-[600px] border-l border-border-subtle bg-surface/95 backdrop-blur-xl absolute top-0 right-0 bottom-0 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 z-20 flex flex-col">

      <div className="p-6 border-b border-border-subtle sticky top-0 bg-surface/95 backdrop-blur z-30 flex justify-between items-start">
         <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="px-2 py-1 rounded bg-neon-cyan/10 text-neon-cyan text-xs font-mono border border-neon-cyan/20">
                 {selected.type}
               </span>
               <span className="text-xs font-mono text-secondary">ID: {selected.id.slice(0,8)}</span>
            </div>
            <h2 className="text-2xl font-bold text-primary font-mono">{selected.name}</h2>
            <div className="text-xs text-secondary mt-2 font-sans">
              <PatternLinkRenderer
                  text={selected.description}
                  names={allPatternNames}
                  onLinkClick={onLinkClick}
              />
            </div>
         </div>
         <button onClick={onClose} className="p-2 hover:bg-primary/10 rounded-full text-secondary hover:text-primary">
            <X size={20} />
         </button>
      </div>

      <div className="p-6 space-y-8 flex-1">

         {/* Stats Row */}
         <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-surface-light rounded border border-border-subtle">
               <div className="text-xs text-secondary uppercase font-mono mb-1">Complexity</div>
               <div className="text-xl font-bold text-primary">{selected.complexity}<span className="text-sm text-tertiary">/10</span></div>
            </div>
            <div className="p-4 bg-surface-light rounded border border-border-subtle">
               <div className="text-xs text-secondary uppercase font-mono mb-1">Rating</div>
               <div className={`text-xl font-bold ${selected.sovereignRating === 'STABLE' ? 'text-signal-green' : 'text-orange-400'}`}>
                  {selected.sovereignRating}
               </div>
            </div>
            <div className="p-4 bg-surface-light rounded border border-border-subtle">
               <div className="text-xs text-secondary uppercase font-mono mb-1">Confidence</div>
               <div className="text-xl font-bold text-primary">{(selected.confidence * 100).toFixed(0)}%</div>
            </div>
         </div>

         {/* AST Viz */}
         <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-neon-purple">
                 <Share2 size={16} />
                 <h3 className="text-sm font-bold font-mono uppercase tracking-wider">Logic Topology (AST)</h3>
              </div>
              {selected.astSummary && (
                <div className="text-xs font-mono text-secondary flex gap-4">
                  <span>Nodes: <span className="text-primary">{selected.astSummary.nodeCount}</span></span>
                  <span>Depth: <span className="text-primary">{selected.astSummary.maxDepth}</span></span>
                </div>
              )}
            </div>

            <div className="relative min-h-[300px] border border-border-subtle rounded-lg bg-surface-light overflow-hidden flex items-center justify-center">
              {isLoadingAST && (
                <div className="flex flex-col items-center gap-4 text-secondary">
                  <Loader2 size={24} className="animate-spin text-neon-purple" />
                  <span className="text-xs font-mono tracking-widest uppercase">Fetching Phantom Data...</span>
                </div>
              )}
              {astError && (
                <div className="text-red-400 text-xs font-mono bg-red-900/20 p-4 border border-red-900/50 rounded max-w-[80%] text-center">
                  Error resolving Z-Axis Inference: {astError}
                </div>
              )}
              {ast && !isLoadingAST && (
                <ASTVisualizer data={ast} width={550} height={300} />
              )}
            </div>
         </section>

         {/* Code Block */}
         <section>
            <div className="flex items-center justify-between mb-4 text-neon-cyan">
               <div className="flex items-center gap-2">
                  <Code2 size={16} />
                  <h3 className="text-sm font-bold font-mono uppercase tracking-wider">Source Logic</h3>
               </div>
               <button className="text-xs flex items-center gap-1 text-secondary hover:text-primary transition-colors">
                  <Copy size={10} /> COPY
               </button>
            </div>
            <pre className="bg-surface-light p-4 rounded-lg border border-border-subtle text-xs font-mono text-secondary overflow-x-auto">
               <code>{selected.code}</code>
            </pre>
         </section>

         {/* Usage Docs */}
         <section>
             <div className="flex items-center gap-2 mb-4 text-signal-green">
               <FileText size={16} />
               <h3 className="text-sm font-bold font-mono uppercase tracking-wider">Protocol Manual</h3>
            </div>
            <div className="bg-primary/5 p-4 rounded-lg text-sm text-secondary leading-relaxed font-sans border-l-2 border-signal-green">
               <PatternLinkRenderer
                  text={selected.usageDocs}
                  names={allPatternNames}
                  onLinkClick={onLinkClick}
               />
            </div>
         </section>

         {/* Tags */}
         <div className="flex flex-wrap gap-2 pt-4 border-t border-border-subtle">
            {selected.tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 px-4 py-1 rounded-full bg-primary/5 text-xs text-secondary border border-border-subtle font-mono">
                 <Tag size={10} /> {tag}
              </span>
            ))}
         </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border-subtle bg-surface-light sticky bottom-0">
         <button className="w-full py-4 bg-neon-cyan text-black font-bold font-mono text-sm rounded hover:bg-primary hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">
            EXPORT COMPONENT
         </button>
      </div>
    </div>
  );
};
