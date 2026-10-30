import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../config/firebase';
import { toolsRegistry, categories as defaultCategories } from '../config/toolsRegistry';
import {
  ToolDefinition,
  CategoryDefinition,
  AdvertisementConfig,
  HomepageConfig,
  CMSPage,
  SEOSettings,
  SiteSettings,
  AnnouncementItem,
  ActiveSession,
  AdminAuditLog,
  AdminRoleItem,
  AdPlacement,
  ContactMessage,
} from '../types';

// ==========================================
// 1. TOOL MANAGEMENT CMS
// ==========================================

export async function fetchAllTools(): Promise<ToolDefinition[]> {
  try {
    const snap = await getDocs(collection(db, 'tools'));
    if (snap.empty) {
      return toolsRegistry;
    }

    const firestoreTools: Record<string, ToolDefinition> = {};
    snap.forEach((d) => {
      firestoreTools[d.id] = { id: d.id, ...(d.data() as Omit<ToolDefinition, 'id'>) };
    });

    // Merge static registry with Firestore data (Firestore wins for metadata overrides)
    const merged = toolsRegistry.map((st) => {
      if (firestoreTools[st.id]) {
        return {
          ...st,
          ...firestoreTools[st.id],
        };
      }
      return st;
    });

    // Add any purely custom tools created in Firestore that aren't in static registry
    snap.forEach((d) => {
      if (!toolsRegistry.some((st) => st.id === d.id)) {
        merged.push({ id: d.id, ...(d.data() as Omit<ToolDefinition, 'id'>) });
      }
    });

    // Sort by displayOrder or default
    return merged.sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));
  } catch (err) {
    console.warn('Fallback to static tools registry:', err);
    return toolsRegistry;
  }
}

export async function saveToolMetadata(tool: ToolDefinition): Promise<void> {
  const ref = doc(db, 'tools', tool.id);
  try {
    await setDoc(ref, {
      ...tool,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `tools/${tool.id}`);
  }
}

export async function deleteToolMetadata(toolId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'tools', toolId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `tools/${toolId}`);
  }
}

export async function seedAllDefaultTools(): Promise<void> {
  for (const t of toolsRegistry) {
    const ref = doc(db, 'tools', t.id);
    await setDoc(ref, {
      ...t,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  }
}

// ==========================================
// 2. CATEGORY MANAGEMENT CMS
// ==========================================

export async function fetchCategories(): Promise<CategoryDefinition[]> {
  try {
    const snap = await getDocs(collection(db, 'categories'));
    if (snap.empty) {
      return defaultCategories;
    }
    const list: CategoryDefinition[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...(d.data() as Omit<CategoryDefinition, 'id'>) });
    });
    return list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  } catch (err) {
    console.warn('Fallback to default categories:', err);
    return defaultCategories;
  }
}

export async function saveCategory(category: CategoryDefinition): Promise<void> {
  const ref = doc(db, 'categories', category.id);
  try {
    await setDoc(ref, {
      ...category,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `categories/${category.id}`);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'categories', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `categories/${id}`);
  }
}

// ==========================================
// 3. ADVERTISEMENT MANAGEMENT
// ==========================================

export const DEFAULT_ADSENSE_PUBLISHER = 'ca-pub-7020708438639987';

