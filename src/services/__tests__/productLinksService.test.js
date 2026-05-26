import { describe, it, expect, vi, beforeEach } from 'vitest'
import { productLinksService } from '../productLinksService'
import * as supabaseModule from '../supabaseClient'

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn()
    }
  }
}))

describe('productLinksService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabaseModule.supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-123' } },
      error: null
    })
  })

  it('getLinksForProduct fetches links', async () => {
    const mockLinks = [
      { id: '1', product_id: 'prod1', url: 'https://amazon.de/item', title: 'Item' }
    ]

    supabaseModule.supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockLinks, error: null })
        })
      })
    })

    const result = await productLinksService.getLinksForProduct('prod1')
    expect(result).toEqual(mockLinks)
  })

  it('getLinksForProduct throws when product ID missing', async () => {
    await expect(productLinksService.getLinksForProduct(''))
      .rejects.toThrow('Product ID required')
  })

  it('createLink validates URL format', async () => {
    await expect(productLinksService.createLink('prod1', 'invalid-url'))
      .rejects.toThrow('Invalid URL format')
  })

  it('createLink inserts link', async () => {
    const mockLink = { id: '1', product_id: 'prod1', url: 'https://example.com' }

    supabaseModule.supabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: [mockLink], error: null })
      })
    })

    const result = await productLinksService.createLink('prod1', 'https://example.com')
    expect(result).toEqual(mockLink)
  })

  it('updateLink updates link metadata', async () => {
    const mockLink = { id: '1', product_id: 'prod1', title: 'Updated Title' }

    supabaseModule.supabase.from.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data: [mockLink], error: null })
        })
      })
    })

    const result = await productLinksService.updateLink('1', { title: 'Updated Title' })
    expect(result).toEqual(mockLink)
  })

  it('deleteLink removes link', async () => {
    supabaseModule.supabase.from.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    })

    await productLinksService.deleteLink('link1')
    expect(supabaseModule.supabase.from).toHaveBeenCalledWith('product_links')
  })
})
