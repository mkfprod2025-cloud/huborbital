import { useState, useCallback } from 'react';
import type { Bubble, RestaurantInfo } from '@/types/bubble';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as FaIcons from 'react-icons/fa';

interface FlowerLayoutProps {
  bubbles: Bubble[];
  restaurant: RestaurantInfo;
  onBubbleClick?: (bubble: Bubble) => void;
}

// Dynamic icon component
const DynamicIcon = ({ iconName, className, style }: { iconName: string; className?: string; style?: React.CSSProperties }) => {
  const IconComponent = (FaIcons as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>)[iconName];
  if (!IconComponent) return <FaIcons.FaCircle className={className} style={style} />;
  return <IconComponent className={className} style={style} />;
};

// Internal content renderer for modal
const InternalContentRenderer = ({ content, fontFamily }: { content: Bubble['internalContent']; fontFamily: string }) => {
  switch (content.type) {
    case 'image':
      return (
        <div className="w-full flex justify-center">
          {content.imageUrl ? (
            <img src={content.imageUrl} alt={content.title} className="max-w-full h-auto rounded-lg" />
          ) : (
            <p className="text-[#FFD700]">Aucune image disponible</p>
          )}
        </div>
      );
    case 'video':
      return (
        <div className="w-full flex justify-center">
          {content.videoUrl ? (
            <video src={content.videoUrl} className="max-w-full h-auto rounded-lg" controls />
          ) : (
            <p className="text-[#FFD700]">Aucune vidéo disponible</p>
          )}
        </div>
      );
    case 'menu':
      return (
        <div className="space-y-3">
          {content.items?.map((item, index) => (
            <div key={index} className="p-3 bg-[#1a1a1a] border border-[#FFD700]/30 rounded-lg text-[#FFD700]" style={{ fontFamily }}>
              {item}
            </div>
          )) || <p className="text-[#FFD700]">Aucun item dans le menu</p>}
        </div>
      );
    case 'hours':
      return (
        <div className="space-y-2">
          {content.items?.map((item, index) => (
            <div key={index} className="flex justify-between p-3 bg-[#1a1a1a] border border-[#FFD700]/30 rounded text-[#FFD700]" style={{ fontFamily }}>
              <span>{item}</span>
            </div>
          )) || <p className="text-[#FFD700]">Horaires non définis</p>}
        </div>
      );
    case 'contact':
      return (
        <div className="space-y-4">
          {content.text && (
            <div className="p-4 bg-[#1a1a1a] border border-[#FFD700]/30 rounded-lg">
              <p className="whitespace-pre-wrap text-[#FFD700]" style={{ fontFamily }}>{content.text}</p>
            </div>
          )}
          {content.items?.map((item, index) => (
            <div key={index} className="flex items-center gap-2 p-2 text-[#FFD700]" style={{ fontFamily }}>
              <DynamicIcon iconName="FaPhone" className="w-4 h-4" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      );
    case 'link':
      return (
        <div className="text-center">
          {content.linkUrl ? (
            <a 
              href={content.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFD700] text-black rounded-lg hover:bg-[#FFA500] transition-colors font-semibold"
            >
              <DynamicIcon iconName="FaExternalLinkAlt" className="w-4 h-4" />
              Ouvrir le lien
            </a>
          ) : (
            <p className="text-[#FFD700]">Aucun lien défini</p>
          )}
        </div>
      );
    case 'text':
    default:
      return (
        <div className="prose max-w-none">
          {content.text ? (
            <p className="whitespace-pre-wrap text-[#FFD700]" style={{ fontFamily }}>{content.text}</p>
          ) : (
            <p className="text-[#FFD700]">Aucun contenu texte défini</p>
          )}
        </div>
      );
  }
};

export const FlowerLayout: React.FC<FlowerLayoutProps> = ({
  bubbles,
  restaurant,
  onBubbleClick,
}) => {
  const [selectedBubble, setSelectedBubble] = useState<Bubble | null>(null);

  const handleBubbleClick = useCallback((bubble: Bubble) => {
    setSelectedBubble(bubble);
    onBubbleClick?.(bubble);
  }, [onBubbleClick]);

  const visibleBubbles = bubbles.filter(b => b.isVisible).sort((a, b) => a.order - b.order);
  
  // Positionnement orbital - maximum 8 bulles satellites
  const maxBubbles = 8;
  const satelliteBubbles = visibleBubbles.slice(0, maxBubbles);
  
  // Calculer les positions en cercle
  const getOrbitalPosition = (index: number, total: number) => {
    const angle = (index * 360) / total - 90; // Commencer en haut
    const radian = (angle * Math.PI) / 180;
    const radius = 140; // Distance du centre
    return {
      x: Math.cos(radian) * radius,
      y: Math.sin(radian) * radius,
    };
  };

  // Get background style for bubble
  const getBubbleBackground = (styles: Bubble['styles']) => {
    if (styles.backgroundColor === 'custom' && styles.customBackgroundImage) {
      return {
        backgroundImage: `url(${styles.customBackgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    return {
      backgroundColor: styles.backgroundColor === 'custom' ? '#1a1a1a' : styles.backgroundColor,
    };
  };

  // Render bubble content based on displayMode
  const renderBubbleContent = (bubble: Bubble) => {
    const { displayMode, styles, externalContent, icon } = bubble;
    
    if (displayMode === 'icon-only') {
      return (
        <DynamicIcon 
          iconName={icon}
          className="w-8 h-8"
          style={{ color: styles.iconColor }}
        />
      );
    }
    
    if (displayMode === 'text-only') {
      return (
        <span 
          className="text-sm font-semibold text-center px-2"
          style={{ 
            color: styles.textColor,
            fontFamily: styles.fontFamily,
          }}
        >
          {externalContent.title}
        </span>
      );
    }
    
    // text-icon (default)
    return (
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
    );
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Header with Restaurant Name */}
      <header className="absolute top-6 left-0 right-0 text-center z-10">
        <h1 
          className="text-2xl md:text-3xl font-bold text-[#FFD700]"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          {restaurant.name}
        </h1>
        {restaurant.description && (
          <p className="text-[#FFD700]/60 text-sm mt-1 max-w-xs mx-auto">
            {restaurant.description}
          </p>
        )}
      </header>

      {/* Hub Orbital Container */}
      <div className="relative w-[360px] h-[360px] md:w-[450px] md:h-[450px] orbital-container">
        {/* Connection Lines SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {satelliteBubbles.map((_, index) => {
            const pos = getOrbitalPosition(index, satelliteBubbles.length);
            return (
              <line
                key={`line-${index}`}
                x1="50%"
                y1="50%"
                x2={`calc(50% + ${pos.x}px)`}
                y2={`calc(50% + ${pos.y}px)`}
                className="orbital-line"
                strokeWidth="1"
              />
            );
          })}
        </svg>

        {/* Central Logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="central-bubble w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-[#FFD700] bg-[#1a1a1a] flex items-center justify-center shadow-lg">
            {restaurant.logo ? (
              <img src={restaurant.logo} alt={restaurant.name} className="w-full h-full object-cover" />
            ) : (
              <DynamicIcon iconName="FaUtensils" className="w-12 h-12 md:w-16 md:h-16 text-[#FFD700]" />
            )}
          </div>
        </div>

        {/* Satellite Bubbles */}
        {satelliteBubbles.map((bubble, index) => {
          const pos = getOrbitalPosition(index, satelliteBubbles.length);
          const bubbleSize = bubble.displayMode === 'icon-only' ? 70 : 
                            bubble.displayMode === 'text-only' ? 90 : 80;
          
          return (
            <button
              key={bubble.id}
              onClick={() => handleBubbleClick(bubble)}
              className="orbital-bubble absolute flex items-center justify-center rounded-full border-2 transition-all duration-300 hover:scale-110"
              style={{
                ...getBubbleBackground(bubble.styles),
                borderColor: bubble.styles.borderColor,
                width: bubbleSize,
                height: bubbleSize,
                left: `calc(50% + ${pos.x}px - ${bubbleSize/2}px)`,
                top: `calc(50% + ${pos.y}px - ${bubbleSize/2}px)`,
                boxShadow: `0 4px 20px ${bubble.styles.borderColor}40`,
              }}
            >
              {renderBubbleContent(bubble)}
            </button>
          );
        })}

        {/* Empty state message */}
        {satelliteBubbles.length === 0 && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mt-24 text-center">
            <p className="text-[#FFD700]/50 text-sm">Aucun bouton configuré</p>
          </div>
        )}
      </div>

      {/* Footer with Social Links */}
      <footer className="absolute bottom-6 left-0 right-0">
        <div className="flex justify-center gap-6 mb-3">
          {restaurant.socialLinks.facebook && (
            <a href={restaurant.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
              <DynamicIcon iconName="FaFacebook" className="w-6 h-6 text-[#FFD700] hover:text-[#FFA500] transition-colors" />
            </a>
          )}
          {restaurant.socialLinks.instagram && (
            <a href={restaurant.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
              <DynamicIcon iconName="FaInstagram" className="w-6 h-6 text-[#FFD700] hover:text-[#FFA500] transition-colors" />
            </a>
          )}
          {restaurant.socialLinks.twitter && (
            <a href={restaurant.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
              <DynamicIcon iconName="FaTwitter" className="w-6 h-6 text-[#FFD700] hover:text-[#FFA500] transition-colors" />
            </a>
          )}
          {restaurant.socialLinks.website && (
            <a href={restaurant.socialLinks.website} target="_blank" rel="noopener noreferrer">
              <DynamicIcon iconName="FaGlobe" className="w-6 h-6 text-[#FFD700] hover:text-[#FFA500] transition-colors" />
            </a>
          )}
        </div>
        
        {restaurant.phone && (
          <p className="text-center text-[#FFD700]/70 text-sm mb-1">
            <a href={`tel:${restaurant.phone}`} className="hover:text-[#FFD700]">{restaurant.phone}</a>
          </p>
        )}
        {restaurant.address && (
          <p className="text-center text-[#FFD700]/70 text-sm">{restaurant.address}</p>
        )}
      </footer>

      {/* Modal for internal content */}
      <Dialog open={!!selectedBubble} onOpenChange={() => setSelectedBubble(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden bg-black border-2 border-[#FFD700]">
          <DialogHeader>
            <DialogTitle 
              className="flex items-center gap-3 text-[#FFD700]"
              style={{ fontFamily: selectedBubble?.styles.fontFamily }}
            >
              {selectedBubble && (
                <>
                  <DynamicIcon 
                    iconName={selectedBubble.icon} 
                    className="w-6 h-6"
                    style={{ color: selectedBubble.styles.iconColor }}
                  />
                  <span>{selectedBubble.internalContent.title || selectedBubble.externalContent.title}</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {selectedBubble && (
              <div className="p-4">
                <InternalContentRenderer 
                  content={selectedBubble.internalContent} 
                  fontFamily={selectedBubble.styles.fontFamily}
                />
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};
