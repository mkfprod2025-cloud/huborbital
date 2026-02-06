import { useState, useCallback, useEffect } from 'react';
import type { AppConfig, RestaurantInfo } from '@/types/bubble';
import { useStorage } from '@/hooks/useStorage';
import { SetupWizard } from '@/components/SetupWizard';
import { AdminPanel } from '@/components/AdminPanel';
import { FlowerLayout } from '@/components/FlowerLayout';
import { Button } from '@/components/ui/button';
import * as FaIcons from 'react-icons/fa';
import './App.css';

type AppMode = 'loading' | 'setup' | 'admin' | 'preview';

function App() {
  const { config, isLoading, initializeApp, saveConfig, resetApp } = useStorage();
  const [mode, setMode] = useState<AppMode>('loading');

  useEffect(() => {
    if (!isLoading) {
      if (config.isInitialized) {
        setMode('admin');
      } else {
        setMode('setup');
      }
    }
  }, [config.isInitialized, isLoading]);

  const handleSetupComplete = useCallback(async (restaurant: RestaurantInfo) => {
    await initializeApp(restaurant);
    setMode('admin');
  }, [initializeApp]);

  const handleUpdateConfig = useCallback(async (newConfig: AppConfig) => {
    await saveConfig(newConfig);
  }, [saveConfig]);

  const handleReset = useCallback(async () => {
    if (confirm('Êtes-vous sûr de vouloir tout réinitialiser ?')) {
      await resetApp();
      setMode('setup');
    }
  }, [resetApp]);

  const handlePreview = useCallback(() => {
    setMode('preview');
  }, []);

  const handleExitPreview = useCallback(() => {
    setMode('admin');
  }, []);

  const handleBubbleClick = useCallback((bubble: { id: string; name: string }) => {
    console.log('Button clicked:', bubble);
  }, []);

  // Loading state
  if (isLoading || mode === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFD700] rounded-full mb-4 animate-pulse">
            <FaIcons.FaUtensils className="w-8 h-8 text-black" />
          </div>
          <p className="text-[#FFD700]">Chargement...</p>
        </div>
      </div>
    );
  }

  // Setup mode
  if (mode === 'setup') {
    return <SetupWizard onComplete={handleSetupComplete} />;
  }

  // Preview mode (client view)
  if (mode === 'preview') {
    return (
      <div className="relative">
        {/* Exit Preview Button */}
        <div className="fixed top-4 right-4 z-50">
          <Button 
            onClick={handleExitPreview}
            className="bg-[#FFD700] text-black hover:bg-[#FFA500] shadow-lg"
          >
            <FaIcons.FaArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>

        <FlowerLayout
          bubbles={config.bubbles}
          restaurant={config.restaurant}
          onBubbleClick={handleBubbleClick}
        />
      </div>
    );
  }

  // Admin mode
  return (
    <AdminPanel
      config={config}
      onUpdateConfig={handleUpdateConfig}
      onReset={handleReset}
      onPreview={handlePreview}
    />
  );
}

export default App;
