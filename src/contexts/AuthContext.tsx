import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { AdminModuleKey, MASTER_ADMIN_MODULES, ROUTE_REQUIRED_MODULES } from '../permissions';

export type UserRole = 'admin' | 'master-admin';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  userRole: UserRole | null;
  assignedModules: AdminModuleKey[];
  isMasterAdmin: boolean;
  hasModule: (module: AdminModuleKey) => boolean;
  signIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  setUserRole: (role: UserRole) => void;
  setAssignedModules: (modules: AdminModuleKey[]) => void;
  getRequiredModule: (pathname: string) => AdminModuleKey | undefined;
  isRouteAllowed: (pathname: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'l1_admin_modules';
const ROLE_KEY = 'l1_admin_role';

function readAccessForUser(email: string) {
  const key = email.toLowerCase();
  const role = localStorage.getItem(`${ROLE_KEY}_${key}`) as 'admin' | 'master-admin' | null;
  const rawModules = localStorage.getItem(`${STORAGE_KEY}_${key}`);

  let modules: AdminModuleKey[] = [];
  if (rawModules) {
    try {
      modules = JSON.parse(rawModules) as AdminModuleKey[];
    } catch {
      modules = [];
    }
  }

  if (role === 'master-admin') {
    return { role: 'master-admin' as const, modules: MASTER_ADMIN_MODULES };
  }
  if (role === 'admin' && rawModules) {
    return { role: 'admin' as const, modules };
  }
  return { role: null, modules: [] };
}

function writeAccessForUser(email: string, role: UserRole | null, modules: AdminModuleKey[]) {
  const key = email.toLowerCase();
  if (role) {
    localStorage.setItem(`${ROLE_KEY}_${key}`, role);
    localStorage.setItem(`${STORAGE_KEY}_${key}`, JSON.stringify(modules));
  } else {
    localStorage.removeItem(`${ROLE_KEY}_${key}`);
    localStorage.removeItem(`${STORAGE_KEY}_${key}`);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [assignedModules, setAssignedModules] = useState<AdminModuleKey[]>([]);
  const isSignInFlowRef = useRef(false);

  const isMasterAdmin = userRole === 'master-admin';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser?.email) {
        setUser(firebaseUser);
        if (!isSignInFlowRef.current) {
          const { role, modules } = readAccessForUser(firebaseUser.email);
          setUserRole(role);
          setAssignedModules(modules);
        }
      } else {
        setUser(null);
        setUserRole(null);
        setAssignedModules([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setAssignedModulesAndPersist = (modules: AdminModuleKey[]) => {
    if (user?.email) {
      writeAccessForUser(user.email, userRole, modules);
    }
    setAssignedModules(modules);
  };

  const setUserRoleAndPersist = (role: UserRole) => {
    if (user?.email) {
      const modules = role === 'master-admin' ? MASTER_ADMIN_MODULES : assignedModules;
      writeAccessForUser(user.email, role, modules);
    }
    setUserRole(role);
    if (role === 'master-admin') {
      setAssignedModules(MASTER_ADMIN_MODULES);
    }
  };

  const hasModule = (module: AdminModuleKey) => {
    if (isMasterAdmin) return true;
    return assignedModules.includes(module);
  };

  const getRequiredModule = (pathname: string): AdminModuleKey | undefined => {
    for (const [prefix, module] of Object.entries(ROUTE_REQUIRED_MODULES)) {
      if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
        return module;
      }
    }
    return undefined;
  };

  const isRouteAllowed = (pathname: string): boolean => {
    if (isMasterAdmin) return true;
    const required = getRequiredModule(pathname);
    if (!required) return true;
    return hasModule(required);
  };

  const signIn = async (email: string, password: string) => {
    isSignInFlowRef.current = true;
    await signInWithEmailAndPassword(auth, email, password);
    isSignInFlowRef.current = false;
  };

  const logOut = async () => {
    if (user?.email) {
      const key = user.email.toLowerCase();
      localStorage.removeItem(`${ROLE_KEY}_${key}`);
      localStorage.removeItem(`${STORAGE_KEY}_${key}`);
    }
    setUserRole(null);
    setAssignedModules([]);
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        userRole,
        assignedModules,
        isMasterAdmin,
        hasModule,
        signIn,
        logOut,
        setUserRole: setUserRoleAndPersist,
        setAssignedModules: setAssignedModulesAndPersist,
        getRequiredModule,
        isRouteAllowed,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
