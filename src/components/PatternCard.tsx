import React, { useMemo } from 'react';
import { CodePattern } from '../types';
import { Box, Layers, Activity, ShieldCheck, ShieldAlert, Zap, Cpu, Tag, FileText, Anchor } from 'lucide-react';

/**
 * Properties required by the PatternCard component.
 *
 * @property {CodePattern} pattern - The main pattern data object to display.
 * @property {(pattern: CodePattern) => void} onClick - Callback fired when the card is clicked, passing the pattern.
 * @property {string[]} [knownPatternNames] - An optional array of known pattern names for linking within descriptions.
 * @property {(name: string) => void} [onLinkClick] - Optional callback fired when a recognized pattern name link is clicked.
 */
interface PatternCardProps {
  pattern: CodePattern;
  onClick: (pattern: CodePattern) => void;
  knownPatternNames?: string[];
  onLinkClick?: (name: string) => void;
}

/**
 * Escape special regex characters to ensure literal matching.
 *
 * @param {string} string - The string to escape.
 * @returns {string} The escaped string.
 */
const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Utility component that scans a block of text for known pattern names
 * and transforms them into interactive, clickable links.
 *
 * @param {Object} props - The component properties.
 * @param {string} props.text - The raw description or document string to be parsed.
 * @param {string[]} props.names - An array of pattern names that should be transformed into links.
 * @param {(name: string) => void} [props.onLinkClick] - Callback triggered when a highlighted pattern link is clicked.
 * @param {string} [props.className] - Optional CSS classes to apply to the wrapping element.
 * @returns {React.ReactElement} The text string with matched names rendered as interactive span elements.
 */
