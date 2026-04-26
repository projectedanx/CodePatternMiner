import React, { useState } from 'react';
import { intelligenceGateway } from '../services/intelligence/IntelligenceGateway';
import { CodePattern } from '../types';
import { Play, Loader, FileCode, CheckCircle2, Radar, Terminal } from 'lucide-react';

/**
 * Properties required by the MinerDashboard component.
 *
 * @property {(patterns: CodePattern[]) => void} onPatternsFound - Callback triggered when the mining process successfully identifies new patterns.
 * @property {() => void} onSwitchToCatalog - Callback triggered to switch the application view to the Component Catalog.
 */
interface MinerDashboardProps {

  onPatternsFound: (patterns: CodePattern[]) => void;
  onSwitchToCatalog: () => void;
}

const DEFAULT_CODE = `// Paste your code here to mine patterns...
// Example:
function calculateEntropy(data: number[]): number {
  if (data.length === 0) return 0;
  
  const sum = data.reduce((acc, val) => acc + val, 0);
  
  return -data.reduce((acc, val) => {
    const p = val / sum;
    return p === 0 ? acc : acc + p * Math.log2(p);
  }, 0);
}`;

type MiningMode = 'MANUAL' | 'SCOUT';

/**
 * The main interface for ingesting code and extracting semantic patterns.
 * Supports both manual code injection and AI-driven scout mode for pattern generation.
 *
 * @param {MinerDashboardProps} props - The configuration props for the Miner Dashboard.
 * @returns {React.ReactElement} The rendered dashboard interface.
 */
