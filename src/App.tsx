import { AdminPanel } from '@/components/AdminPanel';
import { Hub } from '@/pages/Hub';
import type { AppConfig } from '@/types/bubble';
import { useState, useEffect } from 'react';

const defaultConfig: AppConfig = {
  restaurant: {
    name: 'Mon Restaurant',
    background: { type: 'color', color: '#000000' },
  },
  bubbles: [],
};

export default function App() {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const path = window.location.pathname;

  // Charge la config au démarrage (pour Admin)
  useEffect(() => {
    const saved = localStorage.getItem('hubConfig');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error('Erreur chargement config');
      }
    }
  }, []);

  const handleUpdateConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    localStorage.setItem('hubConfig', JSON.stringify(newConfig));
  };

  const handleReset = () => {
    if (confirm('Tout réinitialiser ?')) {
      setConfig(defaultConfig);
      localStorage.removeItem('hubConfig');
    }
  };

  // Routing simple
  if (path.includes('/admin')) {
    return (
      <AdminPanel 
        config={config} 
        onUpdateConfig={handleUpdateConfig}
        onReset={handleReset}
        onPreview={() => window.open('/hub', '_blank')}
      />
    );
  }

  // Par défaut : affiche le Hub public
  return <Hub />;
}
