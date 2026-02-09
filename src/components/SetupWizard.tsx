import { useState, useCallback } from 'react';
import type { PageBackground, RestaurantInfo } from '@/types/bubble';
import { COLOR_PALETTE } from '@/types/bubble';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as FaIcons from 'react-icons/fa';

interface SetupWizardProps {
  onComplete: (restaurant: RestaurantInfo) => void;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const [activeTab, setActiveTab] = useState('identity');
  const [restaurant, setRestaurant] = useState<RestaurantInfo>({
    name: '',
    description: '',
    centralContent: { type: 'text-image' },
    primaryColor: '#FFD700',
    background: { type: 'color', color: '#000000' },
    borderColor: '#FFD700',
    textColor: '#FFD700',
    socialLinks: {},
  });
  const [centralImagePreview, setCentralImagePreview] = useState<string | null>(null);

  const updateField = useCallback(<K extends keyof RestaurantInfo>(field: K, value: RestaurantInfo[K]) => {
    setRestaurant(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateCentralContent = useCallback((updates: Partial<RestaurantInfo['centralContent']>) => {
    setRestaurant(prev => ({
      ...prev,
      centralContent: { ...prev.centralContent, ...updates },
    }));
  }, []);

  const handleCentralImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCentralImagePreview(result);
        updateCentralContent({ imageUrl: result });
      };
      reader.readAsDataURL(file);
    }
  }, [updateCentralContent]);

  const handleCentralVideoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        updateCentralContent({ videoUrl: result });
      };
      reader.readAsDataURL(file);
    }
  }, [updateCentralContent]);

  const handleComplete = useCallback(() => {
    if (restaurant.name.trim()) {
      onComplete(restaurant);
    }
  }, [restaurant, onComplete]);

  const isValid = restaurant.name.trim().length > 0;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-[#1a1a1a] border-2 border-[#FFD700]">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFD700] rounded-full mb-4 mx-auto">
            <FaIcons.FaUtensils className="w-8 h-8 text-black" />
          </div>
          <CardTitle className="text-2xl text-[#FFD700]">Configuration</CardTitle>
          <CardDescription className="text-[#FFD700]/70">
            Personnalisez votre hub
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-black border border-[#FFD700]/30">
              <TabsTrigger value="identity" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black text-[#FFD700]">
                Identité
              </TabsTrigger>
              <TabsTrigger value="central" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black text-[#FFD700]">
                Contenu
              </TabsTrigger>
            </TabsList>

            {/* Identity Tab */}
            <TabsContent value="identity" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-[#FFD700]">Nom du restaurant *</Label>
                <Input
                  value={restaurant.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Ex: Le Bistrot Parisien"
                  className="bg-black border-[#FFD700]/50 text-[#FFD700] placeholder:text-[#FFD700]/30"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#FFD700]">Logo (cercle central)</Label>
                <Input
                  type="url"
                  placeholder="https://exemple.com/logo.png"
                  value={restaurant.logo || ''}
                  onChange={(e) => updateField('logo', e.target.value)}
                  className="bg-black border-[#FFD700]/50 text-[#FFD700] placeholder:text-[#FFD700]/30"
                />
                {restaurant.logo && (
                  <div className="mt-4 flex justify-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#FFD700]">
                      <img src={restaurant.logo} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 rounded-lg border border-[#FFD700]/30 bg-black/50 p-4">
                <div className="space-y-1">
                  <Label className="text-[#FFD700]">Fond général (mode client)</Label>
                  <p className="text-xs text-[#FFD700]/60">
                    Choisissez une couleur du panel ou une image externe.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={restaurant.background?.type === 'color' ? 'default' : 'outline'}
                    onClick={() => updateField('background', {
                      ...(restaurant.background || {}),
                      type: 'color',
                      color: restaurant.background?.color || '#000000',
                    } as PageBackground)}
                    className={restaurant.background?.type === 'color' ? 'bg-[#FFD700] text-black' : 'border-[#FFD700]/50 text-[#FFD700]'}
                  >
                    Couleur
                  </Button>
                  <Button
                    type="button"
                    variant={restaurant.background?.type === 'image' ? 'default' : 'outline'}
                    onClick={() => updateField('background', {
                      ...(restaurant.background || {}),
                      type: 'image',
                      imageUrl: restaurant.background?.imageUrl || '',
                    } as PageBackground)}
                    className={restaurant.background?.type === 'image' ? 'bg-[#FFD700] text-black' : 'border-[#FFD700]/50 text-[#FFD700]'}
                  >
                    Image externe
                  </Button>
                </div>

                {restaurant.background?.type === 'color' && (
                  <div className="space-y-3">
                    <Label className="text-[#FFD700]">Couleur</Label>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_PALETTE.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => updateField('background', {
                            ...(restaurant.background || {}),
                            type: 'color',
                            color: color.value,
                          } as PageBackground)}
                          className={`h-8 w-8 rounded-full border-2 ${
                            restaurant.background?.color === color.value ? 'border-white scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color.value }}
                          aria-label={`Couleur ${color.name}`}
                        />
                      ))}
                      <input
                        type="color"
                        value={restaurant.background?.color || '#000000'}
                        onChange={(e) => updateField('background', {
                          ...(restaurant.background || {}),
                          type: 'color',
                          color: e.target.value,
                        } as PageBackground)}
                        className="h-8 w-8 cursor-pointer rounded-full border border-[#FFD700]/50 bg-black"
                      />
                    </div>
                  </div>
                )}

                {restaurant.background?.type === 'image' && (
                  <div className="space-y-2">
                    <Label className="text-[#FFD700]">URL de l'image</Label>
                    <Input
                      type="url"
                      placeholder="https://exemple.com/fond.jpg"
                      value={restaurant.background?.imageUrl || ''}
                      onChange={(e) => updateField('background', {
                        ...(restaurant.background || {}),
                        type: 'image',
                        imageUrl: e.target.value,
                      } as PageBackground)}
                      className="bg-black border-[#FFD700]/50 text-[#FFD700] placeholder:text-[#FFD700]/30"
                    />
                    {restaurant.background?.imageUrl && (
                      <div className="mt-2 h-24 overflow-hidden rounded-lg border border-[#FFD700]/30">
                        <img
                          src={restaurant.background.imageUrl}
                          alt="Aperçu du fond"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Button 
                onClick={() => setActiveTab('central')}
                className="w-full bg-[#FFD700] text-black hover:bg-[#FFA500]"
              >
                Suivant
                <FaIcons.FaArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </TabsContent>

            {/* Central Content Tab */}
            <TabsContent value="central" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-[#FFD700]">Description</Label>
                <Textarea
                  value={restaurant.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Décrivez votre restaurant..."
                  className="bg-black border-[#FFD700]/50 text-[#FFD700] placeholder:text-[#FFD700]/30"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#FFD700]">Type de contenu central</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={restaurant.centralContent.type === 'text-image' ? 'default' : 'outline'}
                    onClick={() => updateCentralContent({ type: 'text-image', videoUrl: undefined })}
                    className={`flex-1 ${restaurant.centralContent.type === 'text-image' ? 'bg-[#FFD700] text-black' : 'border-[#FFD700]/50 text-[#FFD700]'}`}
                  >
                    <FaIcons.FaImage className="w-4 h-4 mr-2" />
                    Texte + Image
                  </Button>
                  <Button
                    type="button"
                    variant={restaurant.centralContent.type === 'video' ? 'default' : 'outline'}
                    onClick={() => updateCentralContent({ type: 'video', imageUrl: undefined, text: undefined })}
                    className={`flex-1 ${restaurant.centralContent.type === 'video' ? 'bg-[#FFD700] text-black' : 'border-[#FFD700]/50 text-[#FFD700]'}`}
                  >
                    <FaIcons.FaVideo className="w-4 h-4 mr-2" />
                    Vidéo
                  </Button>
                </div>
              </div>

              {restaurant.centralContent.type === 'video' ? (
                <div className="space-y-2">
                  <Label className="text-[#FFD700]">Vidéo</Label>
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={handleCentralVideoUpload}
                    className="bg-black border-[#FFD700]/50 text-[#FFD700]"
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label className="text-[#FFD700]">Image</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleCentralImageUpload}
                      className="bg-black border-[#FFD700]/50 text-[#FFD700]"
                    />
                    {centralImagePreview && (
                      <div className="mt-2 rounded-lg overflow-hidden border border-[#FFD700]/30">
                        <img src={centralImagePreview} alt="Preview" className="w-full h-32 object-cover" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#FFD700]">Texte</Label>
                    <Textarea
                      value={restaurant.centralContent.text || ''}
                      onChange={(e) => updateCentralContent({ text: e.target.value })}
                      placeholder="Texte à afficher..."
                      className="bg-black border-[#FFD700]/50 text-[#FFD700] placeholder:text-[#FFD700]/30"
                      rows={3}
                    />
                  </div>
                </>
              )}

              <div className="space-y-4 rounded-lg border border-[#FFD700]/30 bg-black/50 p-4">
                <Label className="text-[#FFD700]">Couleurs des bulles</Label>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-[#FFD700]">Bordures</Label>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_PALETTE.map((color) => (
                        <button
                          key={`border-${color.value}`}
                          type="button"
                          onClick={() => updateField('borderColor', color.value)}
                          className={`h-8 w-8 rounded-full border-2 ${
                            restaurant.borderColor === color.value ? 'border-white scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color.value }}
                          aria-label={`Bordure ${color.name}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#FFD700]">Texte</Label>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_PALETTE.map((color) => (
                        <button
                          key={`text-${color.value}`}
                          type="button"
                          onClick={() => updateField('textColor', color.value)}
                          className={`h-8 w-8 rounded-full border-2 ${
                            restaurant.textColor === color.value ? 'border-white scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color.value }}
                          aria-label={`Texte ${color.name}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setActiveTab('identity')}
                  className="flex-1 border-[#FFD700]/50 text-[#FFD700]"
                >
                  <FaIcons.FaArrowLeft className="w-4 h-4 mr-2" />
                  Précédent
                </Button>
                <Button 
                  onClick={handleComplete}
                  disabled={!isValid}
                  className="flex-1 bg-[#FFD700] text-black hover:bg-[#FFA500] disabled:opacity-50"
                >
                  <FaIcons.FaRocket className="w-4 h-4 mr-2" />
                  Créer
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
