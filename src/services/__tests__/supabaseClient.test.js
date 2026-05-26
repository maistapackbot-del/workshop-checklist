import { describe, it, expect } from 'vitest'

describe('supabaseClient', () => {
  it('exports a supabase client object', async () => {
    const module = await import('../supabaseClient.js')
    const { supabase } = module

    expect(supabase).toBeDefined()
    expect(typeof supabase).toBe('object')
  })

  it('supabase client has required methods', async () => {
    const module = await import('../supabaseClient.js')
    const { supabase } = module

    // Check for common Supabase client methods
    expect(supabase).toHaveProperty('from')
    expect(supabase).toHaveProperty('auth')
    expect(typeof supabase.from).toBe('function')
  })

  it('client is initialized and usable', async () => {
    const module = await import('../supabaseClient.js')
    const { supabase } = module

    expect(supabase).toBeDefined()
    expect(typeof supabase.from).toBe('function')
    expect(typeof supabase.auth).toBe('object')
  })
})
