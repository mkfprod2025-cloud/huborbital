// src/types/bubble.ts

// Palette de couleurs prédéfinie (8 couleurs)
export const COLOR_PALETTE = [
  { name: 'Or', value: '#FFD700', hex: '#FFD700' },
  { name: 'Rouge', value: '#DC143C', hex: '#DC143C' },
  { name: 'Bleu', value: '#1E90FF', hex: '#1E90FF' },
  { name: 'Vert', value: '#32CD32', hex: '#32CD32' },
  { name: 'Violet', value: '#9370DB', hex: '#9370DB' },
  { name: 'Orange', value: '#FF8C00', hex: '#FF8C00' },
  { name: 'Rose', value: '#FF69B4', hex: '#FF69B4' },
  { name: 'Turquoise', value: '#40E0D0', hex: '#40E0D0' },
] as const;

export type ColorChoice = typeof COLOR_PALETTE[number]['value'];

// 8 Polices distinctes
export const FONT_OPTIONS = [
  { value: 'Inter, sans-serif', label: 'Inter (Moderne)', import: 'Inter' },
  { value: 'Playfair Display, serif', label: 'Playfair (Élégant)', import: 'Playfair+Display' },
  { value: 'Roboto, sans-serif', label: 'Roboto (Classique)', import: 'Roboto' },
  { value: 'Bebas Neue, sans-serif', label: 'Bebas (Impact)', import: 'Bebas+Neue' },
  { value: 'Dancing Script, cursive', label: 'Dancing (Manuscrit)', import: 'Dancing+Script' },
  { value: 'Oswald, sans-serif', label: 'Oswald (Condensé)', import: 'Oswald' },
  { value: 'Lora, serif', label: 'Lora (Lecture)', import: 'Lora' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat (Géométrique)', import: 'Montserrat' },
] as const;

export type FontChoice = typeof FONT_OPTIONS[number]['value'];

export type ContentType = 'text' | 'image' | 'video' | 'menu' | 'hours' | 'contact' | 'link';

export interface BubbleStyles {
  backgroundColor: ColorChoice | 'custom';
  customBackgroundImage?: string;
  borderColor: ColorChoice;
  textColor: ColorChoice;
  iconColor: ColorChoice;
  fontFamily: FontChoice;
}

export interface BubbleContent {
  type: ContentType;
  title: string;
  text?: string;
  imageUrl?: string;
  videoUrl?: string;
  linkUrl?: string;
  items?: string[];
}

export interface Bubble {
  id: string;
  name: string;
  icon: string;
  displayMode: 'text-only' | 'icon-only' | 'text-icon';
  styles: BubbleStyles;
  externalContent: BubbleContent;
  internalContent: BubbleContent;
  isVisible: boolean;
  order: number;
  angle?: number;
}

export interface RestaurantInfo {
  name: string;
  description: string;
  logo?: string;
  centralContent: {
    type: 'video' | 'text-image';
    videoUrl?: string;
    text?: string;
    imageUrl?: string;
  };
  primaryColor: ColorChoice;
  borderColor: ColorChoice;
  textColor: ColorChoice;
  background?: PageBackground;
  phone?: string;
  email?: string;
  address?: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
  };
}

// Configuration du fond d'écran global (mode client)
export interface PageBackground {
  type: 'color' | 'image';
  color?: string;
  gradient?: boolean;
  gradientTo?: string;
  imageUrl?: string;
  opacity?: number;
  size?: 'cover' | 'contain' | 'repeat';
}

export interface AppConfig {
  restaurant: RestaurantInfo;
  bubbles: Bubble[];
  isInitialized: boolean;
  lastUpdated: string;
  background?: PageBackground; // Ajouté ici au niveau global
}

export const DEFAULT_STYLES: BubbleStyles = {
  backgroundColor: '#DC143C',
  borderColor: '#FFD700',
  textColor: '#FFD700',
  iconColor: '#FFD700',
  fontFamily: 'Inter, sans-serif',
};

export const ICON_OPTIONS = [
  { value: 'FaUtensils', label: 'Menu' },
  { value: 'FaClock', label: 'Horaires' },
  { value: 'FaPhone', label: 'Téléphone' },
  { value: 'FaMapMarkerAlt', label: 'Adresse' },
  { value: 'FaStar', label: 'Avis' },
  { value: 'FaCamera', label: 'Photos' },
  { value: 'FaVideo', label: 'Vidéos' },
  { value: 'FaPercent', label: 'Promo' },
  { value: 'FaCalendar', label: 'Événements' },
  { value: 'FaInfoCircle', label: 'Info' },
  { value: 'FaHeart', label: 'Favoris' },
  { value: 'FaShare', label: 'Partager' },
  { value: 'FaFacebook', label: 'Facebook' },
  { value: 'FaInstagram', label: 'Instagram' },
  { value: 'FaTwitter', label: 'Twitter' },
  { value: 'FaEnvelope', label: 'Email' },
  { value: 'FaHome', label: 'Accueil' },
  { value: 'FaShoppingBag', label: 'Commande' },
];

export const CONTENT_TYPE_OPTIONS = [
  { value: 'text', label: 'Texte' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Vidéo' },
  { value: 'menu', label: 'Menu' },
  { value: 'hours', label: 'Horaires' },
  { value: 'contact', label: 'Contact' },
  { value: 'link', label: 'Lien' },
];