export const DEFAULT_AD_SLOTS: AdvertisementConfig[] = [
  {
    id: 'ad-header-top',
    title: 'Top Header Banner',
    placement: 'ad-header-top',
    type: 'adsense',
    active: true,
    adSenseSlot: '',
    adSenseFormat: 'banner',
    impressions: 0,
    clicks: 0,
  },
  {
    id: 'ad-home-mid',
    title: 'Homepage In-between Tools Section',
    placement: 'ad-home-mid',
    type: 'adsense',
    active: true,
    adSenseSlot: '',
    adSenseFormat: 'horizontal',
    impressions: 0,
    clicks: 0,
  },
  {
    id: 'ad-tool-top',
    title: 'Tool Page Top Responsive Slot',
    placement: 'ad-tool-top',
    type: 'adsense',
    active: true,
    adSenseSlot: '',
    adSenseFormat: 'banner',
    impressions: 0,
    clicks: 0,
  },
  {
    id: 'ad-tool-bottom',
    title: 'Tool Page Bottom Sponsored Banner',
    placement: 'ad-tool-bottom',
    type: 'adsense',
    active: true,
    adSenseSlot: '',
    adSenseFormat: 'rectangle',
    impressions: 0,
    clicks: 0,
  },
  {
    id: 'ad-sidebar',
    title: 'Tool & Category Sidebar Ad',
    placement: 'ad-sidebar',
    type: 'adsense',
    active: true,
    adSenseSlot: '',
    adSenseFormat: 'rectangle',
    impressions: 0,
    clicks: 0,
  },
  {
    id: 'ad-footer',
    title: 'Global Footer Responsive Ad',
    placement: 'ad-footer',
    type: 'adsense',
    active: true,
    adSenseSlot: '',
    adSenseFormat: 'horizontal',
    impressions: 0,
    clicks: 0,
  },
];

export async function fetchAdvertisements(): Promise<AdvertisementConfig[]> {
  try {
    const snap = await getDocs(collection(db, 'advertisements'));
    if (snap.empty) {
      return DEFAULT_AD_SLOTS;
    }
    const list: AdvertisementConfig[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...(d.data() as Omit<AdvertisementConfig, 'id'>) });
    });

    const missingDefaults = DEFAULT_AD_SLOTS.filter((def) => !list.some((a) => a.id === def.id));
    return [...list, ...missingDefaults];
  } catch (err) {
    console.warn('Fallback to default ad slots:', err);
    return DEFAULT_AD_SLOTS;
  }
}

export async function saveAdvertisement(ad: AdvertisementConfig): Promise<void> {
  const ref = doc(db, 'advertisements', ad.id);
  try {
    await setDoc(ref, {
      ...ad,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `advertisements/${ad.id}`);
  }
}

export async function deleteAdvertisement(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'advertisements', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `advertisements/${id}`);
  }
}

// ==========================================
// 4. HOMEPAGE EDITOR CMS
// ==========================================

export const DEFAULT_HOMEPAGE_CONFIG: HomepageConfig = {
  heroTitle: {
    en: 'All Your Essential Online Tools in One Fast, Private Place',
    bn: 'আপনার প্রয়োজনীয় সব অনলাইন টুলস এক জায়গায় — দ্রুত ও নিরাপদ',
  },
  heroSubtitle: {
    en: 'Process images, PDFs, text, and creator utilities 100% locally in your browser. Zero cloud file uploads, maximum privacy, in Bengali & English.',
    bn: 'ছবি, পিডিএফ, টেক্সট এবং ক্রিয়েটর টুলস ব্যবহার করুন সম্পূর্ণ ব্রাউজারে। কোনো ফাইল আপলোড ছাড়াই ১০০% গোপনীয়তা ও সর্বোচ্চ নিরাপত্তা।',
  },
  heroCtaPrimaryText: {
    en: 'Browse All 39+ Free Tools',
    bn: 'সব ৩৯+ ফ্রি টুলস দেখুন',
  },
  heroCtaPrimaryLink: '/tools',
  heroCtaSecondaryText: {
    en: 'Create Free Account',
    bn: 'ফ্রি একাউন্ট খুলুন',
  },
  heroCtaSecondaryLink: '/signup',
  heroStylePreset: 'modern_glow',
  showSearchBar: true,
  sections: {
    hero: true,
    topAd: true,
    popularTools: true,
    categories: true,
    recentTools: true,
    allTools: true,
    midAd: true,
    features: true,
    faqPreview: true,
    bottomAd: true,
  },
  sectionOrder: [
    'hero',
    'topAd',
    'popularTools',
    'categories',
    'recentTools',
    'allTools',
    'midAd',
    'features',
    'faqPreview',
    'bottomAd',
  ],
};

