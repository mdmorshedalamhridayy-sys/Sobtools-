import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../config/firebase';

export const ADMIN_BOOTSTRAP_EMAIL = 'mdmorshedalamhridayy@gmail.com';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  preferredLanguage?: 'bn' | 'en';
  theme?: 'dark' | 'light';
  role?: 'user' | 'admin' | 'superadmin' | 'moderator';
  isSuspended?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FavoriteToolItem {
  toolId: string;
  toolName: string;
  addedAt: string;
}

export interface ToolHistoryItem {
  toolId: string;
  toolName: string;
  usedAt: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isSuspended: boolean;
  favorites: string[];
  toolHistory: ToolHistoryItem[];
  signInWithEmail: (email: string, pass: string, remember?: boolean) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  reloadUser: () => Promise<User | null>;
  updateUserProfileData: (data: { displayName?: string; photoURL?: string; preferredLanguage?: 'bn' | 'en'; theme?: 'dark' | 'light' }) => Promise<void>;
  changePassword: (oldPass: string, newPass: string) => Promise<void>;
  toggleFavorite: (toolId: string, toolName: string) => Promise<void>;
  recordToolUsage: (toolId: string, toolName: string) => Promise<void>;
  deleteUserAccount: (passwordConfirmation?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [toolHistory, setToolHistory] = useState<ToolHistoryItem[]>([]);

  // Calculate admin state safely (no email verification gate)
  const isAdmin = useMemo(() => {
    if (!user) return false;
    const isOwnerEmail = user.email?.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase();
    return isOwnerEmail || userProfile?.role === 'admin' || userProfile?.role === 'superadmin';
  }, [user, userProfile]);

  const isSuspended = useMemo(() => {
    return Boolean(userProfile?.isSuspended);
  }, [userProfile]);

  // Sync / Listen to user profile document
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      setFavorites([]);
      setToolHistory([]);
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);

    // Initial fetch / create profile if missing
    getDoc(userDocRef)
      .then(async (snap) => {
        const isOwnerEmail = user.email?.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase();
        if (!snap.exists()) {
          const newProfile: UserProfile = {
            uid: user.uid,
            displayName: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            photoURL: user.photoURL || '',
            preferredLanguage: 'bn',
            theme: 'dark',
            role: isOwnerEmail ? 'admin' : 'user',
            isSuspended: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          try {
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);

            // Bootstrap admin doc if owner
            if (isOwnerEmail) {
              const adminDocRef = doc(db, 'admins', user.uid);
              await setDoc(adminDocRef, {
                uid: user.uid,
                email: user.email,
                role: 'superadmin',
                assignedAt: new Date().toISOString(),
              }, { merge: true });
            }
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
          }
        } else {
          setUserProfile(snap.data() as UserProfile);
          // If owner email, ensure admin document exists
          if (isOwnerEmail) {
            const adminDocRef = doc(db, 'admins', user.uid);
            setDoc(adminDocRef, {
              uid: user.uid,
              email: user.email,
              role: 'superadmin',
              assignedAt: new Date().toISOString(),
            }, { merge: true }).catch(() => {});
          }
        }
      })
      .catch((err) => {
        console.error('Error fetching user profile:', err);
      });

