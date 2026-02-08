import { useState, useEffect } from 'react';
import type { AppConfig } from '@/types/bubble';
import { FlowerLayout } from '@/components/FlowerLayout';

export const Hub: React.FC = () => {
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('hubConfig');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error('Config invalide');
      }
    }
  }, []);

  if (!config) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-[#FFD700]">Chargement...</div>;
  }

  const bgStyle = config.background?.type === 'image' 
    ? { 
        backgroundImage: `url(${config.background.imageUrl})`,
        backgroundSize: config.background.size || 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }
    : { 
        backgroundColor: config.background?.color || '#000000' 
      };

  return (
    <div className="min-h-screen" style={bgStyle}>
      <FlowerLayout 
        bubbles={config.bubbles} 
        restaurant={config.restaurant}
      />
    </div>
  );
};
