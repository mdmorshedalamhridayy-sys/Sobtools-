import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendSessionHeartbeat, removeActiveSession } from '../services/cmsService';
import { ActiveSession } from '../types';

export function useActiveSessionTracker() {
  const { user, userProfile } = useAuth();
  const location = useLocation();
  const sessionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      if (sessionRef.current) {
        removeActiveSession(sessionRef.current).catch(() => {});
        sessionRef.current = null;
      }
      return;
    }

    // Stable session ID stored in sessionStorage for browser lifetime
    let currentSessionId = sessionStorage.getItem('sobtools_session_id');
    if (!currentSessionId) {
      currentSessionId = `sess_${user.uid.substring(0, 8)}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      sessionStorage.setItem('sobtools_session_id', currentSessionId);
    }
    sessionRef.current = currentSessionId;

    const getDeviceType = (): 'Desktop' | 'Mobile' | 'Tablet' => {
      const width = window.innerWidth;
      if (width < 640) return 'Mobile';
      if (width < 1024) return 'Tablet';
      return 'Desktop';
    };

    const beat = () => {
      if (!user || !sessionRef.current) return;
      const sessionData: ActiveSession = {
        sessionId: sessionRef.current,
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || userProfile?.displayName || user.email?.split('@')[0],
        photoURL: user.photoURL || userProfile?.photoURL,
        currentPath: window.location.pathname,
        userAgent: navigator.userAgent.substring(0, 150),
        deviceType: getDeviceType(),
        lastSeen: new Date().toISOString(),
      };
      sendSessionHeartbeat(sessionData);
    };

    // Immediate heartbeat on mount or route transition
    beat();

    // Heartbeat every 60 seconds
    const interval = setInterval(beat, 60000);

    return () => {
      clearInterval(interval);
    };
  }, [user, userProfile, location.pathname]);
}
