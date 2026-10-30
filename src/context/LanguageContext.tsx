import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  bn: {
    // Navigation
    home: 'হোম',
    allTools: 'সব টুলস',
    categories: 'ক্যাটাগরি',
    about: 'আমাদের সম্পর্কে',
    faq: 'প্রশ্নোত্তর',
    contact: 'যোগাযোগ',
    privacy: 'প্রাইভেসি পলিসি',
    terms: 'ব্যবহারের শর্তাবলী',
    disclaimer: 'ডিসক্লেইমার',
    sitemap: 'সাইটম্যাপ',
    
    // Header & Hero
    brandTagline: 'সব টুলস এক জায়গায়',
    heroTitle: 'আপনার দৈনন্দিন কাজের সকল ডিজিটাল টুলস এক প্ল্যাটফর্মে',
    heroSubtitle: 'ছবি, পিডিএফ, টেক্সট এবং ডেভেলপার টুলস—১০০% ব্রাউজার প্রসেসিং, কোনো ফাইল সার্ভারে আপলোড হয় না। সম্পূর্ণ নিরাপদ ও দ্রুত।',
    searchPlaceholder: 'টুল খুঁজুন (যেমন: ইমেজ কম্প্রেসার, পিডিএফ মার্জ, কিউআর কোড)...',
    popularToolsTitle: 'জনপ্রিয় টুলস',
    browseCategoriesTitle: 'ক্যাটাগরি অনুসারে টুলস',
    recentlyUsedTitle: 'সম্প্রতি ব্যবহৃত টুলস',
    clearHistory: 'হিস্ট্রি মুছুন',
    noRecentTools: 'এখনো কোনো সাম্প্রতিক টুলস নেই।',
    allToolsCount: '৩৯টি কার্যকর টুলস',
    
    // Categories
    cat_image: 'ইমেজ টুলস',
    cat_image_desc: 'কম্প্রেস, রিসাইজ, ক্রপ, কনভার্ট এবং কালার পিকার',
    cat_pdf: 'পিডিএফ টুলস',
    cat_pdf_desc: 'মার্জ, স্প্লিট, রোটেট, ইমেজ টু পিডিএফ এবং কম্প্রেশন',
    cat_text: 'টেক্সট ও বাংলা টুলস',
    cat_text_desc: 'ওয়ার্ড কাউন্টার, কেস কনভার্টার, বাংলা ক্যাপশন ও হ্যাশট্যাগ',
    cat_creator: 'ক্রিয়েটর, স্টক ও ডেভ টুলস',
    cat_creator_desc: 'Adobe Stock, Dreamstime মেটাডেটা, কিউআর কোড ও ডেভেলপার ইউটিলিটি',

    // Features
    whyChooseTitle: 'কেন SobTools বেছে নেবেন?',
    feature_privacy_title: '১০০% ব্রাউজার প্রাইভেসি',
    feature_privacy_desc: 'আপনার ফাইল আপনার ডিভাইসেই প্রসেস হয়। কোনো ফাইল আমাদের সার্ভারে জমা বা দেখা হয় না।',
    feature_speed_title: 'বিদ্যুৎগতির পারফরম্যান্স',
    feature_speed_desc: 'সার্ভার আপলোডের অপেক্ষা ছাড়াই তাৎক্ষণিক ফলাফল পান।',
    feature_free_title: 'চিরকাল বিনামূল্যে',
    feature_free_desc: 'কোনো সাইনআপ বা ক্রেডিট কার্ডের ঝামেলা নেই। সীমাহীন ব্যবহার করুন।',
    feature_bilingual_title: 'বাংলা ও ইংরেজি সাপোর্ট',
    feature_bilingual_desc: 'বাংলাদেশের ব্যবহারকারী ও আন্তর্জাতিক সবার জন্য সহজবোধ্য ইন্টারফেস।',

    // Common Buttons & Actions
    uploadFile: 'ফাইল আপলোড করুন',
    dragAndDrop: 'এখানে ফাইল টেনে আনুন অথবা',
    browseFiles: 'ফাইল নির্বাচন করুন',
    download: 'ডাউনলোড করুন',
    downloadResult: 'ফলাফল ডাউনলোড করুন',
    copy: 'কপি করুন',
    copied: 'কপি করা হয়েছে!',
    clear: 'মুছে ফেলুন',
    reset: 'রিসেট',
    process: 'প্রসেস করুন',
    processing: 'প্রসেস হচ্ছে...',
    success: 'সফলভাবে সম্পন্ন হয়েছে!',
    error: 'একটি ত্রুটি ঘটেছে',
    apply: 'প্রয়োগ করুন',
    select: 'বাছাই করুন',
    close: 'বন্ধ করুন',
    backToHome: 'হোমে ফিরে যান',
    viewTool: 'টুলটি ব্যবহার করুন',
    
    // Privacy Badges
    clientSideBadge: '🔒 ১০০% ব্রাউজার-প্রসেসিং (সম্পূর্ণ প্রাইভেট)',
    noUploads: 'আপনার কোনো ফাইল বা ডেটা সার্ভারে সংরক্ষণ করা হয় না।',
    relatedTools: 'সম্পর্কিত অন্যান্য টুলস',
    howToUse: 'ব্যবহার করার নিয়ম',
    toolFaq: 'সাধারণ জিজ্ঞাসা',
    privacyNote: 'গোপনীয়তা ও নিরাপত্তা',
    
    // Ads
    advertisement: 'বিজ্ঞাপন',
    sponsored: 'স্পন্সরড স্লট',
    // Auth & Dashboard
    login: 'লগইন',
    signup: 'রেজিস্ট্রেশন',
    logout: 'লগআউট',
    dashboard: 'ড্যাশবোর্ড',
    myProfile: 'আমার প্রোফাইল',
    myFavorites: 'প্রিয় টুলস',
    toolHistory: 'টুল হিস্ট্রি',
    accountSettings: 'একাউন্ট সেটিংস',
    securitySettings: 'নিরাপত্তা সেটিংস',
    adminDashboard: 'এডমিন প্যানেল',
    welcomeBack: 'স্বাগতম ফিরে আসার জন্য',
    createAccount: 'নতুন একাউন্ট তৈরি করুন',
    forgotPassword: 'পাসওয়ার্ড ভুলে গেছেন?',
    verifyEmail: 'ইমেইল ভেরিফিকেশন',
    emailPlaceholder: 'আপনার ইমেইল এড্রেস লিখুন',
    passwordPlaceholder: 'পাসওয়ার্ড লিখুন',
    confirmPasswordPlaceholder: 'পাসওয়ার্ড নিশ্চিত করুন',
    fullNamePlaceholder: 'আপনার পুরো নাম',
    rememberMe: 'আমাকে মনে রাখুন',
    continueWithGoogle: 'গুগল দিয়ে চালিয়ে যান',
    agreeTerms: 'আমি ব্যবহারের শর্তাবলী ও গোপনীয়তা নীতি মেনে নিচ্ছি',
    alreadyHaveAccount: 'ইতিমধ্যে একাউন্ট আছে? লগইন করুন',
    dontHaveAccount: 'একাউন্ট নেই? রেজিস্ট্রেশন করুন',
    verifyingSession: 'অথেনটিকেশন যাচাই করা হচ্ছে...',
    toolsRequireAuthNotice: 'টুল ব্যবহারের জন্য লগইন বাধ্যতামূলক',
  },
  en: {
    // Navigation
    home: 'Home',
    allTools: 'All Tools',
    categories: 'Categories',
    about: 'About Us',
    faq: 'FAQ',
    contact: 'Contact',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    disclaimer: 'Disclaimer',
    sitemap: 'Sitemap',
    
    // Header & Hero
    brandTagline: 'All Your Tools in One Place',
    heroTitle: 'All Your Digital Utility Tools in One Unified Platform',
    heroSubtitle: 'Image, PDF, Text, and Creator tools processed 100% locally in your browser. Maximum privacy, zero server uploads, superfast.',
    searchPlaceholder: 'Search tools (e.g., Image Compressor, PDF Merge, QR Code)...',
    popularToolsTitle: 'Popular Tools',
    browseCategoriesTitle: 'Browse by Category',
    recentlyUsedTitle: 'Recently Used Tools',
    clearHistory: 'Clear History',
    noRecentTools: 'No recently used tools yet.',
    allToolsCount: '39 Production Tools',
    
    // Categories
    cat_image: 'Image Tools',
    cat_image_desc: 'Compress, resize, crop, convert, and pick colors',
    cat_pdf: 'PDF Tools',
    cat_pdf_desc: 'Merge, split, rotate, image-to-pdf, and compress',
    cat_text: 'Text & Bengali Tools',
    cat_text_desc: 'Word counter, case converter, captions, and hashtags',
    cat_creator: 'Creator, Stock & Dev Tools',
    cat_creator_desc: 'Adobe Stock & Dreamstime metadata, QR codes, passwords, and JSON',

    // Features
    whyChooseTitle: 'Why Choose SobTools?',
    feature_privacy_title: '100% Client-Side Privacy',
    feature_privacy_desc: 'Files are processed inside your browser sandbox. Never uploaded to any external server.',
    feature_speed_title: 'Lightning Fast',
    feature_speed_desc: 'Instant processing with zero wait times for server uploads or downloads.',
    feature_free_title: 'Free & Uncapped',
    feature_free_desc: 'No registration, no subscriptions, no credit cards required. Ever.',
    feature_bilingual_title: 'Bilingual Interface',
    feature_bilingual_desc: 'Tailored for Bangladesh and global users with full English and Bengali localization.',

    // Common Buttons & Actions
    uploadFile: 'Upload File',
    dragAndDrop: 'Drag & drop files here, or',
    browseFiles: 'Browse Files',
    download: 'Download',
    downloadResult: 'Download Result',
    copy: 'Copy',
    copied: 'Copied!',
    clear: 'Clear',
    reset: 'Reset',
    process: 'Process',
    processing: 'Processing...',
    success: 'Completed successfully!',
    error: 'An error occurred',
    apply: 'Apply',
    select: 'Select',
    close: 'Close',
    backToHome: 'Back to Home',
    viewTool: 'Open Tool',
    
    // Privacy Badges
    clientSideBadge: '🔒 100% Browser Processing (Zero Uploads)',
    noUploads: 'Your files remain entirely on your device and are never sent to a server.',
    relatedTools: 'Related Tools',
    howToUse: 'How to Use',
    toolFaq: 'Frequently Asked Questions',
    privacyNote: 'Privacy & Security Guarantee',
    
    // Ads
    advertisement: 'Advertisement',
    sponsored: 'Sponsored Placement',

    // Auth & Dashboard
    login: 'Log In',
    signup: 'Create Account',
    logout: 'Log Out',
    dashboard: 'Dashboard',
    myProfile: 'My Profile',
    myFavorites: 'Favorite Tools',
    toolHistory: 'Tool History',
    accountSettings: 'Account Settings',
    securitySettings: 'Security Settings',
    adminDashboard: 'Admin Panel',
    welcomeBack: 'Welcome Back',
    createAccount: 'Create New Account',
    forgotPassword: 'Forgot Password?',
    verifyEmail: 'Email Verification',
    emailPlaceholder: 'Enter your email address',
    passwordPlaceholder: 'Enter your password',
    confirmPasswordPlaceholder: 'Confirm password',
    fullNamePlaceholder: 'Your full name',
    rememberMe: 'Remember Me',
    continueWithGoogle: 'Continue with Google',
    agreeTerms: 'I agree to the Terms of Service & Privacy Policy',
    alreadyHaveAccount: 'Already have an account? Log In',
    dontHaveAccount: "Don't have an account? Sign Up",
    verifyingSession: 'Verifying authentication session...',
    toolsRequireAuthNotice: 'Sign in required to access tools',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('sobtools_language');
    if (saved === 'en' || saved === 'bn') return saved;
    // Default to Bengali for Bangladesh context
    return 'bn';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('sobtools_language', lang);
    } catch {}
    document.documentElement.lang = lang;
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback(
    (key: string): string => {
      return translations[language][key] || translations['en'][key] || key;
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, setLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
