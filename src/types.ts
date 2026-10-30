export type Language = 'bn' | 'en';

export type ToolCategory = 'image' | 'pdf' | 'text' | 'creator' | string;

export interface LocalizedString {
  en: string;
  bn: string;
}

export type ToolStatus = 'ready' | 'beta' | 'maintenance' | 'disabled';

export type ToolType = 'interactive' | 'iframe' | 'external' | 'custom_code';

export interface ToolDefinition {
  id: string;
  slug: string;
  category: ToolCategory;
  name: LocalizedString;
  shortDescription: LocalizedString;
  description: LocalizedString;
  icon: string;
  keywords: string[];
  popular?: boolean;
  featured?: boolean;
  status: ToolStatus;
  isLocalOnly: boolean;
  displayOrder?: number;
  maintenanceMessage?: LocalizedString;
  toolType?: ToolType;
  embedUrl?: string;
  customHtml?: string;
  features?: LocalizedString[];
  faqs?: Array<{ question: LocalizedString; answer: LocalizedString }>;
}

export interface CategoryDefinition {
  id: string;
  slug: string;
  name: LocalizedString;
  description: LocalizedString;
  icon: string;
  color: string;
  displayOrder?: number;
}

export type AdPlacement = 
  | 'ad-header-top' 
  | 'ad-home-mid' 
  | 'ad-tool-top' 
  | 'ad-tool-bottom' 
  | 'ad-sidebar' 
  | 'ad-footer';

export type AdType = 'adsense' | 'custom_banner' | 'html_code';

export interface AdvertisementConfig {
  id: string;
  title: string;
  placement: AdPlacement | string;
  type: AdType;
  active: boolean;
  // AdSense props
  adSenseSlot?: string;
  adSenseFormat?: 'auto' | 'rectangle' | 'horizontal' | 'banner';
  // Custom Banner props
  bannerImageUrl?: string;
  targetUrl?: string;
  openInNewTab?: boolean;
  altText?: string;
  // Custom HTML / Script
  htmlContent?: string;
  // Stats & scheduling
  impressions?: number;
  clicks?: number;
  startDate?: string;
  endDate?: string;
  updatedAt?: string;
}

export interface HomepageSectionVisibility {
  hero: boolean;
  topAd: boolean;
  popularTools: boolean;
  categories: boolean;
  recentTools: boolean;
  allTools: boolean;
  midAd: boolean;
  features: boolean;
  faqPreview: boolean;
  bottomAd: boolean;
}

export interface HomepageConfig {
  heroTitle: LocalizedString;
  heroSubtitle: LocalizedString;
  heroCtaPrimaryText: LocalizedString;
  heroCtaPrimaryLink: string;
  heroCtaSecondaryText: LocalizedString;
  heroCtaSecondaryLink: string;
  heroStylePreset: 'modern_glow' | 'cyber_midnight' | 'emerald_clean' | 'purple_sleek';
  showSearchBar: boolean;
  sections: HomepageSectionVisibility;
  sectionOrder: string[];
  updatedAt?: string;
}

export interface CMSPage {
  id: string;
  slug: string;
  title: LocalizedString;
  subtitle: LocalizedString;
  content: LocalizedString;
  sections?: Array<{
    heading: LocalizedString;
    body: LocalizedString;
  }>;
  faqs?: Array<{
    question: LocalizedString;
    answer: LocalizedString;
  }>;
  lastUpdated: string;
}

export interface SEOSettings {
  metaTitle: LocalizedString;
  metaDescription: LocalizedString;
  metaKeywords: string[];
  ogImageUrl: string;
  twitterHandle: string;
  googleVerification: string;
  bingVerification: string;
  canonicalBaseUrl: string;
  robotsTxtContent: string;
  updatedAt?: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  active: boolean;
  targetAudience: 'all' | 'logged_in' | 'unregistered';
  placement: 'header_banner' | 'dashboard_banner' | 'all';
  dismissible: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ActiveSession {
  sessionId: string;
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  currentPath: string;
  userAgent?: string;
  deviceType?: 'Desktop' | 'Mobile' | 'Tablet';
  lastSeen: string;
}

export interface AdminAuditLog {
  id: string;
  adminUid: string;
  adminEmail: string;
  action: string;
  category: 'USER' | 'TOOL' | 'CATEGORY' | 'AD' | 'CMS' | 'SETTINGS' | 'ANNOUNCEMENT' | 'AUTH' | 'THEME';
  targetId?: string;
  details: string;
  timestamp: string;
}

export interface AdminRoleItem {
  uid: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  assignedAt: string;
  assignedBy: string;
  notes?: string;
}

export type ThemeAccentColor = 'indigo' | 'cyan' | 'emerald' | 'purple' | 'amber' | 'rose';

export interface SiteSettings {
  siteName: string;
  siteTagline: LocalizedString;
  primaryMarket: string;
  logoUrl?: string;
  faviconUrl?: string;
  maintenanceMode: boolean;
  maintenanceMessage?: LocalizedString;
  allowNewRegistrations: boolean;
  defaultLanguage: 'bn' | 'en';
  defaultTheme: 'dark' | 'light' | 'system';
  themeAccentColor: ThemeAccentColor;
  allowUserThemeToggle: boolean;
  adsensePublisherId: string;
  contactEmail: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    github?: string;
    youtube?: string;
    telegram?: string;
  };
  customCss?: string;
  customHeaderCode?: string;
  customFooterCode?: string;
  updatedAt?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  createdAt: string;
}
