/**
 * Authentication Service using Supabase Auth
 */

import { supabase } from './database';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface AuthError {
  message: string;
}

// Sign up with email and password
export async function signUp(email: string, password: string, name?: string): Promise<{ user: AuthUser | null; error: AuthError | null }> {
  try {
    console.log('[Auth] Signing up:', email, name);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0]
        },
        emailRedirectTo: window.location.origin
      }
    });

    console.log('[Auth] SignUp response:', { data, error });

    if (error) {
      console.error('[Auth] SignUp error:', error);
      return { user: null, error: { message: error.message } };
    }

    if (data.user) {
      // 检查是否需要邮箱确认
      if (data.user.identities?.length === 0) {
        return { user: null, error: { message: 'This email is already registered. Please sign in instead.' } };
      }
      
      return {
        user: {
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.name || name || email.split('@')[0]
        },
        error: null
      };
    }

    return { user: null, error: { message: 'Sign up failed' } };
  } catch (err: any) {
    console.error('[Auth] SignUp exception:', err);
    return { user: null, error: { message: err.message || 'Sign up failed' } };
  }
}

// Sign in with email and password
export async function signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: AuthError | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return { user: null, error: { message: error.message } };
    }

    if (data.user) {
      return {
        user: {
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.name || email.split('@')[0]
        },
        error: null
      };
    }

    return { user: null, error: { message: 'Sign in failed' } };
  } catch (err: any) {
    return { user: null, error: { message: err.message || 'Sign in failed' } };
  }
}

// Sign in with Google
export async function signInWithGoogle(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      return { error: { message: error.message } };
    }

    return { error: null };
  } catch (err: any) {
    return { error: { message: err.message || 'Google sign in failed' } };
  }
}

// Sign in with Facebook
export async function signInWithFacebook(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      return { error: { message: error.message } };
    }

    return { error: null };
  } catch (err: any) {
    return { error: { message: err.message || 'Facebook sign in failed' } };
  }
}

// Sign out
export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error: { message: error.message } };
    }

    return { error: null };
  } catch (err: any) {
    return { error: { message: err.message || 'Sign out failed' } };
  }
}

// Get current user
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      return {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.email?.split('@')[0],
        avatar: user.user_metadata?.avatar_url
      };
    }

    return null;
  } catch {
    return null;
  }
}

// Listen to auth state changes
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
        avatar: session.user.user_metadata?.avatar_url
      });
    } else {
      callback(null);
    }
  });
}

// Reset password
export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) {
      return { error: { message: error.message } };
    }

    return { error: null };
  } catch (err: any) {
    return { error: { message: err.message || 'Password reset failed' } };
  }
}
