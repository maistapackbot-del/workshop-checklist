import { describe, it, expect, vi, beforeEach } from 'vitest'
import { trackingLinksService } from '../trackingLinksService'
import * as supabaseModule from '../supabaseClient'

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn()
  }
}))

describe('trackingLinksService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getTrackingLinks fetches tracking info', async () => {
    const mockTrackingLinks = [
      { id: '1', product_link_id: 'link1', tracking_url: 'https://track.dhl.com/abc', carrier: 'DHL' }
    ]

    supabaseModule.supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockTrackingLinks, error: null })
        })
      })
    })

    const result = await trackingLinksService.getTrackingLinks('link1')
    expect(result).toEqual(mockTrackingLinks)
  })

  it('getTrackingLinks throws when product link ID missing', async () => {
    await expect(trackingLinksService.getTrackingLinks(''))
      .rejects.toThrow('Product link ID required')
  })

  it('addTrackingLink validates URL format', async () => {
    await expect(trackingLinksService.addTrackingLink('link1', 'invalid-url', 'DHL'))
      .rejects.toThrow('Invalid tracking URL format')
  })

  it('addTrackingLink inserts tracking link', async () => {
    const mockTracking = { id: '1', product_link_id: 'link1', tracking_url: 'https://track.dhl.com/abc' }

    supabaseModule.supabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: [mockTracking], error: null })
      })
    })

    const result = await trackingLinksService.addTrackingLink('link1', 'https://track.dhl.com/abc', 'DHL')
    expect(result).toEqual(mockTracking)
  })

  it('updateTrackingLink updates tracking info', async () => {
    const mockTracking = { id: '1', product_link_id: 'link1', carrier: 'UPS' }

    supabaseModule.supabase.from.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data: [mockTracking], error: null })
        })
      })
    })

    const result = await trackingLinksService.updateTrackingLink('1', { carrier: 'UPS' })
    expect(result).toEqual(mockTracking)
  })

  it('deleteTrackingLink removes link', async () => {
    supabaseModule.supabase.from.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    })

    await trackingLinksService.deleteTrackingLink('tracking1')
    expect(supabaseModule.supabase.from).toHaveBeenCalledWith('tracking_links')
  })
})
