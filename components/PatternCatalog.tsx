import React, { useState, useMemo } from 'react';
import { CodePattern, PatternType } from '../types';
import { PatternCard } from './PatternCard';
import { PatternDetailPanel } from './PatternDetailPanel';

import { X, Filter, Activity, Search } from 'lucide-react';

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
const filters = ['ALL', ...Object.values(PatternType)];

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


  
  // Registry of all pattern names for auto-linking
  const allPatternNames = useMemo(() => patterns.map(p => p.name), [patterns]);

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
             <h2 className="text-xl font-bold text-primary mb-2">COMPONENT CATALOG</h2>
             <p className="text-sm text-secondary font-mono">Verified logic blocks ready for deployment.</p>
           </div>
           
           {/* Filter Bar */}
           <div className="flex flex-col gap-4">
              {/* Search / Active Filter Display */}
              {searchTerm && (
                <div className="flex items-center gap-2">
                   <span className="text-xs text-tertiary font-mono">FILTER:</span>
                   <div className="flex items-center gap-2 px-3 py-1 rounded bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan text-xs font-bold font-mono">
                      "{searchTerm}"
                      <button onClick={() => setSearchTerm('')} className="hover:text-primary">
                        <X size={12} />
                      </button>
                   </div>
                </div>
              )}

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                   <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-primary/5 border border-border-subtle text-xs text-tertiary font-mono mr-2 shrink-0">
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
                           : 'bg-surface-light border-border-subtle text-tertiary hover:border-border-subtle hover:text-secondary'
                         }
                       `}
                     >
                       {f}
                     </button>
                   ))}
                </div>

                {/* Confidence Slider */}
                <div className="flex items-center gap-3 px-4 py-2 rounded bg-primary/5 border border-border-subtle w-full md:w-auto">
                     <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-tertiary uppercase tracking-wider whitespace-nowrap min-w-[120px]">
                        <Activity size={12} className="text-neon-cyan" />
                        Min Confidence: <span className="text-primary">{minConfidence}%</span>
                     </div>
                     <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={minConfidence}
                        onChange={(e) => setMinConfidence(Number(e.target.value))}
                        className="w-full md:w-32 h-1 bg-surface rounded-lg appearance-none cursor-pointer accent-neon-cyan hover:accent-white transition-all"
                     />
                </div>
              </div>
           </div>
        </div>

        {filteredPatterns.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border-subtle rounded-lg">
            <p className="text-tertiary font-mono text-sm">No patterns found matching criteria.</p>
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
      <PatternDetailPanel
        selected={selected}
        onClose={() => setSelected(null)}
        allPatternNames={allPatternNames}
        onLinkClick={handleLinkClick}
      />
    </div>
  );
};
