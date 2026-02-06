import { useState, useCallback, useEffect } from 'react';
import type { Bubble, BubbleContent } from '@/types/bubble';
import { COLOR_PALETTE, FONT_OPTIONS, ICON_OPTIONS, CONTENT_TYPE_OPTIONS, DEFAULT_STYLES } from '@/types/bubble';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import * as FaIcons from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

interface BubbleEditorProps {
  bubble?: Bubble;
  isOpen: boolean;
  onClose: () => void;
  onSave: (bubble: Bubble) => void;
  onDelete?: (bubbleId: string) => void;
  isNew?: boolean;
}

const DynamicIcon = ({ iconName, className, style }: { iconName: string; className?: string; style?: React.CSSProperties }) => {
  const IconComponent = (FaIcons as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>)[iconName];
  if (!IconComponent) return <FaIcons.FaCircle className={className} style={style} />;
  return <IconComponent className={className} style={style} />;
};

const DEFAULT_BUBBLE: Bubble = {
  id: '',
  name: 'Nouveau Bouton',
  icon: 'FaInfoCircle',
  displayMode: 'text-icon',
  styles: { ...DEFAULT_STYLES },
  externalContent: {
    type: 'text',
    title: 'Nouveau Bouton',
    text: '',
  },
  internalContent: {
    type: 'text',
    title: 'Contenu',
    text: '',
  },
  isVisible: true,
  order: 0,
};

