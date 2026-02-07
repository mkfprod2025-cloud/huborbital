import { DEFAULT_STYLES, COLOR_PALETTE } from '@/types/bubble';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useCallback, useEffect } from 'react';
import type { AppConfig, Bubble } from '@/types/bubble';
import { DEFAULT_STYLES } from '@/types/bubble';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { BubbleEditor } from './BubbleEditor';
import * as FaIcons from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

interface AdminPanelProps {
  config: AppConfig;
  onUpdateConfig: (config: AppConfig) => void;
  onReset: () => void;
  onPreview: () => void;
}

const DynamicIcon = ({ iconName, className, style }: { iconName: string; className?: string; style?: React.CSSProperties }) => {
  const IconComponent = (FaIcons as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>)[iconName];
  if (!IconComponent) return <FaIcons.FaCircle className={className} style={style} />;
  return <IconComponent className={className} style={style} />;
};

export const AdminPanel: React.FC<AdminPanelProps> = ({
  config,
  onUpdateConfig,
  onReset,
  onPreview,
}) => {
  const [editingBubble, setEditingBubble] = useState<Bubble | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isNewBubble, setIsNewBubble] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [activeTab, setActiveTab] = useState('buttons');

  useEffect(() => {
    const generateQR = async () => {
      try {
        const url = window.location.origin + window.location.pathname;
        const qrDataUrl = await QRCode.toDataURL(url, {
          width: 400,
          margin: 2,
          color: {
            dark: '#FFD700',
            light: '#000000',
          },
        });
        setQrCodeUrl(qrDataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };
    generateQR();
  }, []);

  const handleAddBubble = useCallback(() => {
    setIsNewBubble(true);
    setEditingBubble(null);
    setIsEditorOpen(true);
  }, []);

  const handleEditBubble = useCallback((bubble: Bubble) => {
    setIsNewBubble(false);
    setEditingBubble(bubble);
    setIsEditorOpen(true);
  }, []);

  const handleSaveBubble = useCallback((bubble: Bubble) => {
    let newBubbles: Bubble[];
    if (isNewBubble) {
      bubble.order = config.bubbles.length;
      newBubbles = [...config.bubbles, bubble];
    } else {
      newBubbles = config.bubbles.map(b => b.id === bubble.id ? bubble : b);
    }
    onUpdateConfig({ ...config, bubbles: newBubbles });
    setIsEditorOpen(false);
  }, [config, isNewBubble, onUpdateConfig]);

  const handleDeleteBubble = useCallback((bubbleId: string) => {
    const newBubbles = config.bubbles.filter(b => b.id !== bubbleId);
    onUpdateConfig({ ...config, bubbles: newBubbles });
  }, [config, onUpdateConfig]);

  const handleToggleBubbleVisibility = useCallback((bubbleId: string) => {
    const newBubbles = config.bubbles.map(b => 
      b.id === bubbleId ? { ...b, isVisible: !b.isVisible } : b
    );
    onUpdateConfig({ ...config, bubbles: newBubbles });
  }, [config, onUpdateConfig]);

  const handleCreateDefaultBubbles = useCallback(() => {
    const defaultBubbles: Bubble[] = [
      {
        id: uuidv4(),
        name: 'Menu',
        icon: 'FaUtensils',
        displayMode: 'text-icon',
        styles: { ...DEFAULT_STYLES },
        externalContent: { type: 'text', title: 'Notre Menu' },
        internalContent: {
          type: 'menu',
          title: 'Menu du Restaurant',
          items: ['Entrées - À partir de 8€', 'Plats - À partir de 15€', 'Desserts - À partir de 6€'],
        },
        isVisible: true,
        order: 0,
      },
      {
        id: uuidv4(),
        name: 'Horaires',
        icon: 'FaClock',
        displayMode: 'text-icon',
        styles: { ...DEFAULT_STYLES, backgroundColor: '#1E90FF' },
        externalContent: { type: 'text', title: 'Horaires' },
        internalContent: {
          type: 'hours',
          title: 'Horaires d\'ouverture',
          items: ['Lundi : Fermé', 'Mardi - Vendredi : 12h - 14h30, 19h - 22h30', 'Samedi : 12h - 15h, 19h - 23h', 'Dimanche : 12h - 15h'],
        },
        isVisible: true,
        order: 1,
      },
      {
        id: uuidv4(),
        name: 'Contact',
        icon: 'FaPhone',
        displayMode: 'icon-only',
        styles: { ...DEFAULT_STYLES, backgroundColor: '#32CD32' },
        externalContent: { type: 'text', title: 'Contact' },
        internalContent: {
          type: 'contact',
          title: 'Nous contacter',
          text: config.restaurant.phone || 'Téléphone non renseigné',
        },
        isVisible: true,
        order: 2,
      },
      {
        id: uuidv4(),
        name: 'Promotions',
        icon: 'FaPercent',
        displayMode: 'text-only',
        styles: { ...DEFAULT_STYLES, backgroundColor: '#FF8C00', fontFamily: 'Bebas Neue, sans-serif' },
        externalContent: { type: 'text', title: 'PROMOS' },
        internalContent: {
          type: 'text',
          title: 'Promotions en cours',
          text: 'Menu du midi à 15€\n- Entrée + Plat + Dessert\n\nHappy Hour : 18h - 20h\n-50% sur les cocktails',
        },
        isVisible: true,
        order: 3,
      },
    ];
    onUpdateConfig({ ...config, bubbles: defaultBubbles });
  }, [config, onUpdateConfig]);

  const visibleBubbles = config.bubbles.filter(b => b.isVisible).sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-[#1a1a1a] border-b border-[#FFD700]/30 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {config.restaurant.logo ? (
              <img src={config.restaurant.logo} alt="Logo" className="w-10 h-10 object-cover rounded-full border-2 border-[#FFD700]" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#FFD700] flex items-center justify-center">
                <FaIcons.FaUtensils className="w-5 h-5 text-black" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-[#FFD700]">{config.restaurant.name}</h1>
              <p className="text-sm text-[#FFD700]/50">Administration</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onPreview} className="border-[#FFD700]/50 text-[#FFD700]">
              <FaIcons.FaEye className="w-4 h-4 mr-2" />
              Aperçu
            </Button>
            <Button variant="outline" onClick={() => setShowQrModal(true)} className="border-[#FFD700]/50 text-[#FFD700]">
              <FaIcons.FaQrcode className="w-4 h-4 mr-2" />
              QR
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#1a1a1a] border border-[#FFD700]/30 mb-6">
            <TabsTrigger value="buttons" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black text-[#FFD700]">
              Boutons
            </TabsTrigger>
            <TabsTrigger value="identity" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black text-[#FFD700]">
              Identité
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black text-[#FFD700]">
              Paramètres
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buttons" className="space-y-6">
            {config.bubbles.length === 0 ? (
              <Card className="bg-[#1a1a1a] border-[#FFD700]/30">
                <CardContent className="p-8 text-center">
                  <FaIcons.FaPlusCircle className="w-16 h-16 mx-auto text-[#FFD700]/30 mb-4" />
                  <h3 className="text-lg font-semibold text-[#FFD700] mb-2">Aucun bouton</h3>
                  <p className="text-[#FFD700]/50 mb-4">Créez vos boutons pour votre hub</p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={handleCreateDefaultBubbles} className="bg-[#FFD700] text-black hover:bg-[#FFA500]">
                      <FaIcons.FaMagic className="w-4 h-4 mr-2" />
                      Créer par défaut
                    </Button>
                    <Button variant="outline" onClick={handleAddBubble} className="border-[#FFD700]/50 text-[#FFD700]">
                      <FaIcons.FaPlus className="w-4 h-4 mr-2" />
                      Créer manuellement
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="bg-[#1a1a1a] border-[#FFD700]/30">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-[#FFD700]">Mes Boutons</CardTitle>
                      <CardDescription className="text-[#FFD700]/50">
                        {visibleBubbles.length} bouton{visibleBubbles.length > 1 ? 's' : ''} visible{visibleBubbles.length > 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                    <Button onClick={handleAddBubble} size="sm" className="bg-[#FFD700] text-black hover:bg-[#FFA500]">
                      <FaIcons.FaPlus className="w-4 h-4 mr-2" />
                      Ajouter
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2">
                        {config.bubbles.sort((a, b) => a.order - b.order).map((bubble, index) => (
                          <div 
                            key={bubble.id}
                            className="flex items-center gap-4 p-3 rounded-xl bg-black border border-[#FFD700]/20 hover:border-[#FFD700]/50 transition-colors cursor-pointer"
                            onClick={() => handleEditBubble(bubble)}
                          >
                            <span className="text-sm text-[#FFD700]/40 w-6">{index + 1}</span>
                            <div 
                              className="w-12 h-12 rounded-xl flex items-center justify-center"
                              style={{ 
                                backgroundColor: bubble.styles.backgroundColor === 'custom' ? '#1a1a1a' : bubble.styles.backgroundColor,
                                border: `2px solid ${bubble.styles.borderColor}`,
                              }}
                            >
                              <DynamicIcon iconName={bubble.icon} className="w-5 h-5" style={{ color: bubble.styles.iconColor }} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-[#FFD700]">{bubble.name}</h4>
                              <p className="text-xs text-[#FFD700]/50">{bubble.externalContent.title}</p>
                            </div>
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <Switch 
                                checked={bubble.isVisible}
                                onCheckedChange={() => handleToggleBubbleVisibility(bubble.id)}
                              />
                              <Button variant="ghost" size="icon" onClick={() => handleEditBubble(bubble)} className="text-[#FFD700]">
                                <FaIcons.FaPencilAlt className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Preview */}
                <Card className="bg-[#1a1a1a] border-[#FFD700]/30">
                  <CardHeader>
                    <CardTitle className="text-[#FFD700]">Aperçu (Style Orbital)</CardTitle>
                  </CardHeader>
                  <CardContent className="bg-black rounded-lg p-4">
                    {visibleBubbles.length === 0 ? (
                      <p className="text-center text-[#FFD700]/50 py-4">Aucun bouton visible</p>
                    ) : (
                      <div className="flex flex-wrap gap-4 justify-center">
                        {visibleBubbles.map((bubble) => {
                          const { displayMode, styles, externalContent, icon } = bubble;
                          const bubbleSize = displayMode === 'icon-only' ? 70 : displayMode === 'text-only' ? 90 : 80;
                          
                          return (
                            <div
                              key={bubble.id}
                              className="flex items-center justify-center rounded-full border-2"
                              style={{
                                backgroundColor: styles.backgroundColor === 'custom' 
                                  ? (styles.customBackgroundImage ? '#1a1a1a' : '#1a1a1a')
                                  : styles.backgroundColor,
                                backgroundImage: styles.customBackgroundImage 
                                  ? `url(${styles.customBackgroundImage})` 
                                  : undefined,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                borderColor: styles.borderColor,
                                width: bubbleSize,
                                height: bubbleSize,
                                boxShadow: `0 4px 20px ${styles.borderColor}40`,
                              }}
                            >
                              {displayMode === 'icon-only' && (
                                <DynamicIcon 
                                  iconName={icon}
                                  className="w-8 h-8"
                                  style={{ color: styles.iconColor }}
                                />
                              )}
                              
                              {displayMode === 'text-only' && (
                                <span 
                                  className="text-sm font-semibold text-center px-2"
                                  style={{ 
                                    color: styles.textColor,
                                    fontFamily: styles.fontFamily,
                                  }}
                                >
                                  {externalContent.title}
                                </span>
                              )}
                              
                              {displayMode === 'text-icon' && (
                                <div className="flex flex-col items-center gap-1">
                                  <DynamicIcon 
                                    iconName={icon}
                                    className="w-6 h-6"
                                    style={{ color: styles.iconColor }}
                                  />
                                  <span 
                                    className="text-xs font-medium text-center px-1"
                                    style={{ 
                                      color: styles.textColor,
                                      fontFamily: styles.fontFamily,
                                    }}
                                  >
                                    {externalContent.title}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="identity" className="space-y-6">
            <Card className="bg-[#1a1a1a] border-[#FFD700]/30">
              <CardHeader>
                <CardTitle className="text-[#FFD700]">Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#FFD700]">Nom</Label>
                    <Input value={config.restaurant.name} readOnly className="bg-black border-[#FFD700]/30 text-[#FFD700]" />
                  </div>
                  <div>
                    <Label className="text-[#FFD700]">Téléphone</Label>
                    <Input value={config.restaurant.phone || 'Non renseigné'} readOnly className="bg-black border-[#FFD700]/30 text-[#FFD700]" />
                  </div>
                </div>
                <div>
                  <Label className="text-[#FFD700]">Description</Label>
                  <Input value={config.restaurant.description || 'Non renseignée'} readOnly className="bg-black border-[#FFD700]/30 text-[#FFD700]" />
                </div>
                <div>
                  <Label className="text-[#FFD700]">Adresse</Label>
                  <Input value={config.restaurant.address || 'Non renseignée'} readOnly className="bg-black border-[#FFD700]/30 text-[#FFD700]" />
                </div>
                {config.restaurant.logo && (
                  <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#FFD700]">
                      <img src={config.restaurant.logo} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-[#1a1a1a] border-[#FFD700]/30">
              <CardHeader>
                <CardTitle className="text-[#FFD700]">Paramètres</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-[#FFD700]/20 rounded-lg">
                  <div>
                    <h4 className="font-medium text-[#FFD700]">Exporter</h4>
                    <p className="text-sm text-[#FFD700]/50">Téléchargez vos données</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const dataStr = JSON.stringify(config, null, 2);
                      const blob = new Blob([dataStr], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `restohub-${config.restaurant.name}.json`;
                      a.click();
                    }}
                    className="border-[#FFD700]/50 text-[#FFD700]"
                  >
                    <FaIcons.FaDownload className="w-4 h-4 mr-2" />
                    Exporter
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-[#FFD700]/20 rounded-lg">
                  <div>
                    <h4 className="font-medium text-[#FFD700]">Importer</h4>
                    <p className="text-sm text-[#FFD700]/50">Restaurer vos données</p>
                  </div>
                  <Input 
                    type="file" 
                    accept=".json"
                    className="w-auto bg-black border-[#FFD700]/30 text-[#FFD700]"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          try {
                            const imported = JSON.parse(event.target?.result as string);
                            onUpdateConfig(imported);
                          } catch (error) {
                            alert('Fichier invalide');
                          }
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-red-500/30 bg-red-500/10 rounded-lg">
                  <div>
                    <h4 className="font-medium text-red-400">Réinitialiser</h4>
                    <p className="text-sm text-red-400/50">Tout supprimer</p>
                  </div>
                  <Button variant="destructive" onClick={onReset}>
                    <FaIcons.FaTrash className="w-4 h-4 mr-2" />
                    Réinitialiser
                  </Button>
                </div>
              </CardContent>
            </Card>
                    {/* Background Settings Card */}
        <Card className="bg-[#1a1a1a] border-[#FFD700]/30 mt-6">
          <CardHeader>
            <CardTitle className="text-[#FFD700] flex items-center gap-2">
              <FaIcons.FaImage className="w-5 h-5" />
              Fond d'écran (Mode Client)
            </CardTitle>
            <CardDescription className="text-[#FFD700]/50">
              Personnalisez l'arrière-plan de la page publique
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Choix Type */}
            <div className="space-y-2">
              <Label className="text-[#FFD700]">Type de fond</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={config.background?.type === 'color' ? 'default' : 'outline'}
                  onClick={() => onUpdateConfig({
                    ...config,
                    background: { ...(config.background || {}), type: 'color', color: config.background?.color || '#000000' }
                  })}
                  className={config.background?.type === 'color' ? 'bg-[#FFD700] text-black' : 'border-[#FFD700]/50 text-[#FFD700]'}
                >
                  Couleur
                </Button>
                <Button
                  type="button"
                  variant={config.background?.type === 'image' ? 'default' : 'outline'}
                  onClick={() => onUpdateConfig({
                    ...config,
                    background: { ...(config.background || {}), type: 'image', imageUrl: config.background?.imageUrl || '' }
                  })}
                  className={config.background?.type === 'image' ? 'bg-[#FFD700] text-black' : 'border-[#FFD700]/50 text-[#FFD700]'}
                >
                  Image
                </Button>
              </div>
            </div>

            {/* Options Couleur */}
            {config.background?.type === 'color' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#FFD700]">Couleur</Label>
                  <div className="flex gap-2 flex-wrap items-center">
                    {COLOR_PALETTE.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => onUpdateConfig({
                          ...config,
                          background: { ...config.background, color: color.value }
                        })}
                        className={`w-8 h-8 rounded-full border-2 ${config.background?.color === color.value ? 'border-white scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: color.value }}
                      />
                    ))}
                    <input
                      type="color"
                      value={config.background?.color || '#000000'}
                      onChange={(e) => onUpdateConfig({
                        ...config,
                        background: { ...config.background, color: e.target.value }
                      })}
                      className="w-8 h-8 rounded-full cursor-pointer"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={config.background?.gradient || false}
                    onCheckedChange={(checked) => onUpdateConfig({
                      ...config,
                      background: { ...config.background, gradient: checked }
                    })}
                  />
                  <Label className="text-[#FFD700]">Dégradé</Label>
                </div>

                {config.background?.gradient && (
                  <div className="space-y-2">
                    <Label className="text-[#FFD700]">Couleur finale du dégradé</Label>
                    <div className="flex gap-2 flex-wrap">
                      {COLOR_PALETTE.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => onUpdateConfig({
                            ...config,
                            background: { ...config.background, gradientTo: color.value }
                          })}
                          className={`w-8 h-8 rounded-full border-2 ${config.background?.gradientTo === color.value ? 'border-white' : 'border-transparent'}`}
                          style={{ backgroundColor: color.value }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Options Image */}
            {config.background?.type === 'image' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#FFD700]">Image</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          onUpdateConfig({
                            ...config,
                            background: { ...config.background, imageUrl: reader.result as string }
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="bg-black border-[#FFD700]/30 text-[#FFD700]"
                  />
                  {config.background?.imageUrl && (
                    <div className="mt-2 h-32 rounded-lg overflow-hidden border border-[#FFD700]/30">
                      <img src={config.background.imageUrl} alt="Bg" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-[#FFD700]">Opacité ({Math.round((config.background?.opacity || 1) * 100)}%)</Label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={config.background?.opacity || 1}
                    onChange={(e) => onUpdateConfig({
                      ...config,
                      background: { ...config.background, opacity: parseFloat(e.target.value) }
                    })}
                    className="w-full accent-[#FFD700]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#FFD700]">Affichage</Label>
                  <Select
                    value={config.background?.size || 'cover'}
                    onValueChange={(value: 'cover' | 'contain' | 'repeat') => onUpdateConfig({
                      ...config,
                      background: { ...config.background, size: value }
                    })}
                  >
                    <SelectTrigger className="bg-black border-[#FFD700]/50 text-[#FFD700]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#FFD700]/50">
                      <SelectItem value="cover" className="text-[#FFD700]">Couvrir tout</SelectItem>
                      <SelectItem value="contain" className="text-[#FFD700]">Contenir</SelectItem>
                      <SelectItem value="repeat" className="text-[#FFD700]">Mosaïque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

          </TabsContent>
        </Tabs>
      </main>

      {/* Bubble Editor Modal */}
      <BubbleEditor
        bubble={editingBubble || undefined}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveBubble}
        onDelete={handleDeleteBubble}
        isNew={isNewBubble}
      />

      {/* QR Code Modal */}
      <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
        <DialogContent className="max-w-md bg-[#1a1a1a] border-2 border-[#FFD700]">
          <DialogHeader>
            <DialogTitle className="text-[#FFD700]">QR Code</DialogTitle>
            <DialogDescription className="text-[#FFD700]/50">
              Scannez pour accéder à votre hub
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center p-4">
            {qrCodeUrl && (
              <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64 mb-4" />
            )}
            <p className="text-sm text-[#FFD700]/50 text-center mb-4">
              Imprimez ce QR code et placez-le sur vos tables
            </p>
            <Button 
              onClick={() => {
                const a = document.createElement('a');
                a.href = qrCodeUrl;
                a.download = `qrcode-${config.restaurant.name}.png`;
                a.click();
              }}
              className="bg-[#FFD700] text-black hover:bg-[#FFA500]"
            >
              <FaIcons.FaDownload className="w-4 h-4 mr-2" />
              Télécharger
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
