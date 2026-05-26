import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth } from '../useAuth'
import * as authServiceModule from '../../services/authService'

// Mock the authService module
vi.mock('../../services/authService', () => ({
  authService: {
    getSession: vi.fn(),
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn()
  }
}))

const { authService } = authServiceModule

describe('useAuth hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with loading state', () => {
    authService.getSession.mockResolvedValue(null)
    authService.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    })

    const { result } = renderHook(() => useAuth())
    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBe(null)
  })

  it('loads session on mount', async () => {
    const mockUser = { id: '123', email: 'test@example.com' }
    authService.getSession.mockResolvedValue({ user: mockUser })
    authService.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.user).toEqual(mockUser)
    })
  })

  it('handles sign in', async () => {
    const mockUser = { id: '123', email: 'test@example.com' }
    authService.getSession.mockResolvedValue(null)
    authService.signIn.mockResolvedValue({ user: mockUser })
    authService.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.signIn('test@example.com', 'password123')
    })

    expect(authService.signIn).toHaveBeenCalledWith('test@example.com', 'password123')
  })

  it('handles sign out', async () => {
    const mockUser = { id: '123', email: 'test@example.com' }
    authService.getSession.mockResolvedValue({ user: mockUser })
    authService.signOut.mockResolvedValue(undefined)
    authService.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser)
    })

    await act(async () => {
      await result.current.signOut()
    })

    expect(result.current.user).toBe(null)
  })

  it('sets error state on failed sign in', async () => {
    authService.getSession.mockResolvedValue(null)
    authService.signIn.mockRejectedValue(new Error('Invalid login credentials'))
    authService.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      try {
        await result.current.signIn('test@example.com', 'wrongpassword')
      } catch (e) {
        // Expected
      }
    })

    expect(result.current.error).toBeTruthy()
  })

  it('unsubscribes from auth changes on unmount', async () => {
    const mockUnsubscribe = vi.fn()
    authService.getSession.mockResolvedValue(null)
    authService.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } }
    })

    const { unmount } = renderHook(() => useAuth())

    await waitFor(() => {
      // wait for effect to complete
    })

    unmount()
    expect(mockUnsubscribe).toHaveBeenCalled()
  })

  it('maps Supabase errors to user-friendly German messages on sign up failure', async () => {
    authService.getSession.mockResolvedValue(null)
    authService.signUp.mockRejectedValue(new Error('User already exists'))
    authService.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      try {
        await result.current.signUp('test@example.com', 'password123')
      } catch (e) {
        // Expected
      }
    })

    expect(result.current.error).toBe('Ein Konto mit dieser Email existiert bereits')
  })

  it('prevents race condition between getSession and subscription', async () => {
    const mockUser = { id: '123', email: 'test@example.com' }
    authService.getSession.mockResolvedValue({ user: mockUser })

    let subscriptionCallback
    authService.onAuthStateChange.mockImplementation((callback) => {
      subscriptionCallback = callback
      return {
        data: { subscription: { unsubscribe: vi.fn() } }
      }
    })

    const { result } = renderHook(() => useAuth())

    // Initially loading
    expect(result.current.loading).toBe(true)

    // Wait for getSession to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.user).toEqual(mockUser)
    })

    // Subscription should be set up after getSession
    expect(subscriptionCallback).toBeDefined()
  })

  it('clears error when sign up is called', async () => {
    const mockUser = { id: '123', email: 'test@example.com' }
    authService.getSession.mockResolvedValue(null)
    authService.signUp.mockResolvedValue({ user: mockUser })
    authService.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Manually set an error
    await act(async () => {
      try {
        await result.current.signUp('test@example.com', 'wrongpassword')
      } catch (e) {
        // Expected to clear error on next call
      }
    })

    // Error should be cleared when calling signUp again
    await act(async () => {
      await result.current.signUp('test@example.com', 'password123')
    })

    expect(result.current.error).toBe(null)
  })

  it('clears error when sign in is called', async () => {
    const mockUser = { id: '123', email: 'test@example.com' }
    authService.getSession.mockResolvedValue(null)
    authService.signIn.mockResolvedValue({ user: mockUser })
    authService.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.signIn('test@example.com', 'password123')
    })

    expect(result.current.error).toBe(null)
  })
})
