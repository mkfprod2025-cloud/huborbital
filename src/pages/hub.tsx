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
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-[#FFD700]">Aucune configuration trouvée. Veuillez configurer depuis l'administration.</p>
      </div>
    );
  }

  // Détermine le style de fond
  const bgStyle: React.CSSProperties = {};
  if (config.restaurant.background?.type === 'image' && config.restaurant.background.imageUrl) {
    bgStyle.backgroundImage = `url(${config.restaurant.background.imageUrl})`;
    bgStyle.backgroundSize = 'cover';
    bgStyle.backgroundPosition = 'center';
  } else if (config.restaurant.background?.type === 'gradient' && config.restaurant.background.gradientTo) {
    bgStyle.background = `linear-gradient(to bottom, ${config.restaurant.background.color || '#000'}, ${config.restaurant.background.gradientTo})`;
  } else {
    bgStyle.backgroundColor = config.restaurant.background?.color || '#000';
  }

  return (
    <div className="min-h-screen" style={bgStyle}>
      <FlowerLayout 
        bubbles={config.bubbles} 
        restaurant={config.restaurant}
      />
    </div>
  );
};
