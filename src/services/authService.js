/**
 * Authentication service for Supabase.
 *
 * Provides methods for user sign up, sign in, sign out, session management,
 * and auth state change listeners.
 */

import { supabase } from './supabaseClient'

export const authService = {
  /**
   * Sign up with email and password.
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User and session data
   * @throws {Error} If sign up fails
   */
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin
      }
    })
    if (error) throw new Error(error.message)
    return data
  },

  /**
   * Sign in with email and password.
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User and session data
   * @throws {Error} If sign in fails
   */
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw new Error(error.message)
    return data
  },

  /**
   * Sign out the current user.
   * @returns {Promise<void>}
   * @throws {Error} If sign out fails
   */
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(error.message)
  },

  /**
   * Get the current session.
   * @returns {Promise<Object|null>} Current session or null if not authenticated
   * @throws {Error} If getting session fails
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw new Error(error.message)
    return data.session
  },

  /**
   * Listen to auth state changes.
   * @param {Function} callback - Called with session when auth state changes
   * @returns {Object} Subscription object with unsubscribe method
   */
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session)
    })
  }
}