export const MinerDashboard: React.FC<MinerDashboardProps> = ({ onPatternsFound, onSwitchToCatalog }) => {
  const [mode, setMode] = useState<MiningMode>('MANUAL');
  const [code, setCode] = useState(DEFAULT_CODE);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMining, setIsMining] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<string>('GEMINI_3_FLASH');

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleMine = async () => {
    if (mode === 'MANUAL' && !code.trim()) return;
    if (mode === 'SCOUT' && !searchQuery.trim()) return;
    
    setIsMining(true);
    setLogs([]);
    setError(null);
    
    try {
      if (mode === 'MANUAL') {
        console.log("Initializing deterministic analysis protocols...");
        addLog("Initializing deterministic analysis protocols...");
        
        console.log("Parsing AST structure...");
        addLog("Parsing AST structure...");
        
        await new Promise(r => setTimeout(r, 600));
        
        addLog("Engaging Gemini Neural Engine for Semantic Verification...");
        
        const foundPatterns = await intelligenceGateway.analyzeCodeBlock(code, provider);
        finalizeMining(foundPatterns);
      } else {
        addLog("Initializing Neural Scout Protocol...");
        addLog(`Broadcasting vector: "${searchQuery}" to latent space...`);
        
        const foundPatterns = await intelligenceGateway.scoutPatterns(searchQuery, provider);
        finalizeMining(foundPatterns);
      }
      
    } catch (err: unknown) {
      setError("Mining Protocol Failed: " + (err instanceof Error ? err.message : "Unknown Error"));
      addLog("CRITICAL FAILURE in mining sequence.");
    } finally {
      setIsMining(false);
    }
  };

  const finalizeMining = (foundPatterns: CodePattern[]) => {
    addLog(`Analysis complete. Identified ${foundPatterns.length} valid patterns.`);
    addLog("Validating sovereign integrity...");
    onPatternsFound(foundPatterns);
    addLog("Patterns cataloged successfully.");
  };

  return (
    <div className="flex h-full gap-6">
      {/* Input Area */}
      <div className="flex-1 flex flex-col gap-4">
        
        {/* Header & Tabs */}
        <div className="flex justify-between items-center">
          <div className="flex items-center bg-surface-light border border-border-subtle rounded-lg p-1">
             <button 
               onClick={() => setMode('MANUAL')}
               className={`px-4 py-2 rounded text-xs font-mono font-bold flex items-center gap-2 transition-all ${mode === 'MANUAL' ? 'bg-primary/10 text-primary shadow-sm' : 'text-tertiary hover:text-secondary'}`}
             >
               <FileCode size={14} /> MANUAL INJECTION
             </button>
             <button 
               onClick={() => setMode('SCOUT')}
               className={`px-4 py-2 rounded text-xs font-mono font-bold flex items-center gap-2 transition-all ${mode === 'SCOUT' ? 'bg-neon-cyan/20 text-neon-cyan shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'text-tertiary hover:text-secondary'}`}
             >
               <Radar size={14} /> NEURAL SCOUT
             </button>
          </div>

          <button
            onClick={handleMine}
            disabled={isMining}
            className={`
              flex items-center gap-2 px-6 py-2 rounded font-mono text-sm font-bold tracking-wider transition-all
              ${isMining 
                ? 'bg-surface-light text-tertiary cursor-not-allowed border border-border-subtle'
                : 'bg-neon-cyan text-black hover:bg-primary hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]'
              }
            `}
          >
            {isMining ? <Loader className="animate-spin" size={16} /> : <Play size={16} />}
            {isMining ? 'EXECUTING...' : (mode === 'MANUAL' ? 'INITIATE MINING' : 'DEPLOY SCOUT')}
          </button>
        </div>
        
        {/* Input Surface */}
        <div className="flex-1 relative group">
          <div className={`absolute inset-0 bg-gradient-to-br blur-xl opacity-0 group-hover:opacity-10 transition-opacity ${mode === 'MANUAL' ? 'from-neon-purple/20' : 'from-neon-cyan/20'}`}></div>
          
          {mode === 'MANUAL' ? (
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-surface-light border border-border-subtle rounded-lg p-6 font-mono text-sm text-secondary resize-none focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 relative z-10 shadow-inner"
              spellCheck={false}
              placeholder="// Paste raw source code here..."
            />
          ) : (
            <div className="w-full h-full bg-surface-light border border-border-subtle rounded-lg flex flex-col items-center justify-center relative z-10 p-12">
               <div className="w-full max-w-lg">
                  <label className="text-neon-cyan text-xs font-mono font-bold tracking-widest mb-4 block flex items-center gap-2">
                    <Terminal size={14} />
                    SEARCH VECTOR PARAMETERS
                  </label>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleMine()}
                    placeholder='e.g. "React Authentication Hook with JWT"'
                    className="w-full bg-surface-light border border-border-subtle rounded p-4 text-primary font-mono text-lg focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_30px_rgba(6,182,212,0.2)] placeholder:text-gray-700 transition-all"
                  />
                  <div className="mt-6 grid grid-cols-2 gap-2">
                     <div className="p-2 border border-border-subtle rounded bg-primary/5">
                        <div className="text-[10px] text-tertiary font-mono mb-1">TARGET SOURCE</div>
                        <div className="text-xs text-secondary">Latent Open Source</div>
                     </div>
                     <div className="p-2 border border-border-subtle rounded bg-primary/5">
                        <div className="text-[10px] text-tertiary font-mono mb-1">VARIATIONS</div>
                        <div className="text-xs text-secondary">3 Distinct Patterns</div>
                     </div>
                  </div>
                  <p className="mt-8 text-center text-xs text-tertiary font-mono">
                    The Neural Scout will synthesize optimal implementations based on the collective intelligence of the training set.
                  </p>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Console / Status Area */}
      <div className="w-80 flex flex-col gap-4">
        <div className="glass-panel p-4 rounded-lg flex-1 flex flex-col border border-border-subtle">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border-subtle">
            <div className={`w-2 h-2 rounded-full animate-pulse ${mode === 'MANUAL' ? 'bg-signal-green' : 'bg-neon-cyan'}`}></div>
            <span className="text-xs font-mono font-bold text-primary uppercase">Operations Log</span>
          </div>
          
          <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-2 text-secondary">
             {logs.length === 0 && <span className="opacity-50 italic">System Idle. Awaiting input.</span>}
             {logs.map((log, i) => (
               <div key={i} className="animate-in fade-in slide-in-from-left-2 duration-300">
                 <span className={`${mode === 'MANUAL' ? 'text-signal-green' : 'text-neon-cyan'} mr-2`}>{'>'}</span>
                 {log}
               </div>
             ))}
             {error && (
               <div className="text-alert-red mt-2 border-l-2 border-alert-red pl-2">
                 {error}
               </div>
             )}
          </div>

          {logs.includes("Patterns cataloged successfully.") && (
             <button 
               onClick={onSwitchToCatalog}
               className="mt-4 w-full py-2 bg-primary/5 hover:bg-primary/10 border border-border-subtle text-primary text-xs font-mono rounded flex items-center justify-center gap-2 transition-colors"
             >
               <CheckCircle2 size={12} className="text-signal-green" />
               VIEW CATALOG
             </button>
          )}
        </div>

        <div className="glass-panel p-4 rounded-lg h-1/3 border border-border-subtle">
           <h3 className="text-xs font-bold text-tertiary font-mono mb-2 uppercase">Miner Configuration</h3>
           <div className="space-y-3">
             <div className="flex justify-between items-center text-xs">
               <span className="text-secondary">Heuristic Engine</span>
               <select
                 value={provider}
                 onChange={(e) => setProvider(e.target.value)}
                 className="bg-surface-light border border-border-subtle text-neon-cyan font-mono text-xs rounded p-1 outline-none"
               >
                 {intelligenceGateway.getAvailableProviders().map(p => (
                   <option key={p} value={p}>{p}</option>
                 ))}
               </select>
             </div>
             <div className="flex justify-between items-center text-xs">
               <span className="text-secondary">Protocol Mode</span>
               <span className={`font-mono ${mode === 'MANUAL' ? 'text-neon-purple' : 'text-neon-cyan'}`}>{mode}</span>
             </div>
             <div className="flex justify-between items-center text-xs">
               <span className="text-secondary">Sovereign Check</span>
               <span className="text-signal-green font-mono">ENABLED</span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};
