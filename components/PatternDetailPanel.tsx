import React, { useEffect, useState } from 'react';
import { CodePattern, ASTNode } from '../types';
import { PatternLinkRenderer } from './PatternCard';
import { ASTVisualizer } from './ASTVisualizer';
import { fetchASTFromPhantomStorage } from '../services/phantomStorage';
import { X, Copy, Tag, Code2, FileText, Share2, Loader2, Anchor, Edit3, ShieldAlert, Cpu } from 'lucide-react';
import { fixerAgent } from '../services/intelligence/FixerAgent';

interface PatternDetailPanelProps {
  selected: CodePattern | null;
  onClose: () => void;
  allPatternNames: string[];
  onLinkClick: (name: string) => void;
  onUpdatePattern?: (pattern: CodePattern) => void;
}

export const PatternDetailPanel: React.FC<PatternDetailPanelProps> = ({
  selected,
  onClose,
  allPatternNames,
  onLinkClick,
  onUpdatePattern
}) => {
  const [ast, setAst] = useState<ASTNode | null>(null);
  const [isLoadingAST, setIsLoadingAST] = useState<boolean>(false);
  const [astError, setAstError] = useState<string | null>(null);

  const [isAdjudicating, setIsAdjudicating] = useState(false);

  const [rationale, setRationale] = useState('');
  const [isFixing, setIsFixing] = useState(false);
  const [escrowRationale, setEscrowRationale] = useState('');



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


         {/* Sovereign Fixer Section */}
         {(selected.sovereignRating === 'CRITICAL' || selected.sovereignRating === 'VOLATILE') && !selected.epistemicEscrow && (
            <div className="bg-red-900/10 border border-red-500/30 rounded p-4 flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <ShieldAlert className="text-red-500" size={20} />
                  <div>
                     <div className="text-xs font-bold text-red-500 font-mono">HIGH COMPLEXITY DETECTED</div>
                     <div className="text-[10px] text-tertiary font-mono">Thermodynamic reduction recommended.</div>
                  </div>
               </div>
               <button
                  onClick={async () => {
                     setIsFixing(true);
                     try {
                        const fixedPattern = await fixerAgent.proposeFix(selected);
                        if (onUpdatePattern) onUpdatePattern(fixedPattern);
                     } catch (e) {
                        console.error(e);
                     } finally {
                        setIsFixing(false);
                     }
                  }}
                  disabled={isFixing}
                  className="px-4 py-2 bg-red-500/20 text-red-400 text-xs font-mono font-bold border border-red-500/50 rounded hover:bg-red-500 hover:text-black transition-colors flex items-center gap-2"
               >
                  {isFixing ? <Loader2 className="animate-spin" size={14} /> : <Cpu size={14} />}
                  TRIGGER SOVEREIGN FIXER
               </button>
            </div>
         )}

         {/* Epistemic Escrow Section */}
         {selected.epistemicEscrow && selected.epistemicEscrow.status === 'PENDING' && (
            <section className="bg-surface-light p-4 rounded border-2 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.1)] relative">
               <div className="flex items-center gap-2 mb-4 text-purple-400">
                  <Cpu size={16} />
                  <h3 className="text-sm font-bold font-mono uppercase tracking-wider">EPISTEMIC ESCROW: PARACONSISTENT TENSION</h3>
               </div>

               <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-surface border border-red-500/30 rounded">
                     <div className="text-[10px] font-mono text-red-400 mb-2 border-b border-red-500/30 pb-1">ORIGINAL (MESSY HUMAN CONTEXT)</div>
                     <div className="text-xl font-bold text-primary mb-2">C: {selected.complexity}</div>
                     <pre className="text-[10px] text-secondary font-mono overflow-x-auto max-h-32">
                        {selected.code}
                     </pre>
                  </div>
                  <div className="p-3 bg-surface border border-neon-cyan/30 rounded">
                     <div className="text-[10px] font-mono text-neon-cyan mb-2 border-b border-neon-cyan/30 pb-1">PROPOSED (THERMODYNAMIC REDUCTION)</div>
                     <div className="text-xl font-bold text-primary mb-2">C: {selected.epistemicEscrow.proposedComplexity}</div>
                     <pre className="text-[10px] text-secondary font-mono overflow-x-auto max-h-32">
                        {selected.epistemicEscrow.proposedCode}
                     </pre>
                  </div>
               </div>

               <div className="animate-in slide-in-from-top-2">
                  <textarea
                     value={escrowRationale}
                     onChange={(e) => setEscrowRationale(e.target.value)}
                     className="w-full bg-surface border border-yellow-500/30 rounded p-2 text-xs font-mono text-primary focus:outline-none focus:border-yellow-500 resize-none mb-2"
                     placeholder="Enter empirical rationale for overriding AI..."
                     rows={2}
                  />
                  <div className="flex justify-end gap-2">
                     <button
                        onClick={() => {
                           const updatedPattern = {
                              ...selected,
                              code: selected.epistemicEscrow!.proposedCode,
                              complexity: selected.epistemicEscrow!.proposedComplexity,
                              sovereignRating: 'STABLE',
                              epistemicEscrow: {
                                 ...selected.epistemicEscrow!,
                                 status: 'RESOLVED_ACCEPTED' as const
                              },
                              goldenScar: {
                                  adjudicator: 'root',
                                  rationale: escrowRationale || "AI Reduction accepted as structurally sound.",
                                  tensionWeight: 1.0,
                                  timestamp: new Date().toISOString()
                              }
                           };
                           if (onUpdatePattern) onUpdatePattern(updatedPattern);
                        }}
                        className="px-3 py-1 text-xs font-mono bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 rounded hover:bg-neon-cyan hover:text-black transition-colors"
                     >
                        ACCEPT FIX (AI DOMINANT)
                     </button>
                     <button
                        onClick={() => {
                           const updatedPattern = {
                              ...selected,
                              epistemicEscrow: {
                                 ...selected.epistemicEscrow!,
                                 status: 'RESOLVED_REJECTED' as const
                              },
                              goldenScar: {
                                  adjudicator: 'root',
                                  rationale: escrowRationale,
                                  tensionWeight: 1.618,
                                  timestamp: new Date().toISOString()
                              }
                           };
                           if (onUpdatePattern) onUpdatePattern(updatedPattern);
                        }}
                        className="px-3 py-1 text-xs font-mono bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 rounded hover:bg-yellow-500 hover:text-black transition-colors"
                        disabled={!escrowRationale.trim()}
                     >
                        RESOLVE (HUMAN DOMINANT Φ=1.618)
                     </button>
                  </div>
               </div>
            </section>
         )}

         {/* Golden Scar / Human Adjudication Section */}
         <section className="bg-surface-light p-4 rounded border border-border-subtle relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
               <div className="flex items-center gap-2 text-yellow-500">
                  <Anchor size={16} />
                  <h3 className="text-sm font-bold font-mono uppercase tracking-wider">Golden Scar Protocol</h3>
               </div>
               {selected.goldenScar && (
                  <span className="text-[10px] font-mono bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded">
                     ϕ=1.618 APPLIED
                  </span>
               )}
            </div>

            {selected.goldenScar ? (
               <div className="mt-2 pl-4 border-l-2 border-yellow-500">
                  <div className="text-xs font-mono text-tertiary mb-1">
                     By: {selected.goldenScar.adjudicator} | {new Date(selected.goldenScar.timestamp).toLocaleString()}
                  </div>
                  <p className="text-sm text-secondary font-sans italic">"{selected.goldenScar.rationale}"</p>
               </div>
            ) : (
               <div className="mt-2">
                  {!isAdjudicating ? (
                     <div className="flex justify-between items-center">
                        <p className="text-xs text-tertiary font-mono">No paraconsistent tension injected. AI stochastic output unverified.</p>
                        <button
                           onClick={() => setIsAdjudicating(true)}
                           className="text-xs flex items-center gap-1 text-yellow-500 hover:text-yellow-400 font-mono tracking-wider transition-colors"
                        >
                           <Edit3 size={12} /> INJECT SCAR
                        </button>
                     </div>
                  ) : (
                     <div className="animate-in slide-in-from-top-2 duration-200">
                        <textarea
                           value={rationale}
                           onChange={(e) => setRationale(e.target.value)}
                           className="w-full bg-surface border border-yellow-500/30 rounded p-2 text-xs font-mono text-primary focus:outline-none focus:border-yellow-500 resize-none mb-2"
                           placeholder="Enter empirical governance rationale to anchor AI output..."
                           rows={3}
                        />
                        <div className="flex justify-end gap-2">
                           <button
                              onClick={() => { setIsAdjudicating(false); setRationale(''); }}
                              className="px-3 py-1 text-xs font-mono text-tertiary hover:text-secondary transition-colors"
                           >
                              CANCEL
                           </button>
                           <button
                              onClick={() => {
                                 const updatedPattern = {
                                    ...selected,
                                    goldenScar: {
                                        adjudicator: 'root',
                                        rationale: rationale,
                                        tensionWeight: 1.618,
                                        timestamp: new Date().toISOString()
                                    }
                                 };
                                 if (onUpdatePattern) {
                                     onUpdatePattern(updatedPattern);
                                 }
                                 setIsAdjudicating(false);
                              }}
                              className="px-3 py-1 text-xs font-mono bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 rounded hover:bg-yellow-500 hover:text-black transition-colors"
                              disabled={!rationale.trim()}
                           >
                              APPLY ϕ=1.618
                           </button>
                        </div>
                     </div>
                  )}
               </div>
            )}
         </section>

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
