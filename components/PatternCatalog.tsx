import React, { useState } from 'react';
import { CodePattern, PatternType } from '../types';
import { PatternCard, PatternLinkRenderer } from './PatternCard';
import { ASTVisualizer } from './ASTVisualizer';
import { X, Copy, Tag, Code2, FileText, Share2, Filter, Activity, Search } from 'lucide-react';

/**
 * Properties required by the PatternCatalog component.
 *
 * @property {CodePattern[]} patterns - The full collection of mined code patterns available for display.
 */
interface PatternCatalogProps {
  patterns: CodePattern[];
}

/**
 * The component library interface that displays all successfully mined patterns.
 * Supports advanced filtering, search, and detailed inspection of individual patterns via a slide-over panel.
 *
 * @param {PatternCatalogProps} props - The configuration props for the catalog view.
 * @returns {React.ReactElement} The rendered catalog interface.
 */
export const PatternCatalog: React.FC<PatternCatalogProps> = ({ patterns }) => {
  const [selected, setSelected] = useState<CodePattern | null>(null);
  const [filter, setFilter] = useState<PatternType | 'ALL'>('ALL');
  const [minConfidence, setMinConfidence] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredPatterns = patterns.filter(p => 
    (filter === 'ALL' || p.type === filter) && 
    (p.confidence * 100 >= minConfidence) &&
    (searchTerm === '' || p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filters = ['ALL', ...Object.values(PatternType)];
  
  // Registry of all pattern names for auto-linking
  const allPatternNames = patterns.map(p => p.name);

  const handleLinkClick = (name: string) => {
    // 1. Set the search term to filter the grid
    setSearchTerm(name);
    
    // 2. If a pattern with this name exists, select it immediately
    const targetPattern = patterns.find(p => p.name === name);
    if (targetPattern) {
      setSelected(targetPattern);
    } else {
      // If exact match not found (unlikely if logic is correct), just filter the grid
      setSelected(null);
    }
  };

  return (
    <div className="flex h-full relative">
      {/* Grid */}
      <div className={`flex-1 overflow-y-auto pr-4 transition-all duration-500 ${selected ? 'w-1/2' : 'w-full'}`}>
        <div className="mb-6 flex flex-col gap-4">
           <div>
             <h2 className="text-xl font-bold text-white mb-2">COMPONENT CATALOG</h2>
             <p className="text-sm text-gray-400 font-mono">Verified logic blocks ready for deployment.</p>
           </div>
           
           {/* Filter Bar */}
           <div className="flex flex-col gap-4">
              {/* Search / Active Filter Display */}
              {searchTerm && (
                <div className="flex items-center gap-2">
                   <span className="text-xs text-gray-500 font-mono">FILTER:</span>
                   <div className="flex items-center gap-2 px-3 py-1 rounded bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan text-xs font-bold font-mono">
                      "{searchTerm}"
                      <button onClick={() => setSearchTerm('')} className="hover:text-white">
                        <X size={12} />
                      </button>
                   </div>
                </div>
              )}

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                   <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-white/5 border border-white/10 text-xs text-gray-500 font-mono mr-2 shrink-0">
                      <Filter size={12} /> TYPE:
                   </div>
                   {filters.map(f => (
                     <button
                       key={f}
                       onClick={() => setFilter(f as PatternType | 'ALL')}
                       className={`
                         px-3 py-1.5 rounded text-[10px] font-mono font-bold tracking-wider transition-all border
                         ${filter === f 
                           ? 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan shadow-[0_0_10px_rgba(6,182,212,0.15)]' 
                           : 'bg-void-light border-white/5 text-gray-500 hover:border-white/20 hover:text-gray-300'
                         }
                       `}
                     >
                       {f}
                     </button>
                   ))}
                </div>

                {/* Confidence Slider */}
                <div className="flex items-center gap-3 px-4 py-2 rounded bg-white/5 border border-white/10 w-full md:w-auto">
                     <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]">
                        <Activity size={12} className="text-neon-cyan" />
                        Min Confidence: <span className="text-white">{minConfidence}%</span>
                     </div>
                     <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={minConfidence}
                        onChange={(e) => setMinConfidence(Number(e.target.value))}
                        className="w-full md:w-32 h-1 bg-void rounded-lg appearance-none cursor-pointer accent-neon-cyan hover:accent-white transition-all"
                     />
                </div>
              </div>
           </div>
        </div>

        {filteredPatterns.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-lg">
            <p className="text-gray-500 font-mono text-sm">No patterns found matching criteria.</p>
            {searchTerm && (
               <button onClick={() => setSearchTerm('')} className="mt-2 text-neon-cyan text-xs underline">Clear Search</button>
            )}
          </div>
        ) : (
          <div className={`grid gap-4 ${selected ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
            {filteredPatterns.map(p => (
              <PatternCard 
                key={p.id} 
                pattern={p} 
                onClick={setSelected}
                knownPatternNames={allPatternNames}
                onLinkClick={handleLinkClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Slide-over */}
      {selected && (
        <div className="w-[600px] border-l border-white/10 bg-void-light/95 backdrop-blur-xl absolute top-0 right-0 bottom-0 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 z-20 flex flex-col">
          
          <div className="p-6 border-b border-white/10 sticky top-0 bg-void-light/95 backdrop-blur z-30 flex justify-between items-start">
             <div>
                <div className="flex items-center gap-2 mb-2">
                   <span className="px-2 py-0.5 rounded bg-neon-cyan/10 text-neon-cyan text-[10px] font-mono border border-neon-cyan/20">
                     {selected.type}
                   </span>
                   <span className="text-[10px] font-mono text-gray-500">ID: {selected.id.slice(0,8)}</span>
                </div>
                <h2 className="text-2xl font-bold text-white font-mono">{selected.name}</h2>
                <div className="text-xs text-gray-400 mt-2 font-sans">
                  <PatternLinkRenderer 
                      text={selected.description} 
                      names={allPatternNames} 
                      onLinkClick={handleLinkClick}
                  />
                </div>
             </div>
             <button onClick={() => setSelected(null)} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white">
                <X size={20} />
             </button>
          </div>

          <div className="p-6 space-y-8 flex-1">
             
             {/* Stats Row */}
             <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-black/40 rounded border border-white/5">
                   <div className="text-[10px] text-gray-500 uppercase font-mono mb-1">Complexity</div>
                   <div className="text-xl font-bold text-white">{selected.complexity}<span className="text-gray-600 text-sm">/10</span></div>
                </div>
                <div className="p-3 bg-black/40 rounded border border-white/5">
                   <div className="text-[10px] text-gray-500 uppercase font-mono mb-1">Rating</div>
                   <div className={`text-xl font-bold ${selected.sovereignRating === 'STABLE' ? 'text-signal-green' : 'text-orange-400'}`}>
                      {selected.sovereignRating}
                   </div>
                </div>
                <div className="p-3 bg-black/40 rounded border border-white/5">
                   <div className="text-[10px] text-gray-500 uppercase font-mono mb-1">Confidence</div>
                   <div className="text-xl font-bold text-white">{(selected.confidence * 100).toFixed(0)}%</div>
                </div>
             </div>

             {/* AST Viz */}
             <section>
                <div className="flex items-center gap-2 mb-3 text-neon-purple">
                   <Share2 size={16} />
                   <h3 className="text-sm font-bold font-mono uppercase tracking-wider">Logic Topology (AST)</h3>
                </div>
                <ASTVisualizer data={selected.ast} width={550} height={300} />
             </section>

             {/* Code Block */}
             <section>
                <div className="flex items-center justify-between mb-3 text-neon-cyan">
                   <div className="flex items-center gap-2">
                      <Code2 size={16} />
                      <h3 className="text-sm font-bold font-mono uppercase tracking-wider">Source Logic</h3>
                   </div>
                   <button className="text-[10px] flex items-center gap-1 hover:text-white transition-colors">
                      <Copy size={10} /> COPY
                   </button>
                </div>
                <pre className="bg-black/50 p-4 rounded-lg border border-white/10 text-xs font-mono text-gray-300 overflow-x-auto">
                   <code>{selected.code}</code>
                </pre>
             </section>

             {/* Usage Docs */}
             <section>
                 <div className="flex items-center gap-2 mb-3 text-signal-green">
                   <FileText size={16} />
                   <h3 className="text-sm font-bold font-mono uppercase tracking-wider">Protocol Manual</h3>
                </div>
                <div className="bg-white/5 p-4 rounded-lg text-sm text-gray-300 leading-relaxed font-sans border-l-2 border-signal-green">
                   <PatternLinkRenderer 
                      text={selected.usageDocs} 
                      names={allPatternNames} 
                      onLinkClick={handleLinkClick}
                   />
                </div>
             </section>

             {/* Tags */}
             <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                {selected.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 text-xs text-gray-400 border border-white/5 font-mono">
                     <Tag size={10} /> {tag}
                  </span>
                ))}
             </div>
          </div>
          
          {/* Footer Actions */}
          <div className="p-4 border-t border-white/10 bg-black/20 sticky bottom-0">
             <button className="w-full py-3 bg-neon-cyan text-black font-bold font-mono text-sm rounded hover:bg-white hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">
                EXPORT COMPONENT
             </button>
          </div>
        </div>
      )}
    </div>
  );
};
