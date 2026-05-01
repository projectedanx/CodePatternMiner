import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { MinerDashboard } from './components/MinerDashboard';
import { PatternCatalog } from './components/PatternCatalog';
import { CodePattern } from './types';
import { Database, Search, Cpu } from 'lucide-react';

/**
 * Represents the primary routing states within the application.
 */
enum View {
  MINER = 'MINER',
  CATALOG = 'CATALOG',
}

/**
 * The root component of the application.
 * Manages global application state (like the catalog of mined patterns) and handles the primary view routing between the Miner and the Catalog.
 *
 * @returns {React.ReactElement} The main rendered application tree.
 */
const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.MINER);
  const [patterns, setPatterns] = useState<CodePattern[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<CodePattern | null>(null);

  const handlePatternMined = (newPatterns: CodePattern[]) => {
    setPatterns(prev => [...prev, ...newPatterns]);
  };

  const handleUpdatePattern = (updatedPattern: CodePattern) => {
    setPatterns(prev => prev.map(p => p.id === updatedPattern.id ? updatedPattern : p));
  };

  const navItems = [
    { id: View.MINER, label: 'PATTERN MINER', icon: <Cpu size={18} /> },
    { id: View.CATALOG, label: 'COMPONENT CATALOG', icon: <Database size={18} /> },
  ];

  return (
    <Layout 
      currentView={currentView} 
      onNavigate={(view) => {
        setCurrentView(view as View);
        setSelectedPattern(null);
      }}
      navItems={navItems}
      stats={{ patternCount: patterns.length }}
    >
      {currentView === View.MINER && (
        <MinerDashboard 
          onPatternsFound={handlePatternMined} 
          onSwitchToCatalog={() => setCurrentView(View.CATALOG)}
        />
      )}
      
      {currentView === View.CATALOG && (
        <PatternCatalog 
          patterns={patterns} 
          onUpdatePattern={handleUpdatePattern}
        />
      )}
    </Layout>
  );
};

export default App;
