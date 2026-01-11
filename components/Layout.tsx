import React from 'react';
import { Hexagon } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (id: string) => void;
  navItems: NavItem[];
  stats: { patternCount: number };
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate, navItems, stats }) => {
  return (
    <div className="flex h-screen bg-void text-gray-300 font-sans selection:bg-neon-cyan/20 selection:text-neon-cyan overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-void-light flex flex-col relative z-10">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="relative">
             <Hexagon className="text-neon-cyan fill-neon-cyan/10 animate-pulse" size={28} />
             <div className="absolute inset-0 blur-lg bg-neon-cyan/30 opacity-50"></div>
          </div>
          <div>
            <h1 className="font-bold text-white tracking-wider text-sm">PATTERN MINER</h1>
            <p className="text-[10px] text-gray-500 font-mono">SCOS-v5.0 KERNEL</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 group relative overflow-hidden ${
                currentView === item.id 
                  ? 'bg-white/5 text-neon-cyan border border-neon-cyan/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                  : 'hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <span className={`relative z-10 transition-transform duration-300 ${currentView === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              <span className="relative z-10 font-mono text-xs tracking-widest">{item.label}</span>
              {currentView === item.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-cyan shadow-[0_0_10px_#06b6d4]"></div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
           <div className="bg-black/30 rounded p-3 border border-white/5">
             <p className="text-[10px] text-gray-500 mb-1 font-mono uppercase">System Status</p>
             <div className="flex justify-between items-center mb-2">
               <span className="text-xs text-white">Context Link</span>
               <span className="flex h-2 w-2 rounded-full bg-signal-green shadow-[0_0_5px_#10b981]"></span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-xs text-white">Mined Patterns</span>
                <span className="text-xs font-mono text-neon-cyan">{stats.patternCount}</span>
             </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative flex flex-col">
        {/* Top Bar */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-void/50 backdrop-blur-sm z-10">
           <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
             <span className="text-neon-cyan">root</span>
             <span>/</span>
             <span>workspace</span>
             <span>/</span>
             <span className="text-white">{currentView.toLowerCase()}</span>
           </div>
           
           <div className="flex items-center gap-4">
              <button className="text-xs font-mono text-gray-400 hover:text-white transition-colors">
                 [SETTINGS]
              </button>
              <div className="h-4 w-px bg-white/10"></div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-neon-cyan to-neon-purple"></div>
                <span className="text-xs font-bold text-white">Commander</span>
              </div>
           </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 relative">
           {/* Background Grid */}
           <div className="absolute inset-0 z-0 pointer-events-none opacity-20" 
                style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
           </div>
           <div className="relative z-10 h-full">
            {children}
           </div>
        </div>
      </main>
    </div>
  );
};
