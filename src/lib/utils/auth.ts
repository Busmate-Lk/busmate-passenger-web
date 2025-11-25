import { User } from '@/contexts/AuthContext';

/**
 * Maps an Asgardeo profile object to our internal User type
 * @param asgardeoProfile - The profile object from Asgardeo
 * @returns User object or null if profile is invalid
 */
export const mapAsgardeoProfileToUser = (asgardeoProfile: any): User | null => {
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

/**
 * Validates if a user object has all required fields
 * @param user - User object to validate
 * @returns boolean indicating if user is valid
 */
export const isValidUser = (user: User | null): user is User => {
  return !!(user && user.id && user.email);
};

/**
 * Creates a display name for the user based on available information
 * @param user - User object or Asgardeo profile
 * @returns formatted display name
 */
export const getUserDisplayName = (user: User | any): string => {
  if (!user) return 'User';
  
  // Handle Asgardeo profile format
  if (user.displayName && typeof user.displayName === 'string' && user.displayName.trim()) {
    return user.displayName.trim();
  }
  if (user.name && typeof user.name === 'string' && user.name.trim()) {
    return user.name.trim();
  }
  if (user.given_name && user.family_name && 
      typeof user.given_name === 'string' && typeof user.family_name === 'string') {
    return `${user.given_name} ${user.family_name}`.trim();
  }
  if (user.given_name && typeof user.given_name === 'string' && user.given_name.trim()) {
    return user.given_name.trim();
  }
  if (user.username && typeof user.username === 'string' && user.username.trim()) {
    return user.username.trim();
  }
  if (user.preferred_username && typeof user.preferred_username === 'string' && user.preferred_username.trim()) {
    return user.preferred_username.trim();
  }
  if (user.email && typeof user.email === 'string' && user.email.trim()) {
    return user.email.trim();
  }
  return 'User';
};

/**
 * Gets user initials for avatar display
 * @param user - User object or Asgardeo profile
 * @returns user initials (max 2 characters)
 */
export const getUserInitials = (user: User | any): string => {
  if (!user) return 'U';
  
  // Try to get initials from Asgardeo profile first
  if (user.given_name && user.family_name && 
      typeof user.given_name === 'string' && typeof user.family_name === 'string' &&
      user.given_name.length > 0 && user.family_name.length > 0) {
    return `${user.given_name[0]}${user.family_name[0]}`.toUpperCase();
  }
  
  const displayName = getUserDisplayName(user);
  if (!displayName || displayName === 'User') {
    return 'U';
  }
  
  const names = displayName.split(' ').filter(name => name.length > 0);
  
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase();
  }
  
  return displayName.slice(0, 2).toUpperCase();
};

/**
 * Formats the user's join date to a readable string
 * @param joinedDate - ISO date string
 * @returns formatted date string
 */
export const formatJoinDate = (joinedDate: string): string => {
  try {
    const date = new Date(joinedDate);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return 'Unknown';
  }
};

/**
 * Checks if the user's email is verified
 * @param user - User object
 * @returns boolean indicating email verification status
 */
export const isEmailVerified = (user: User): boolean => {
  return user.isEmailVerified === true;
};

/**
 * Checks if the user's phone is verified
 * @param user - User object
 * @returns boolean indicating phone verification status
 */
export const isPhoneVerified = (user: User): boolean => {
  return user.isPhoneVerified === true;
};

/**
 * Creates a safe user object for logging (removes sensitive information)
 * @param user - User object
 * @returns sanitized user object for logging
 */
export const sanitizeUserForLogging = (user: User): Partial<User> => {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    isEmailVerified: user.isEmailVerified,
    isPhoneVerified: user.isPhoneVerified,
    joinedDate: user.joinedDate
  };
};

/**
 * Auth-related constants
 */
export const AUTH_CONSTANTS = {
  STORAGE_KEYS: {
    USER_PREFERENCES: 'busmate_user_preferences',
    LAST_LOGIN: 'busmate_last_login'
  },
  ERROR_MESSAGES: {
    SIGN_IN_FAILED: 'Sign in failed. Please try again.',
    SIGN_OUT_FAILED: 'Sign out failed. Please try again.',
    PROFILE_UPDATE_FAILED: 'Profile update failed. Please try again.',
    NO_USER_TO_UPDATE: 'No user to update',
    USER_REFRESH_FAILED: 'User refresh failed. Please try again.'
  }
} as const;