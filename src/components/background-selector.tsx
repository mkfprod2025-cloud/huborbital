import { useState, useEffect } from 'react';
import { Image, Palette, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

type BackgroundType = 'color' | 'image';

interface BackgroundConfig {
  type: BackgroundType;
  color?: string;
  gradient?: boolean;
  gradientTo?: string;
  imageUrl?: string;
  opacity?: number;
  size?: 'cover' | 'contain' | 'repeat';
}

interface BackgroundSelectorProps {
  value?: BackgroundConfig;
  onChange: (config: BackgroundConfig) => void;
}

const PRESET_COLORS = [
  '#1a1a1a', '#2d2d2d', '#1f2937', '#0f172a',
  '#7c2d12', '#14532d', '#1e3a8a', '#581c87',
  '#92400e', '#065f46', '#3730a3', '#831843'
];

export function BackgroundSelector({ value, onChange }: BackgroundSelectorProps) {
  const [config, setConfig] = useState<BackgroundConfig>(value || {
    type: 'color',
    color: '#1a1a1a',
    gradient: false,
    opacity: 100,
    size: 'cover'
  });

  useEffect(() => {
    onChange(config);
  }, [config, onChange]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image trop grande. Max 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setConfig(prev => ({ ...prev, type: 'image', imageUrl: event.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4 border border-yellow-500/30 rounded-lg p-4 bg-black/50">
      <div className="flex items-center justify-between">
        <Label className="text-yellow-400 font-semibold">Fond d'écran général</Label>
        <div className="flex gap-2 bg-black/50 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setConfig(prev => ({ ...prev, type: 'color' }))}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
              config.type === 'color' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Palette size={16} /> Couleur
          </button>
          <button
            type="button"
            onClick={() => setConfig(prev => ({ ...prev, type: 'image' }))}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
              config.type === 'image' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Image size={16} /> Image
          </button>
        </div>
      </div>

      {config.type === 'color' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-6 gap-2">
            {PRESET_COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setConfig(prev => ({ ...prev, color }))}
                className={`w-full aspect-square rounded-lg border-2 transition-all ${
                  config.color === color ? 'border-yellow-500 scale-110' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Couleur ${color}`}
              />
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <Input
              type="color"
              value={config.color}
              onChange={(e) => setConfig(prev => ({ ...prev, color: e.target.value }))}
              className="w-16 h-10 p-1 bg-transparent border-yellow-500/30"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs text-gray-400">Dégradé</Label>
                <Switch
                  checked={config.gradient}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, gradient: checked }))}
                />
              </div>
              {config.gradient && (
                <Input
                  type="color"
                  value={config.gradientTo || '#000000'}
                  onChange={(e) => setConfig(prev => ({ ...prev, gradientTo: e.target.value }))}
                  className="w-full h-8 p-1 bg-transparent border-yellow-500/30"
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {!config.imageUrl ? (
            <div className="border-2 border-dashed border-yellow-500/30 rounded-lg p-6 text-center hover:border-yellow-500/60 transition-colors">
              <Upload className="mx-auto h-8 w-8 text-yellow-500 mb-2" />
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="bg-image-upload"
              />
              <Label htmlFor="bg-image-upload" className="cursor-pointer text-sm text-gray-300 hover:text-yellow-400">
                Cliquez pour choisir une image<br/>(max 5MB)
              </Label>
            </div>
          ) : (
            <div className="relative rounded-lg overflow-hidden border border-yellow-500/30">
              <img 
                src={config.imageUrl} 
                alt="Background preview" 
                className="w-full h-32 object-cover"
              />
              <button
                type="button"
                onClick={() => setConfig(prev => ({ ...prev, imageUrl: undefined }))}
                className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {config.imageUrl && (
            <>
              <div className="space-y-2">
                <Label className="text-xs text-gray-400">Opacité ({config.opacity}%)</Label>
                <Slider
                  value={[config.opacity || 100]}
                  onValueChange={([v]) => setConfig(prev => ({ ...prev, opacity: v }))}
                  min={20}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="flex gap-2">
                {(['cover', 'contain', 'repeat'] as const).map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, size }))}
                    className={`flex-1 py-2 px-3 rounded text-xs font-medium transition-colors ${
                      config.size === size 
                        ? 'bg-yellow-500 text-black' 
                        : 'bg-black/50 text-gray-400 hover:text-white border border-yellow-500/30'
                    }`}
                  >
                    {size === 'cover' ? 'Remplir' : size === 'contain' ? 'Adapter' : 'Répéter'}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="text-xs text-gray-500 mt-2">
        Ce fond s'appliquera à toute l'application utilisateur
      </div>
    </div>
  );
}
