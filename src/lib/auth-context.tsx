import React, { createContext, useContext, ReactNode } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

interface AuthContextType {
  user: any;
  status: "loading" | "authenticated" | "unauthenticated";
  signIn: (provider?: string, options?: any) => Promise<any>;
  signOut: () => Promise<any>;
  isAdmin: boolean;
  isAgent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  
  const user = session?.user;
  
  const isAdmin = (user as any)?.role === 'admin';
  const isAgent = (user as any)?.role === 'agent' || (user as any)?.role === 'admin';

  const value = {
    user,
    status,
    signIn,
    signOut,
    isAdmin,
    isAgent,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function withAuth(Component: React.ComponentType<any>) {
  return function AuthenticatedComponent(props: any) {
    const { status } = useSession({
      required: true,
      onUnauthenticated() {
        signIn();
      },
    });

    if (status === 'loading') {
      return <div>Loading...</div>;
    }

    return <Component {...props} />;
  };
} 