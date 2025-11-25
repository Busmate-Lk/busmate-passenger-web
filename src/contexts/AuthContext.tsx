import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AsgardeoProvider, useAsgardeo, useUser } from '@asgardeo/react';

// Define the user type based on Asgardeo's user profile
export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  phone?: string;
  joinedDate: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
}

// Define the auth context interface
export interface AuthContextType {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Auth methods
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  
  // User profile methods
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props interface
interface AuthProviderProps {
  children: ReactNode;
}

// Internal Auth Provider Component (wrapped by AsgardeoProvider)
const InternalAuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use Asgardeo hooks
  const { signIn: asgardeoSignIn, signOut: asgardeoSignOut, isSignedIn, isLoading: asgardeoLoading } = useAsgardeo();
  const { profile } = useUser();

  // Convert Asgardeo profile to our User type
  const mapAsgardeoProfileToUser = (asgardeoProfile: any): User | null => {
    if (!asgardeoProfile) return null;
    
    return {
      id: asgardeoProfile.sub || asgardeoProfile.id || '',
      username: asgardeoProfile.username || asgardeoProfile.preferred_username || asgardeoProfile.email || '',
      email: asgardeoProfile.email || '',
      name: asgardeoProfile.name || asgardeoProfile.given_name || asgardeoProfile.username || '',
      phone: asgardeoProfile.phone_number || asgardeoProfile.phone,
      joinedDate: asgardeoProfile.created_time || new Date().toISOString(),
      isEmailVerified: asgardeoProfile.email_verified || false,
      isPhoneVerified: asgardeoProfile.phone_number_verified || false,
    };
  };

  // Update user state when Asgardeo profile changes
  useEffect(() => {
    if (isSignedIn && profile) {
      const mappedUser = mapAsgardeoProfileToUser(profile);
      setUser(mappedUser);
    } else {
      setUser(null);
    }
  }, [isSignedIn, profile]);

  // Update loading state
  useEffect(() => {
    setIsLoading(asgardeoLoading);
  }, [asgardeoLoading]);

  // Auth methods
  const signIn = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await asgardeoSignIn();
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await asgardeoSignOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!user) throw new Error('No user to update');
    
    try {
      setIsLoading(true);
      // Update local user state immediately for optimistic updates
      setUser(prev => prev ? { ...prev, ...updates } : null);
      
      // Here you would typically make an API call to update the user profile
      // For now, we'll just update the local state
      console.log('Profile update requested:', updates);
      
      // If you have a backend API, you would call it here:
      // await updateUserProfile(user.id, updates);
      
    } catch (error) {
      console.error('Profile update failed:', error);
      // Revert optimistic update on error
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      setIsLoading(true);
      // This would typically refetch user data from your backend
      // For now, we'll just update from the current Asgardeo profile
      if (profile) {
        const mappedUser = mapAsgardeoProfileToUser(profile);
        setUser(mappedUser);
      }
    } catch (error) {
      console.error('User refresh failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const contextValue: AuthContextType = {
    user,
    isAuthenticated: isSignedIn && !!user,
    isLoading,
    signIn,
    signOut,
    updateProfile,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Main Auth Provider Component that wraps AsgardeoProvider
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return (
    <AsgardeoProvider
      clientId="uugkfsXAsFzkzaALcRk4D2vnnwsa"
      baseUrl="https://api.asgardeo.io/t/busmate"
    >
      <InternalAuthProvider>
        {children}
      </InternalAuthProvider>
    </AsgardeoProvider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component for protected routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    const { isAuthenticated, isLoading } = useAuth();
    
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-muted-foreground">Please sign in to access this page.</p>
          </div>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
};

export default AuthContext;