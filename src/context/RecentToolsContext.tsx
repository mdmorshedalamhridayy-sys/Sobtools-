import React, { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect } from 'react';

interface RecentToolsContextType {
  recentToolIds: string[];
  addRecentTool: (id: string) => void;
  clearRecentTools: () => void;
  trackingEnabled: boolean;
  toggleTracking: () => void;
}

const RecentToolsContext = createContext<RecentToolsContextType | undefined>(undefined);

export const RecentToolsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trackingEnabled, setTrackingEnabled] = useState<boolean>(() => {
    return localStorage.getItem('sobtools_history_consent') !== 'disabled';
  });

  const trackingRef = useRef(trackingEnabled);
  useEffect(() => {
    trackingRef.current = trackingEnabled;
  }, [trackingEnabled]);

  const [recentToolIds, setRecentToolIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sobtools_recent_tools');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addRecentTool = useCallback((id: string) => {
    if (!trackingRef.current) return;
    setRecentToolIds((prev) => {
      // Bailout if this tool is already the most recent item
      if (prev.length > 0 && prev[0] === id) {
        return prev;
      }
      const filtered = prev.filter((item) => item !== id);
      const updated = [id, ...filtered].slice(0, 8);
      try {
        localStorage.setItem('sobtools_recent_tools', JSON.stringify(updated));
      } catch {
        // Ignore storage quotas
      }
      return updated;
    });
  }, []);

  const clearRecentTools = useCallback(() => {
    setRecentToolIds([]);
    try {
      localStorage.removeItem('sobtools_recent_tools');
    } catch {}
  }, []);

  const toggleTracking = useCallback(() => {
    setTrackingEnabled((prev) => {
      const newState = !prev;
      if (!newState) {
        setRecentToolIds([]);
        try {
          localStorage.removeItem('sobtools_recent_tools');
          localStorage.setItem('sobtools_history_consent', 'disabled');
        } catch {}
      } else {
        try {
          localStorage.setItem('sobtools_history_consent', 'enabled');
        } catch {}
      }
      return newState;
    });
  }, []);

  const value = useMemo(
    () => ({
      recentToolIds,
      addRecentTool,
      clearRecentTools,
      trackingEnabled,
      toggleTracking,
    }),
    [recentToolIds, addRecentTool, clearRecentTools, trackingEnabled, toggleTracking]
  );

  return (
    <RecentToolsContext.Provider value={value}>
      {children}
    </RecentToolsContext.Provider>
  );
};

export const useRecentTools = () => {
  const context = useContext(RecentToolsContext);
  if (!context) {
    throw new Error('useRecentTools must be used within a RecentToolsProvider');
  }
  return context;
};