export async function fetchHomepageConfig(): Promise<HomepageConfig> {
  try {
    const snap = await getDoc(doc(db, 'homepageContent', 'config'));
    if (snap.exists()) {
      return { ...DEFAULT_HOMEPAGE_CONFIG, ...(snap.data() as HomepageConfig) };
    }
    return DEFAULT_HOMEPAGE_CONFIG;
  } catch (err) {
    console.warn('Fallback to default homepage config:', err);
    return DEFAULT_HOMEPAGE_CONFIG;
  }
}

export async function saveHomepageConfig(config: HomepageConfig): Promise<void> {
  try {
    await setDoc(doc(db, 'homepageContent', 'config'), {
      ...config,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'homepageContent/config');
  }
}

// ==========================================
// 5. PAGES & STATIC CMS (About, Terms, Privacy, FAQ, etc.)
// ==========================================

export async function fetchCMSPage(pageId: string): Promise<CMSPage | null> {
  try {
    const snap = await getDoc(doc(db, 'pages', pageId));
    if (snap.exists()) {
      return { id: snap.id, ...(snap.data() as Omit<CMSPage, 'id'>) };
    }
    return null;
  } catch (err) {
    console.warn(`Error fetching CMS page ${pageId}:`, err);
    return null;
  }
}

export async function saveCMSPage(page: CMSPage): Promise<void> {
  try {
    await setDoc(doc(db, 'pages', page.id), {
      ...page,
      lastUpdated: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `pages/${page.id}`);
  }
}

// ==========================================
// 6. SEO SETTINGS
// ==========================================

export const DEFAULT_SEO_SETTINGS: SEOSettings = {
  metaTitle: {
    en: 'SobTools — All Your Tools in One Place | Free Online Utilities',
    bn: 'SobTools — সব টুলস এক জায়গায় | ফ্রি অনলাইন ইউটিলিটি',
  },
  metaDescription: {
    en: 'Free, fast, and secure online browser-based tools for image compression, PDF merge/split, Bengali text processing, and developer utilities.',
    bn: 'ছবি কম্প্রেস, পিডিএফ কনভার্ট ও মার্জ, বাংলা টেক্সট ফরম্যাটিং এবং ডেভেলপার টুলস সম্পূর্ণ ফ্রিতে ব্যবহার করুন।',
  },
  metaKeywords: [
    'online tools',
    'image compressor',
    'pdf merge',
    'free utilities bangladesh',
    'সবটুলস',
    'ছবি ছোট করার সফটওয়্যার',
    'পিডিএফ এডিটর',
    'qr code generator',
  ],
  ogImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
  twitterHandle: '@SobToolsOfficial',
  googleVerification: 'ca-pub-7020708438639987',
  bingVerification: '',
  canonicalBaseUrl: 'https://sobtools.com',
  robotsTxtContent: `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /dashboard

Sitemap: https://sobtools.com/sitemap.xml`,
};

export async function fetchSEOSettings(): Promise<SEOSettings> {
  try {
    const snap = await getDoc(doc(db, 'siteSettings', 'seo'));
    if (snap.exists()) {
      return { ...DEFAULT_SEO_SETTINGS, ...(snap.data() as SEOSettings) };
    }
    return DEFAULT_SEO_SETTINGS;
  } catch (err) {
    console.warn('Fallback to default SEO settings:', err);
    return DEFAULT_SEO_SETTINGS;
  }
}

export async function saveSEOSettings(seo: SEOSettings): Promise<void> {
  try {
    await setDoc(doc(db, 'siteSettings', 'seo'), {
      ...seo,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'siteSettings/seo');
  }
}

// ==========================================
// 7. GENERAL SITE SETTINGS & THEME
// ==========================================

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: 'SobTools',
  siteTagline: {
    en: 'All Your Tools in One Place',
    bn: 'সব টুলস এক জায়গায়',
  },
  primaryMarket: 'Bangladesh and International',
  logoUrl: '',
  faviconUrl: '',
  maintenanceMode: false,
  maintenanceMessage: {
    en: 'SobTools is currently undergoing scheduled platform upgrades. We will be back online shortly!',
    bn: 'SobTools এ বর্তমানে নির্ধারিত রক্ষণাবেক্ষণের কাজ চলছে। খুব শীঘ্রই আমরা পুনরায় সক্রিয় হব!',
  },
  allowNewRegistrations: true,
  defaultLanguage: 'bn',
  defaultTheme: 'dark',
  themeAccentColor: 'indigo',
  allowUserThemeToggle: true,
  adsensePublisherId: 'ca-pub-7020708438639987',
  contactEmail: 'mdmorshedalamhridayy@gmail.com',
  socialLinks: {
    facebook: 'https://facebook.com',
    twitter: 'https://twitter.com',
    github: 'https://github.com',
    youtube: 'https://youtube.com',
    telegram: 'https://t.me',
  },
};

export async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const snap = await getDoc(doc(db, 'siteSettings', 'general'));
    if (snap.exists()) {
      return { ...DEFAULT_SITE_SETTINGS, ...(snap.data() as SiteSettings) };
    }
    return DEFAULT_SITE_SETTINGS;
  } catch (err) {
    console.warn('Fallback to default site settings:', err);
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  try {
    await setDoc(doc(db, 'siteSettings', 'general'), {
      ...settings,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'siteSettings/general');
  }
}

// ==========================================
// 8. ANNOUNCEMENTS BROADCAST
// ==========================================

export async function fetchAnnouncements(): Promise<AnnouncementItem[]> {
  try {
    const snap = await getDocs(collection(db, 'announcements'));
    const list: AnnouncementItem[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...(d.data() as Omit<AnnouncementItem, 'id'>) });
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.warn('Error fetching announcements:', err);
    return [];
  }
}

export async function saveAnnouncement(ann: AnnouncementItem): Promise<void> {
  try {
    await setDoc(doc(db, 'announcements', ann.id), {
      ...ann,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `announcements/${ann.id}`);
  }
}

export async function deleteAnnouncement(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'announcements', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `announcements/${id}`);
  }
}