export const PatternLinkRenderer: React.FC<{
  text: string;
  names: string[];
  onLinkClick?: (name: string) => void;
  className?: string;
}> = ({ text, names, onLinkClick, className }) => {
  // Memoize the regex compilation and text splitting to avoid expensive operations on every render.
  // The dependencies ensure we only re-calculate if the text content or the list of names changes.
  // We call useMemo at the top level to comply with the Rules of Hooks.
  const parts = useMemo(() => {
    if (!names || names.length === 0 || !onLinkClick) {
      return [text];
    }
    // Create regex pattern matching any of the known names (word boundaries enforced)
    // Sort by length descending to match longest names first (e.g., "UserAuth" before "User")
    const sortedNames = [...names].sort((a, b) => b.length - a.length);
    const pattern = new RegExp(`\\b(${sortedNames.map(escapeRegExp).join('|')})\\b`, 'g');

    return text.split(pattern);
  }, [text, names, onLinkClick]);

  if (!names || names.length === 0 || !onLinkClick) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (names.includes(part)) {
          return (
            <span
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                onLinkClick(part);
              }}
              className="text-neon-cyan hover:text-primary hover:underline cursor-pointer font-mono font-bold mx-1"
              title={`Jump to ${part}`}
            >
              {part}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

/**
 * A UI card component representing a single mined CodePattern.
 * Displays pattern metadata, semantic tags, sovereign rating, complexity, and origin.
 *
 * @param {PatternCardProps} props - The configuration props for rendering the card.
 * @returns {React.ReactElement} The visual card representing the code pattern.
 */
export const PatternCard: React.FC<PatternCardProps> = ({ pattern, onClick, knownPatternNames = [], onLinkClick }) => {
  const getSovereignColor = (rating: string) => {
    switch (rating) {
      case 'STABLE': return 'text-signal-green border-signal-green/20 bg-signal-green/5';
      case 'VOLATILE': return 'text-orange-400 border-orange-400/20 bg-orange-400/5';
      case 'CRITICAL': return 'text-alert-red border-alert-red/20 bg-alert-red/5';
      default: return 'text-secondary';
    }
  };

  return (
    <div 
      onClick={() => onClick(pattern)}
      className="group relative flex flex-col p-6 bg-surface-light border border-border-subtle hover:border-neon-cyan/50 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
           {pattern.origin === 'NEURAL_MINE' ? (
              <Zap size={16} className="text-neon-cyan" />
           ) : (
              <Layers size={16} className="text-neon-purple" />
           )}
           <span className="text-sm font-bold text-primary tracking-wide font-mono truncate max-w-[120px]" title={pattern.name}>{pattern.name}</span>
           <button
             onClick={(e) => {
               e.stopPropagation();
               // TODO: Implement usage docs viewer callback
             }}
             className="text-tertiary hover:text-neon-cyan transition-colors p-1"
             title="View Protocol Manual"
           >
             <FileText size={12} />
           </button>
        </div>

        <div className="flex items-center">
          <div className={`text-xs px-2 py-1 rounded border font-mono tracking-wider flex items-center gap-1 ${getSovereignColor(pattern.sovereignRating)}`}>
              {pattern.sovereignRating === 'STABLE' ? <ShieldCheck size={10} /> : <ShieldAlert size={10} />}
              {pattern.sovereignRating}
          </div>
          {pattern.goldenScar && (
            <div className="text-[10px] px-2 py-1 ml-2 rounded border font-mono tracking-wider flex items-center gap-1 text-yellow-500 border-yellow-500/20 bg-yellow-500/5 group/scar relative cursor-help">
              <Anchor size={10} />
              GOLDEN SCAR
              <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-surface border border-border-subtle rounded shadow-xl opacity-0 group-hover/scar:opacity-100 transition-opacity pointer-events-none z-20 font-sans normal-case tracking-normal">
                <div className="text-[10px] font-bold text-primary uppercase mb-1">Human Adjudication (ϕ=1.618)</div>
                <div className="text-xs text-secondary leading-tight line-clamp-3">
                  {pattern.goldenScar.rationale}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="text-xs text-secondary mb-4 line-clamp-2 min-h-[2.5em] font-sans">
        <PatternLinkRenderer 
          text={pattern.description} 
          names={knownPatternNames} 
          onLinkClick={onLinkClick} 
        />
      </div>

      {/* Semantic Tags Display */}
      <div className="flex flex-wrap gap-2 mb-4">
        {pattern.tags && pattern.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="flex items-center gap-1 px-2 py-1 rounded bg-primary/5 border border-border-subtle text-xs text-tertiary font-mono whitespace-nowrap">
            <Tag size={8} className="opacity-70" /> {tag}
          </span>
        ))}
        {pattern.tags && pattern.tags.length > 3 && (
           <span className="text-xs text-tertiary self-center font-mono">+{pattern.tags.length - 3}</span>
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-border-subtle flex justify-between items-center text-xs text-tertiary font-mono">
        <div className="relative group/tooltip flex items-center gap-2 cursor-help">
          <Activity size={12} className={pattern.complexity > 5 ? 'text-orange-400' : 'text-signal-green'} />
          <span>CX: {pattern.complexity}/10</span>
          
          {/* Complexity Tooltip */}
          <div className="absolute bottom-full left-0 mb-2 w-48 p-4 bg-surface border border-border-subtle rounded shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-20">
             <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Cyclomatic Complexity</div>
             <div className="text-xs text-secondary leading-tight font-sans">
                Measures the number of linearly independent paths through the code. Lower scores (1-5) indicate better maintainability.
             </div>
             {/* Arrow */}
             <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-white/10"></div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {pattern.origin === 'NEURAL_MINE' && (
             <span className="text-xs text-neon-cyan flex items-center gap-1" title="Neural Scout Origin">
                <Cpu size={10} /> NEURAL
             </span>
          )}
          <div className="flex items-center gap-1">
            <Box size={12} />
            <span>{pattern.type}</span>
          </div>
        </div>
      </div>

      {/* Decorative hover effect */}
      <div className={`absolute -inset-px rounded-lg border-2 border-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity ${pattern.origin === 'NEURAL_MINE' ? 'group-hover:border-neon-cyan/10' : 'group-hover:border-neon-purple/10'}`} />
    </div>
  );
};
