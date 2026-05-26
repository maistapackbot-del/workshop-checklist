import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService } from '../authService'
import * as supabaseModule from '../supabaseClient'

// Mock Supabase
vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
    }
  }
}))

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('signUp calls supabase.auth.signUp with correct parameters', async () => {
    const mockData = { user: { id: '123', email: 'test@example.com' } }
    supabaseModule.supabase.auth.signUp.mockResolvedValue({ data: mockData, error: null })

    const result = await authService.signUp('test@example.com', 'password123')

    expect(result).toEqual(mockData)
    expect(supabaseModule.supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      options: { emailRedirectTo: window.location.origin }
    })
  })

  it('signIn calls supabase.auth.signInWithPassword with correct parameters', async () => {
    const mockData = { user: { id: '123', email: 'test@example.com' } }
    supabaseModule.supabase.auth.signInWithPassword.mockResolvedValue({ data: mockData, error: null })

    const result = await authService.signIn('test@example.com', 'password123')

    expect(result).toEqual(mockData)
    expect(supabaseModule.supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    })
  })

  it('signOut calls supabase.auth.signOut', async () => {
    supabaseModule.supabase.auth.signOut.mockResolvedValue({ error: null })

    await authService.signOut()
    expect(supabaseModule.supabase.auth.signOut).toHaveBeenCalled()
  })

  it('getSession returns session', async () => {
    const mockSession = { user: { id: '123' } }
    supabaseModule.supabase.auth.getSession.mockResolvedValue({ data: { session: mockSession }, error: null })

    const result = await authService.getSession()
    expect(result).toEqual(mockSession)
  })

  it('getSession returns null when no session', async () => {
    supabaseModule.supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null })

    const result = await authService.getSession()
    expect(result).toBeNull()
  })

  it('throws error on failed signUp', async () => {
    supabaseModule.supabase.auth.signUp.mockResolvedValue({
      data: null,
      error: { message: 'User already exists' }
    })

    await expect(authService.signUp('test@example.com', 'password123'))
      .rejects
      .toThrow('User already exists')
  })

  it('throws error on failed signIn', async () => {
    supabaseModule.supabase.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: { message: 'Invalid credentials' }
    })

    await expect(authService.signIn('test@example.com', 'wrongpassword'))
      .rejects
      .toThrow('Invalid credentials')
  })

  it('throws error on failed signOut', async () => {
    supabaseModule.supabase.auth.signOut.mockResolvedValue({
      error: { message: 'Sign out failed' }
    })

    await expect(authService.signOut())
      .rejects
      .toThrow('Sign out failed')
  })

  it('throws error on failed getSession', async () => {
    supabaseModule.supabase.auth.getSession.mockResolvedValue({
      data: null,
      error: { message: 'Session error' }
    })

    await expect(authService.getSession())
      .rejects
      .toThrow('Session error')
  })

  it('onAuthStateChange returns subscription', () => {
    const callback = vi.fn()
    const unsubscribe = vi.fn()
    supabaseModule.supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe } }
    })

    const result = authService.onAuthStateChange(callback)

    expect(result).toEqual({ data: { subscription: { unsubscribe } } })
    expect(supabaseModule.supabase.auth.onAuthStateChange).toHaveBeenCalledWith(expect.any(Function))
  })

  it('onAuthStateChange calls callback with session', () => {
    const callback = vi.fn()
    const mockSession = { user: { id: '123' } }

    let authStateCallback
    supabaseModule.supabase.auth.onAuthStateChange.mockImplementation((cb) => {
      authStateCallback = cb
      return { data: { subscription: { unsubscribe: vi.fn() } } }
    })

    authService.onAuthStateChange(callback)

    authStateCallback('SIGNED_IN', mockSession)
    expect(callback).toHaveBeenCalledWith(mockSession)
  })
})