export const BubbleEditor: React.FC<BubbleEditorProps> = ({
  bubble,
  isOpen,
  onClose,
  onSave,
  onDelete,
  isNew = false,
}) => {
  const [editedBubble, setEditedBubble] = useState<Bubble>(DEFAULT_BUBBLE);
  const [activeTab, setActiveTab] = useState('appearance');
  const [usePhotoBg, setUsePhotoBg] = useState(false);

  useEffect(() => {
    if (bubble) {
      setEditedBubble({ ...bubble });
      setUsePhotoBg(bubble.styles.backgroundColor === 'custom' && !!bubble.styles.customBackgroundImage);
    } else if (isNew) {
      setEditedBubble({ ...DEFAULT_BUBBLE, id: uuidv4() });
      setUsePhotoBg(false);
    }
  }, [bubble, isNew, isOpen]);

  const updateBubbleField = useCallback(<K extends keyof Bubble>(field: K, value: Bubble[K]) => {
    setEditedBubble(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateExternalContent = useCallback((updates: Partial<BubbleContent>) => {
    setEditedBubble(prev => ({
      ...prev,
      externalContent: { ...prev.externalContent, ...updates },
    }));
  }, []);

  const updateInternalContent = useCallback((updates: Partial<BubbleContent>) => {
    setEditedBubble(prev => ({
      ...prev,
      internalContent: { ...prev.internalContent, ...updates },
    }));
  }, []);

  const updateStyles = useCallback((updates: Partial<Bubble['styles']>) => {
    setEditedBubble(prev => ({
      ...prev,
      styles: { ...prev.styles, ...updates },
    }));
  }, []);

  const handleSave = useCallback(() => {
    onSave(editedBubble);
    onClose();
  }, [editedBubble, onSave, onClose]);

  const handleDelete = useCallback(() => {
    if (onDelete && editedBubble.id) {
      onDelete(editedBubble.id);
      onClose();
    }
  }, [editedBubble.id, onDelete, onClose]);

  const handleFileUpload = useCallback((type: 'bg' | 'external' | 'internal', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'bg') {
          updateStyles({ customBackgroundImage: result, backgroundColor: 'custom' });
        } else if (type === 'external') {
          updateExternalContent({ imageUrl: result });
        } else {
          updateInternalContent({ imageUrl: result });
        }
      };
      reader.readAsDataURL(file);
    }
  }, [updateStyles, updateExternalContent, updateInternalContent]);

  // Preview component - orbital style
  const BubblePreview = () => {
    const { displayMode, styles, externalContent, icon } = editedBubble;
    const bubbleSize = displayMode === 'icon-only' ? 70 : displayMode === 'text-only' ? 90 : 80;
    
    return (
      <div className="p-6 bg-black rounded-full flex items-center justify-center" style={{ width: 200, height: 200 }}>
        <div
          className="flex items-center justify-center rounded-full border-2 transition-all"
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
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[95vh] overflow-hidden bg-[#1a1a1a] border-2 border-[#FFD700]">
        <DialogHeader>
          <DialogTitle className="text-[#FFD700]">
            {isNew ? 'Nouveau bouton' : 'Modifier le bouton'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black border border-[#FFD700]/30">
            <TabsTrigger value="appearance" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black text-[#FFD700]">
              Apparence
            </TabsTrigger>
            <TabsTrigger value="external" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black text-[#FFD700]">
              Bouton
            </TabsTrigger>
            <TabsTrigger value="internal" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black text-[#FFD700]">
              Contenu
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[50vh]">
            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-4 p-4">
              {/* Police de caractère */}
              <div className="space-y-2">
                <Label className="text-[#FFD700]">Police de caractère</Label>
                <Select
                  value={editedBubble.styles.fontFamily}
                  onValueChange={(value) => updateStyles({ fontFamily: value as typeof FONT_OPTIONS[number]['value'] })}
                >
                  <SelectTrigger className="bg-black border-[#FFD700]/50 text-[#FFD700]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#FFD700]/50 max-h-60">
                    {FONT_OPTIONS.map((font) => (
                      <SelectItem 
                        key={font.value} 
                        value={font.value} 
                        className="text-[#FFD700]"
                        style={{ fontFamily: font.value }}
                      >
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Background Choice */}
              <div className="space-y-2">
                <Label className="text-[#FFD700]">Fond du bouton</Label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={usePhotoBg}
                    onChange={(e) => {
                      setUsePhotoBg(e.target.checked);
                      if (!e.target.checked) {
                        updateStyles({ backgroundColor: COLOR_PALETTE[0].value, customBackgroundImage: undefined });
                      }
                    }}
                    className="w-4 h-4 accent-[#FFD700]"
                  />
                  <span className="text-[#FFD700]/70 text-sm">Utiliser une photo</span>
                </div>
                
                {usePhotoBg ? (
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('bg', e)}
                      className="bg-black border-[#FFD700]/50 text-[#FFD700]"
                    />
                    {editedBubble.styles.customBackgroundImage && (
                      <div className="h-20 rounded-lg overflow-hidden border border-[#FFD700]/30">
                        <img src={editedBubble.styles.customBackgroundImage} alt="Bg" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                ) : (
                  <Select
                    value={editedBubble.styles.backgroundColor === 'custom' ? COLOR_PALETTE[0].value : editedBubble.styles.backgroundColor}
                    onValueChange={(value) => updateStyles({ backgroundColor: value as typeof COLOR_PALETTE[number]['value'], customBackgroundImage: undefined })}
                  >
                    <SelectTrigger className="bg-black border-[#FFD700]/50 text-[#FFD700]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#FFD700]/50">
                      {COLOR_PALETTE.map((color) => (
                        <SelectItem key={color.value} value={color.value} className="text-[#FFD700]">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: color.value }} />
                            {color.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Border Color */}
              <div className="space-y-2">
                <Label className="text-[#FFD700]">Couleur de bordure</Label>
                <Select
                  value={editedBubble.styles.borderColor}
                  onValueChange={(value) => updateStyles({ borderColor: value as typeof COLOR_PALETTE[number]['value'] })}
                >
                  <SelectTrigger className="bg-black border-[#FFD700]/50 text-[#FFD700]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#FFD700]/50">
                    {COLOR_PALETTE.map((color) => (
                      <SelectItem key={color.value} value={color.value} className="text-[#FFD700]">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: color.value }} />
                          {color.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Text Color */}
              <div className="space-y-2">
                <Label className="text-[#FFD700]">Couleur du texte</Label>
                <Select
                  value={editedBubble.styles.textColor}
                  onValueChange={(value) => updateStyles({ textColor: value as typeof COLOR_PALETTE[number]['value'] })}
                >
                  <SelectTrigger className="bg-black border-[#FFD700]/50 text-[#FFD700]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#FFD700]/50">
                    {COLOR_PALETTE.map((color) => (
                      <SelectItem key={color.value} value={color.value} className="text-[#FFD700]">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: color.value }} />
                          {color.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Icon Color */}
              <div className="space-y-2">
                <Label className="text-[#FFD700]">Couleur de l'icône</Label>
                <Select
                  value={editedBubble.styles.iconColor}
                  onValueChange={(value) => updateStyles({ iconColor: value as typeof COLOR_PALETTE[number]['value'] })}
                >
                  <SelectTrigger className="bg-black border-[#FFD700]/50 text-[#FFD700]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#FFD700]/50">
                    {COLOR_PALETTE.map((color) => (
                      <SelectItem key={color.value} value={color.value} className="text-[#FFD700]">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: color.value }} />
                          {color.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <BubblePreview />
            </TabsContent>

            {/* External Content Tab */}
            <TabsContent value="external" className="space-y-4 p-4">
              {/* Mode d'affichage */}
              <div className="space-y-2">
                <Label className="text-[#FFD700]">Contenu affiché sur le bouton</Label>
                <RadioGroup
                  value={editedBubble.displayMode}
                  onValueChange={(value) => updateBubbleField('displayMode', value as Bubble['displayMode'])}
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-center space-x-2 p-3 border border-[#FFD700]/30 rounded-lg">
                    <RadioGroupItem value="text-only" id="text-only" className="border-[#FFD700] text-[#FFD700]" />
                    <Label htmlFor="text-only" className="text-[#FFD700] cursor-pointer flex-1">
                      Texte uniquement
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border border-[#FFD700]/30 rounded-lg">
                    <RadioGroupItem value="icon-only" id="icon-only" className="border-[#FFD700] text-[#FFD700]" />
                    <Label htmlFor="icon-only" className="text-[#FFD700] cursor-pointer flex-1">
                      Icône uniquement
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border border-[#FFD700]/30 rounded-lg">
                    <RadioGroupItem value="text-icon" id="text-icon" className="border-[#FFD700] text-[#FFD700]" />
                    <Label htmlFor="text-icon" className="text-[#FFD700] cursor-pointer flex-1">
                      Texte + Icône
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Icon selection (if not text-only) */}
              {editedBubble.displayMode !== 'text-only' && (
                <div className="space-y-2">
                  <Label className="text-[#FFD700]">Icône</Label>
                  <Select
                    value={editedBubble.icon}
                    onValueChange={(value) => updateBubbleField('icon', value)}
                  >
                    <SelectTrigger className="bg-black border-[#FFD700]/50 text-[#FFD700]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#FFD700]/50 max-h-60">
                      {ICON_OPTIONS.map((icon) => (
                        <SelectItem key={icon.value} value={icon.value} className="text-[#FFD700]">
                          <div className="flex items-center gap-2">
                            <DynamicIcon iconName={icon.value} className="w-4 h-4" />
                            {icon.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Text input (if not icon-only) */}
              {editedBubble.displayMode !== 'icon-only' && (
                <div className="space-y-2">
                  <Label className="text-[#FFD700]">Titre affiché</Label>
                  <Input
                    value={editedBubble.externalContent.title}
                    onChange={(e) => updateExternalContent({ title: e.target.value })}
                    placeholder="Ex: Notre Menu"
                    className="bg-black border-[#FFD700]/50 text-[#FFD700] placeholder:text-[#FFD700]/30"
                    style={{ fontFamily: editedBubble.styles.fontFamily }}
                  />
                </div>
              )}

              <BubblePreview />
            </TabsContent>

            {/* Internal Content Tab */}
            <TabsContent value="internal" className="space-y-4 p-4">
              <div className="space-y-2">
                <Label className="text-[#FFD700]">Type de contenu</Label>
                <Select
                  value={editedBubble.internalContent.type}
                  onValueChange={(value: BubbleContent['type']) => updateInternalContent({ type: value })}
                >
                  <SelectTrigger className="bg-black border-[#FFD700]/50 text-[#FFD700]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#FFD700]/50">
                    {CONTENT_TYPE_OPTIONS.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="text-[#FFD700]">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[#FFD700]">Titre du contenu</Label>
                <Input
                  value={editedBubble.internalContent.title}
                  onChange={(e) => updateInternalContent({ title: e.target.value })}
                  placeholder="Titre dans la fenêtre"
                  className="bg-black border-[#FFD700]/50 text-[#FFD700] placeholder:text-[#FFD700]/30"
                  style={{ fontFamily: editedBubble.styles.fontFamily }}
                />
              </div>

              {(editedBubble.internalContent.type === 'image' || editedBubble.internalContent.type === 'video') && (
                <div className="space-y-2">
                  <Label className="text-[#FFD700]">
                    {editedBubble.internalContent.type === 'image' ? 'Image' : 'Vidéo'}
                  </Label>
                  <Input
                    type="file"
                    accept={editedBubble.internalContent.type === 'image' ? 'image/*' : 'video/*'}
                    onChange={(e) => handleFileUpload('internal', e)}
                    className="bg-black border-[#FFD700]/50 text-[#FFD700]"
                  />
                </div>
              )}

              {(editedBubble.internalContent.type === 'text' || editedBubble.internalContent.type === 'contact') && (
                <div className="space-y-2">
                  <Label className="text-[#FFD700]">Texte</Label>
                  <Textarea
                    value={editedBubble.internalContent.text || ''}
                    onChange={(e) => updateInternalContent({ text: e.target.value })}
                    placeholder="Contenu détaillé..."
                    className="bg-black border-[#FFD700]/50 text-[#FFD700] placeholder:text-[#FFD700]/30"
                    rows={4}
                    style={{ fontFamily: editedBubble.styles.fontFamily }}
                  />
                </div>
              )}

              {(editedBubble.internalContent.type === 'menu' || editedBubble.internalContent.type === 'hours') && (
                <div className="space-y-2">
                  <Label className="text-[#FFD700]">Liste des items</Label>
                  {(editedBubble.internalContent.items || []).map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) => {
                          const newItems = [...(editedBubble.internalContent.items || [])];
                          newItems[index] = e.target.value;
                          updateInternalContent({ items: newItems });
                        }}
                        placeholder={editedBubble.internalContent.type === 'menu' ? "Plat - Prix" : "Jour : Horaires"}
                        className="bg-black border-[#FFD700]/50 text-[#FFD700]"
                        style={{ fontFamily: editedBubble.styles.fontFamily }}
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          const newItems = (editedBubble.internalContent.items || []).filter((_, i) => i !== index);
                          updateInternalContent({ items: newItems });
                        }}
                      >
                        <FaIcons.FaTrash className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newItems = [...(editedBubble.internalContent.items || []), ''];
                      updateInternalContent({ items: newItems });
                    }}
                    className="border-[#FFD700]/50 text-[#FFD700]"
                  >
                    <FaIcons.FaPlus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
              )}

              {editedBubble.internalContent.type === 'link' && (
                <div className="space-y-2">
                  <Label className="text-[#FFD700]">URL du lien</Label>
                  <Input
                    value={editedBubble.internalContent.linkUrl || ''}
                    onChange={(e) => updateInternalContent({ linkUrl: e.target.value })}
                    placeholder="https://..."
                    className="bg-black border-[#FFD700]/50 text-[#FFD700] placeholder:text-[#FFD700]/30"
                  />
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="gap-2">
          {!isNew && onDelete && (
            <Button variant="destructive" onClick={handleDelete}>
              <FaIcons.FaTrash className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
          )}
          <Button variant="outline" onClick={onClose} className="border-[#FFD700]/50 text-[#FFD700]">
            Annuler
          </Button>
          <Button onClick={handleSave} className="bg-[#FFD700] text-black hover:bg-[#FFA500]">
            <FaIcons.FaSave className="w-4 h-4 mr-2" />
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
