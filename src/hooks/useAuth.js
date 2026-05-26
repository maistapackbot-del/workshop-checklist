/**
 * Custom hook for managing authentication state.
 *
 * Provides:
 * - user: Current user object or null
 * - loading: Boolean indicating if auth state is being loaded
 * - error: String error message or null
 * - signUp: Function to sign up a new user
 * - signIn: Function to sign in an existing user
 * - signOut: Function to sign out the current user
 */

import { useState, useEffect } from 'react'
import { authService } from '../services/authService'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Get initial session
    authService.getSession()
      .then(session => {
        setUser(session?.user || null)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange((session) => {
      setUser(session?.user || null)
    })

    return () => subscription?.unsubscribe()
  }, [])

  /**
   * Sign up a new user with email and password.
   * @param {string} email - User email
   * @param {string} password - User password
   * @throws {Error} If sign up fails
   */
  const signUp = async (email, password) => {
    setError(null)
    try {
      await authService.signUp(email, password)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  /**
   * Sign in an existing user with email and password.
   * @param {string} email - User email
   * @param {string} password - User password
   * @throws {Error} If sign in fails
   */
  const signIn = async (email, password) => {
    setError(null)
    try {
      await authService.signIn(email, password)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  /**
   * Sign out the current user.
   * @throws {Error} If sign out fails
   */
  const signOut = async () => {
    setError(null)
    try {
      await authService.signOut()
      setUser(null)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  return { user, loading, error, signUp, signIn, signOut }
}