// ==========================================
// 9. ACTIVE USER SESSIONS (HEARTBEAT TRACKING)
// ==========================================

export async function sendSessionHeartbeat(session: ActiveSession): Promise<void> {
  try {
    const ref = doc(db, 'userSessions', session.sessionId);
    await setDoc(ref, {
      ...session,
      lastSeen: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.debug('Heartbeat error:', err);
  }
}

export async function fetchActiveSessions(windowMinutes = 5): Promise<ActiveSession[]> {
  try {
    const snap = await getDocs(collection(db, 'userSessions'));
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;
    const active: ActiveSession[] = [];

    snap.forEach((d) => {
      const data = d.data() as ActiveSession;
      const lastSeenMs = new Date(data.lastSeen).getTime();
      if (!isNaN(lastSeenMs) && now - lastSeenMs <= windowMs) {
        active.push({ ...data, sessionId: d.id });
      }
    });

    return active.sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());
  } catch (err) {
    console.warn('Error fetching active sessions:', err);
    return [];
  }
}

export async function removeActiveSession(sessionId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'userSessions', sessionId));
  } catch (err) {
    console.warn('Error terminating session:', err);
  }
}

export async function purgeStaleSessions(minutes = 15): Promise<number> {
  try {
    const snap = await getDocs(collection(db, 'userSessions'));
    const threshold = Date.now() - minutes * 60 * 1000;
    let purged = 0;
    for (const d of snap.docs) {
      const data = d.data() as ActiveSession;
      const lastSeenMs = new Date(data.lastSeen).getTime();
      if (isNaN(lastSeenMs) || lastSeenMs < threshold) {
        await deleteDoc(d.ref);
        purged++;
      }
    }
    return purged;
  } catch (err) {
    console.warn('Error purging stale sessions:', err);
    return 0;
  }
}

