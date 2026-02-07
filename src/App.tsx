import { useState } from 'react';
import { Image, Palette, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

type BackgroundType = 'color' | 'image';

export function BackgroundSelector() {
  const [type, setType] = useState<BackgroundType>('color');
  const [color, setColor] = useState('#1a1a1a');
  const [gradient, setGradient] = useState(false);
  const [gradientTo, setGradientTo] = useState('#2d2d2d');
  const [imageUrl, setImageUrl] = useState('');
  const [opacity, setOpacity] = useState(100);
  const [size, setSize] = useState<'cover' | 'contain' | 'repeat'>('cover');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image trop grande. Max 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target?.result as string);
      setType('image');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4 border border-yellow-500/30 rounded-lg p-4 bg-black/50">
      <div className="flex items-center gap-2 text-yellow-500 font-semibold mb-2">
        <Palette className="w-4 h-4" />
        <span>Fond d'écran général</span>
      </div>

      <div className="flex gap-2 bg-black/50 p-1 rounded-lg border border-yellow-500/30">
        <button
          type="button"
          onClick={() => setType('color')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
            type === 'color' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Palette className="w-4 h-4" />
          Couleur
        </button>
        <button
          type="button"
          onClick={() => setType('image')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
            type === 'image' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Image className="w-4 h-4" />
          Image
        </button>
      </div>

      {type === 'color' ? (
        <div className="space-y-3">
          <div className="grid grid-cols-6 gap-2">
            {['#1a1a1a', '#2d2d2d', '#0f172a', '#7c2d12', '#14532d', '#1e3a8a', '#581c87', '#92400e', '#065f46', '#3730a3', '#831843', '#000000'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-full aspect-square rounded-lg border-2 transition-all ${
                  color === c ? 'border-yellow-500 scale-110' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-12 h-10 rounded cursor-pointer bg-transparent border-0"
            />
            <span className="text-sm text-gray-400 font-mono">{color}</span>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-yellow-500/20">
            <Switch
              checked={gradient}
              onCheckedChange={setGradient}
              className="data-[state=checked]:bg-yellow-500"
            />
            <Label className="text-gray-300 cursor-pointer">Dégradé</Label>
          </div>

          {gradient && (
            <div className="flex items-center gap-3 pl-2">
              <span className="text-sm text-gray-500">vers</span>
              <input
                type="color"
                value={gradientTo}
                onChange={(e) => setGradientTo(e.target.value)}
                className="w-10 h-8 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {!imageUrl ? (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-yellow-500/30 rounded-lg cursor-pointer hover:border-yellow-500/60 hover:bg-yellow-500/5 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 text-yellow-500 mb-2" />
                <p className="text-sm text-gray-400">Cliquez pour choisir un fichier</p>
                <p className="text-xs text-gray-600">PNG, JPG, WEBP (max 5MB)</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>
          ) : (
            <div className="relative">
              <img src={imageUrl} alt="Background preview" className="w-full h-32 object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

          <div className="flex gap-2">
            {(['cover', 'contain', 'repeat'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`flex-1 py-2 px-3 rounded text-xs font-medium transition-colors ${
                  size === s ? 'bg-yellow-500 text-black' : 'bg-black/50 text-gray-400 border border-yellow-500/30'
                }`}
              >
                {s === 'cover' ? 'Remplir' : s === 'contain' ? 'Adapter' : 'Répéter'}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Opacité</span>
              <span>{opacity}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full h-2 bg-yellow-500/20 rounded-lg appearance-none cursor-pointer accent-yellow-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
