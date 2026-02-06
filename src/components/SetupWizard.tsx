import { useState, useCallback } from 'react';
import type { RestaurantInfo } from '@/types/bubble';
import { COLOR_PALETTE } from '@/types/bubble';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    socialLinks: {},
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
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

  const updateSocialLink = useCallback((platform: keyof RestaurantInfo['socialLinks'], value: string) => {
    setRestaurant(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value },
    }));
  }, []);

  const handleLogoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        updateField('logo', result);
      };
      reader.readAsDataURL(file);
    }
  }, [updateField]);

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
            <TabsList className="grid w-full grid-cols-3 bg-black border border-[#FFD700]/30">
              <TabsTrigger value="identity" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black text-[#FFD700]">
                Identité
              </TabsTrigger>
              <TabsTrigger value="central" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black text-[#FFD700]">
                Contenu
              </TabsTrigger>
              <TabsTrigger value="contact" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black text-[#FFD700]">
                Contact
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
                <Label className="text-[#FFD700]">Logo (cercle central)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="bg-black border-[#FFD700]/50 text-[#FFD700] file:text-[#FFD700]"
                />
                {logoPreview && (
                  <div className="mt-4 flex justify-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#FFD700]">
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[#FFD700]">Couleur principale</Label>
                <Select
                  value={restaurant.primaryColor}
                  onValueChange={(value) => updateField('primaryColor', value as typeof COLOR_PALETTE[number]['value'])}
                >
                  <SelectTrigger className="bg-black border-[#FFD700]/50 text-[#FFD700]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#FFD700]/50">
                    {COLOR_PALETTE.map((color) => (
                      <SelectItem key={color.value} value={color.value} className="text-[#FFD700]">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border border-white/20" 
                            style={{ backgroundColor: color.value }}
                          />
                          {color.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  onClick={() => setActiveTab('contact')}
                  className="flex-1 bg-[#FFD700] text-black hover:bg-[#FFA500]"
                >
                  Suivant
                  <FaIcons.FaArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-[#FFD700]">Téléphone</Label>
                <Input
                  value={restaurant.phone || ''}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+33 1 23 45 67 89"
                  className="bg-black border-[#FFD700]/50 text-[#FFD700] placeholder:text-[#FFD700]/30"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#FFD700]">Email</Label>
                <Input
                  type="email"
                  value={restaurant.email || ''}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="contact@restaurant.com"
                  className="bg-black border-[#FFD700]/50 text-[#FFD700] placeholder:text-[#FFD700]/30"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#FFD700]">Adresse</Label>
                <Textarea
                  value={restaurant.address || ''}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="123 rue de Paris, 75001 Paris"
                  className="bg-black border-[#FFD700]/50 text-[#FFD700] placeholder:text-[#FFD700]/30"
                  rows={2}
                />
              </div>

              <div className="border-t border-[#FFD700]/20 pt-4">
                <Label className="text-[#FFD700] mb-2 block">Réseaux sociaux</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FaIcons.FaFacebook className="w-5 h-5 text-[#FFD700]" />
                    <Input
                      value={restaurant.socialLinks.facebook || ''}
                      onChange={(e) => updateSocialLink('facebook', e.target.value)}
                      placeholder="Facebook"
                      className="bg-black border-[#FFD700]/50 text-[#FFD700] placeholder:text-[#FFD700]/30"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <FaIcons.FaInstagram className="w-5 h-5 text-[#FFD700]" />
                    <Input
                      value={restaurant.socialLinks.instagram || ''}
                      onChange={(e) => updateSocialLink('instagram', e.target.value)}
                      placeholder="Instagram"
                      className="bg-black border-[#FFD700]/50 text-[#FFD700] placeholder:text-[#FFD700]/30"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setActiveTab('central')}
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