    // Real-time listener for user profile
    const unsubProfile = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        }
      },
      (error) => {
        console.warn('User profile listener issue:', error);
      }
    );

    // Real-time listener for favorites
    const favCol = collection(db, 'users', user.uid, 'favorites');
    const unsubFavs = onSnapshot(
      favCol,
      (snapshot) => {
        const ids = snapshot.docs.map((d) => d.id);
        setFavorites(ids);
      },
      (error) => {
        console.warn('Favorites listener issue:', error);
      }
    );

    // Real-time listener for tool history (capped to last 20)
    const historyCol = collection(db, 'users', user.uid, 'toolHistory');
    const unsubHistory = onSnapshot(
      historyCol,
      (snapshot) => {
        const items: ToolHistoryItem[] = snapshot.docs.map((d) => d.data() as ToolHistoryItem);
        // Sort descending by usedAt
        items.sort((a, b) => new Date(b.usedAt).getTime() - new Date(a.usedAt).getTime());
        setToolHistory(items.slice(0, 30));
      },
      (error) => {
        console.warn('History listener issue:', error);
      }
    );

    return () => {
      unsubProfile();
      unsubFavs();
      unsubHistory();
    };
  }, [user]);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sign In with Email & Password
  const signInWithEmail = useCallback(async (email: string, pass: string, remember: boolean = true) => {
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    setUser(cred.user);
  }, []);

  // Sign Up with Email & Password
  const signUpWithEmail = useCallback(async (email: string, pass: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (name.trim()) {
      await updateProfile(cred.user, { displayName: name.trim() });
    }
    // Send email verification immediately
    try {
      await sendEmailVerification(cred.user);
    } catch (e) {
      console.warn('Verification send error:', e);
    }
    setUser(cred.user);
  }, []);

  // Sign In with Google
  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, provider);
    setUser(cred.user);
  }, []);

  // Logout
  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
    setFavorites([]);
    setToolHistory([]);
  }, []);

  // Password Reset
  const sendPasswordReset = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  }, []);

  // Resend Verification Email
  const resendVerificationEmail = useCallback(async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  }, []);

  // Reload current user status
  const reloadUser = useCallback(async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      const updated = auth.currentUser;
      setUser(Object.assign(Object.create(Object.getPrototypeOf(updated)), updated));
      return updated;
    }
    return null;
  }, []);

  // Update profile data in Firebase Auth & Firestore
  const updateUserProfileData = useCallback(async (data: {
    displayName?: string;
    photoURL?: string;
    preferredLanguage?: 'bn' | 'en';
    theme?: 'dark' | 'light';
  }) => {
    if (!auth.currentUser) throw new Error('Not authenticated');

    const authUpdates: { displayName?: string; photoURL?: string } = {};
    if (data.displayName !== undefined) authUpdates.displayName = data.displayName;
    if (data.photoURL !== undefined) authUpdates.photoURL = data.photoURL;

    if (Object.keys(authUpdates).length > 0) {
      await updateProfile(auth.currentUser, authUpdates);
    }

    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    const firestoreUpdates: Record<string, unknown> = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    try {
      await updateDoc(userDocRef, firestoreUpdates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
    }
  }, []);

  // Change Password
  const changePassword = useCallback(async (oldPass: string, newPass: string) => {
    if (!auth.currentUser || !auth.currentUser.email) {
      throw new Error('Not authenticated');
    }
    const credential = EmailAuthProvider.credential(auth.currentUser.email, oldPass);
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, newPass);
  }, []);

  // Toggle Favorite
  const toggleFavorite = useCallback(async (toolId: string, toolName: string) => {
    if (!auth.currentUser) return;
    const favRef = doc(db, 'users', auth.currentUser.uid, 'favorites', toolId);

    if (favorites.includes(toolId)) {
      try {
        await deleteDoc(favRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${auth.currentUser.uid}/favorites/${toolId}`);
      }
    } else {
      try {
        await setDoc(favRef, {
          toolId,
          toolName,
          addedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${auth.currentUser.uid}/favorites/${toolId}`);
      }
    }
  }, [favorites]);

  // Record tool usage to history
  const recordToolUsage = useCallback(async (toolId: string, toolName: string) => {
    if (!auth.currentUser) return;
    const historyId = `${toolId}_${Date.now()}`;
    const histRef = doc(db, 'users', auth.currentUser.uid, 'toolHistory', historyId);
    try {
      await setDoc(histRef, {
        toolId,
        toolName,
        usedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Could not record tool history:', err);
    }
  }, []);

  // Delete User Account
  const deleteUserAccount = useCallback(async (passwordConfirmation?: string) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const email = auth.currentUser.email;

    // Re-authenticate if password provided
    if (passwordConfirmation && email) {
      const credential = EmailAuthProvider.credential(email, passwordConfirmation);
      await reauthenticateWithCredential(auth.currentUser, credential);
    }

    // Clean up user document
    try {
      await deleteDoc(doc(db, 'users', uid));
    } catch (e) {
      console.warn('Error deleting user doc:', e);
    }

    // Delete Auth user
    await deleteUser(auth.currentUser);
    setUser(null);
    setUserProfile(null);
  }, []);

  const value = useMemo(() => ({
    user,
    userProfile,
    loading,
    isAdmin,
    isSuspended,
    favorites,
    toolHistory,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    logout,
    sendPasswordReset,
    resendVerificationEmail,
    reloadUser,
    updateUserProfileData,
    changePassword,
    toggleFavorite,
    recordToolUsage,
    deleteUserAccount,
  }), [
    user,
    userProfile,
    loading,
    isAdmin,
    isSuspended,
    favorites,
    toolHistory,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    logout,
    sendPasswordReset,
    resendVerificationEmail,
    reloadUser,
    updateUserProfileData,
    changePassword,
    toggleFavorite,
    recordToolUsage,
    deleteUserAccount,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