// ==========================================
// 10. ADMIN AUDIT LOGS (IMMUTABLE)
// ==========================================

export async function logAdminAction(
  adminUid: string,
  adminEmail: string,
  action: string,
  category: AdminAuditLog['category'],
  details: string,
  targetId?: string
): Promise<void> {
  const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const log: AdminAuditLog = {
    id: logId,
    adminUid,
    adminEmail,
    action,
    category,
    details,
    targetId,
    timestamp: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'auditLogs', logId), log);
  } catch (err) {
    console.warn('Audit logging error:', err);
  }
}

export async function fetchAuditLogs(maxLogs = 100): Promise<AdminAuditLog[]> {
  try {
    const snap = await getDocs(collection(db, 'auditLogs'));
    const logs: AdminAuditLog[] = [];
    snap.forEach((d) => {
      logs.push({ id: d.id, ...(d.data() as Omit<AdminAuditLog, 'id'>) });
    });
    return logs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, maxLogs);
  } catch (err) {
    console.warn('Error fetching audit logs:', err);
    return [];
  }
}

// ==========================================
// 11. ADMIN ROLES & RBAC
// ==========================================

export async function fetchAdminRoles(): Promise<AdminRoleItem[]> {
  try {
    const snap = await getDocs(collection(db, 'adminRoles'));
    const roles: AdminRoleItem[] = [];
    snap.forEach((d) => {
      roles.push({ uid: d.id, ...(d.data() as Omit<AdminRoleItem, 'uid'>) });
    });

    // Ensure owner is always present as Super Admin
    if (!roles.some((r) => r.email === 'mdmorshedalamhridayy@gmail.com')) {
      roles.unshift({
        uid: 'owner_master',
        email: 'mdmorshedalamhridayy@gmail.com',
        role: 'super_admin',
        assignedAt: new Date().toISOString(),
        assignedBy: 'System Bootstrap',
        notes: 'Founder & Immutable Master Super Administrator',
      });
    }

    return roles;
  } catch (err) {
    console.warn('Error fetching admin roles:', err);
    return [
      {
        uid: 'owner_master',
        email: 'mdmorshedalamhridayy@gmail.com',
        role: 'super_admin',
        assignedAt: new Date().toISOString(),
        assignedBy: 'System Bootstrap',
        notes: 'Founder & Immutable Master Super Administrator',
      },
    ];
  }
}

export async function saveAdminRole(item: AdminRoleItem): Promise<void> {
  try {
    await setDoc(doc(db, 'adminRoles', item.uid), {
      ...item,
      assignedAt: new Date().toISOString(),
    }, { merge: true });

    await setDoc(doc(db, 'admins', item.uid), {
      uid: item.uid,
      email: item.email,
      role: item.role,
      assignedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `adminRoles/${item.uid}`);
  }
}

export async function removeAdminRole(uid: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'adminRoles', uid));
    await deleteDoc(doc(db, 'admins', uid));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `adminRoles/${uid}`);
  }
}

// ==========================================
// 12. CONTACT INBOX & USER INQUIRIES
// ==========================================

export async function submitContactMessage(
  name: string,
  email: string,
  subject: string,
  message: string
): Promise<string> {
  const id = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const item: ContactMessage = {
    id,
    name: name.trim(),
    email: email.trim(),
    subject: subject.trim() || 'General Inquiry',
    message: message.trim(),
    status: 'unread',
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'messages', id), item);
  return id;
}

export async function fetchContactMessages(): Promise<ContactMessage[]> {
  try {
    const snap = await getDocs(collection(db, 'messages'));
    const list: ContactMessage[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...(d.data() as Omit<ContactMessage, 'id'>) });
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.warn('Error fetching messages:', err);
    return [];
  }
}

export async function updateMessageStatus(id: string, status: ContactMessage['status']): Promise<void> {
  try {
    await updateDoc(doc(db, 'messages', id), { status });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `messages/${id}`);
  }
}

export async function deleteContactMessage(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'messages', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `messages/${id}`);
  }
}
