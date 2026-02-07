import { useState, useCallback, useEffect } from 'react';
import type { Bubble, RestaurantInfo } from '@/types/bubble';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as FaIcons from 'react-icons/fa';

interface ColumnLayoutProps {
  bubbles: Bubble[];
  restaurant: RestaurantInfo;
  onBubbleClick?: (bubble: Bubble) => void;
}

// Dynamic icon component
const DynamicIcon = ({ iconName, className, style }: { iconName: string; className?: string; style?: React.CSSProperties }) => {
  const IconComponent = (FaIcons as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>)[iconName];
  if (!IconComponent) {
    return <FaIcons.FaCircle className={className} style={style} />;
  }
  return <IconComponent className={className} style={style} />;
};

// Internal content renderer for modal
const InternalContentRenderer = ({ content }: { content: Bubble['internalContent'] }) => {
  switch (content.type) {
    case 'image':
      return (
        <div className="w-full flex justify-center">
          {content.imageUrl ? (
            <img 
              src={content.imageUrl} 
              alt={content.title}
              className="max-w-full h-auto rounded-lg"
            />
          ) : (
            <p className="text-[#FFD700]">Aucune image disponible</p>
          )}
        </div>
      );
    case 'video':
      return (
        <div className="w-full flex justify-center">
          {content.videoUrl ? (
            <video 
              src={content.videoUrl}
              className="max-w-full h-auto rounded-lg"
              controls
            />
          ) : (
            <p className="text-[#FFD700]">Aucune vidéo disponible</p>
          )}
        </div>
      );
    case 'menu':
      return (
        <div className="space-y-4">
          {content.items?.map((item, index) => (
            <div key={index} className="p-3 bg-[#1a1a1a] border border-[#FFD700]/30 rounded-lg text-[#FFD700]">
              {item}
            </div>
          )) || <p className="text-[#FFD700]">Aucun item dans le menu</p>}
        </div>
      );
    case 'hours':
      return (
        <div className="space-y-2">
          {content.items?.map((item, index) => (
            <div key={index} className="flex justify-between p-3 bg-[#1a1a1a] border border-[#FFD700]/30 rounded text-[#FFD700]">
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
              <p className="whitespace-pre-wrap text-[#FFD700]">{content.text}</p>
            </div>
          )}
          {content.items?.map((item, index) => (
            <div key={index} className="flex items-center gap-2 p-2 text-[#FFD700]">
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
            <p className="whitespace-pre-wrap text-[#FFD700]">{content.text}</p>
          ) : (
            <p className="text-[#FFD700]">Aucun contenu texte défini</p>
          )}
        </div>
      );
  }
};

export const ColumnLayout: React.FC<ColumnLayoutProps> = ({
  bubbles,
  restaurant,
  onBubbleClick,
}) => {
  const [selectedBubble, setSelectedBubble] = useState<Bubble | null>(null);
  // --- CODE AJOUTÉ POUR LE FAVICON ---
  useEffect(() => {
    // On cible la balise créée dans index.html
    const favicon = document.getElementById('favicon-dynamique') as HTMLLinkElement;
    
    // Si la balise existe et que le restaurant a un logo, on change l'image
    if (favicon && restaurant.logo) {
      favicon.href = restaurant.logo;
    }
  }, [restaurant.logo]); // Se déclenche dès que le logo change
  // -----------------------------------

  const handleBubbleClick = useCallback((bubble: Bubble) => {
    setSelectedBubble(bubble);
    onBubbleClick?.(bubble);
  }, [onBubbleClick]);

  const visibleBubbles = bubbles.filter(b => b.isVisible).sort((a, b) => a.order - b.order);

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

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header with Logo */}
      <header className="flex flex-col items-center pt-6 pb-4 px-4">
        {/* Central Logo Circle */}
        <div className="relative w-32 h-32 mb-4">
          <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#FFD700] bg-[#1a1a1a] flex items-center justify-center">
            {restaurant.logo ? (
              <img 
                src={restaurant.logo} 
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <DynamicIcon iconName="FaUtensils" className="w-12 h-12 text-[#FFD700]" />
            )}
          </div>
        </div>
        
        {/* Restaurant Name */}
        <h1 className="text-2xl font-bold text-[#FFD700] text-center">
          {restaurant.name}
        </h1>
        {restaurant.description && (
          <p className="text-[#FFD700]/70 text-sm text-center mt-1 max-w-xs">
            {restaurant.description}
          </p>
        )}
      </header>

      {/* Central Content (Video or Text+Image) */}
      <section className="px-4 mb-6">
        {restaurant.centralContent.type === 'video' && restaurant.centralContent.videoUrl ? (
          <div className="w-full aspect-video rounded-2xl overflow-hidden border-2 border-[#FFD700]/50">
            <video 
              src={restaurant.centralContent.videoUrl}
              className="w-full h-full object-cover"
              controls
              poster={restaurant.logo}
            />
          </div>
        ) : (
          <div className="w-full rounded-2xl overflow-hidden border-2 border-[#FFD700]/50 bg-[#1a1a1a]">
            {restaurant.centralContent.imageUrl && (
              <img 
                src={restaurant.centralContent.imageUrl}
                alt="Contenu central"
                className="w-full h-48 object-cover"
              />
            )}
            {restaurant.centralContent.text && (
              <div className="p-4">
                <p className="text-[#FFD700] text-center whitespace-pre-wrap">
                  {restaurant.centralContent.text}
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Buttons Column */}
      <main className="flex-1 px-4 pb-6 space-y-3">
        {visibleBubbles.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[#FFD700]/50">Aucun bouton configuré</p>
          </div>
        ) : (
          visibleBubbles.map((bubble) => (
            <button
              key={bubble.id}
              onClick={() => handleBubbleClick(bubble)}
              className="w-full py-4 px-6 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-4"
              style={{
                ...getBubbleBackground(bubble.styles),
                borderColor: bubble.styles.borderColor,
              }}
            >
              {/* Icon */}
              <DynamicIcon 
                iconName={bubble.icon}
                className="w-6 h-6 flex-shrink-0"
                style={{ color: bubble.styles.iconColor }}
              />
              
              {/* Text */}
              <span 
                className="flex-1 text-left font-semibold text-lg"
                style={{ color: bubble.styles.textColor }}
              >
                {bubble.externalContent.title}
              </span>
              
              {/* Arrow */}
              <DynamicIcon 
                iconName="FaChevronRight"
                className="w-5 h-5 flex-shrink-0"
                style={{ color: bubble.styles.iconColor }}
              />
            </button>
          ))
        )}
      </main>

      {/* Footer with Social Links */}
      <footer className="px-4 py-4 border-t border-[#FFD700]/20">
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
            <a href={`tel:${restaurant.phone}`} className="hover:text-[#FFD700]">
              {restaurant.phone}
            </a>
          </p>
        )}
        {restaurant.address && (
          <p className="text-center text-[#FFD700]/70 text-sm">
            {restaurant.address}
          </p>
        )}
      </footer>

      {/* Modal for internal content */}
      <Dialog open={!!selectedBubble} onOpenChange={() => setSelectedBubble(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden bg-black border-2 border-[#FFD700]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-[#FFD700]">
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
                <InternalContentRenderer content={selectedBubble.internalContent} />
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};
