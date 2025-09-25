// Simple session-based authentication utilities
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  joinedDate: string;
}

const AUTH_KEY = 'busmate_auth_session';

// Dummy user data
const dummyUser: User = {
  id: '1',
  name: 'John Smith',
  email: 'john.smith@example.com',
  phone: '+1 (555) 123-4567',
  joinedDate: '2023-06-15'
};

export const authService = {
  // Check if user is logged in
  isAuthenticated(): boolean {
    return !!sessionStorage.getItem(AUTH_KEY);
  },

  // Get current user
  getCurrentUser(): User | null {
    const session = sessionStorage.getItem(AUTH_KEY);
    if (session) {
      try {
        return JSON.parse(session);
      } catch {
        return null;
      }
    }
    return null;
  },

  // Login user (dummy implementation)
  login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Dummy validation - any email/password combo works
        if (email && password) {
          const user = { ...dummyUser, email };
          sessionStorage.setItem(AUTH_KEY, JSON.stringify(user));
          resolve({ success: true, user });
        } else {
          resolve({ success: false, error: 'Invalid credentials' });
        }
      }, 1000);
    });
  },

  // Logout user
  logout(): void {
    sessionStorage.removeItem(AUTH_KEY);
  },

  // Update user data
  updateUser(updates: Partial<User>): boolean {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      sessionStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser));
      return true;
    }
    return false;
  }
};