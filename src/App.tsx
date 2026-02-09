import { AdminPanel } from '@/components/AdminPanel';
import { SetupWizard } from '@/components/SetupWizard';
import { Hub } from '@/pages/Hub';
import type { AppConfig, RestaurantInfo } from '@/types/bubble';
import { useState, useEffect } from 'react';

const defaultConfig: AppConfig = {
  restaurant: {
    name: 'Mon Restaurant',
    description: '',
    centralContent: { type: 'text-image' },
    primaryColor: '#FFD700',
    borderColor: '#FFD700',
    textColor: '#FFD700',
    socialLinks: {},
  },
  bubbles: [],
  isInitialized: false,
  lastUpdated: new Date().toISOString(),
  background: { type: 'color', color: '#000000' },
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

  const handleSetupComplete = (restaurant: RestaurantInfo) => {
    const { background, ...restaurantInfo } = restaurant;
    const nextConfig: AppConfig = {
      ...config,
      restaurant: restaurantInfo,
      background: background || config.background,
      isInitialized: true,
      lastUpdated: new Date().toISOString(),
    };
    setConfig(nextConfig);
    localStorage.setItem('hubConfig', JSON.stringify(nextConfig));
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
  if (!config.isInitialized) {
    return <SetupWizard onComplete={handleSetupComplete} />;
  }

  return <Hub />;
}
