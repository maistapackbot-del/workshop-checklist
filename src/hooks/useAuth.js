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
import { mapAuthError } from '../utils/errorMessages'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    let subscription

    const initAuth = async () => {
      try {
        const session = await authService.getSession()
        if (mounted) {
          setUser(session?.user || null)
          setLoading(false)
        }
      } catch (err) {
        if (mounted) {
          setError(mapAuthError(err))
          setLoading(false)
        }
      }

      // Subscribe AFTER initial session is loaded
      if (mounted) {
        const { data: { subscription: sub } } = authService.onAuthStateChange((session) => {
          setUser(session?.user || null)
        })
        subscription = sub
      }
    }

    initAuth()

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
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
      const userFriendlyError = mapAuthError(err)
      setError(userFriendlyError)
      throw new Error(userFriendlyError)
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
      const userFriendlyError = mapAuthError(err)
      setError(userFriendlyError)
      throw new Error(userFriendlyError)
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
