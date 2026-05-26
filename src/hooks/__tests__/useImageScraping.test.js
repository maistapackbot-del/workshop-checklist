import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useImageScraping } from '../useImageScraping'
import * as scrapingModule from '../../services/scrapingService'

vi.mock('../../services/scrapingService', () => ({
  scrapingService: {
    scrapeUrl: vi.fn()
  }
}))

describe('useImageScraping hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with no loading or error', () => {
    scrapingModule.scrapingService.scrapeUrl.mockResolvedValue({
      title: 'Product',
      imageUrl: 'https://example.com/image.jpg'
    })

    const { result } = renderHook(() => useImageScraping())
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('sets loading state during scraping', async () => {
    const { result } = renderHook(() => useImageScraping())

    let resolvePromise
    const delayedPromise = new Promise(resolve => {
      resolvePromise = resolve
    })

    scrapingModule.scrapingService.scrapeUrl.mockReturnValue(delayedPromise)

    let scrapePromise
    await act(async () => {
      scrapePromise = result.current.scrapeUrl('https://example.com')
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(true)
    })

    await act(async () => {
      resolvePromise({
        title: 'Product',
        imageUrl: 'https://example.com/image.jpg'
      })
      await scrapePromise
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('returns scraped metadata', async () => {
    const mockMetadata = {
      title: 'Product Title',
      imageUrl: 'https://example.com/image.jpg',
      description: 'Product Description',
      price: 99.99
    }

    scrapingModule.scrapingService.scrapeUrl.mockResolvedValue(mockMetadata)

    const { result } = renderHook(() => useImageScraping())

    let metadata
    await act(async () => {
      metadata = await result.current.scrapeUrl('https://example.com/product')
    })

    expect(metadata).toEqual(mockMetadata)
  })

  it('handles errors and sets error state', async () => {
    const error = new Error('Network error')
    scrapingModule.scrapingService.scrapeUrl.mockRejectedValue(error)

    const { result } = renderHook(() => useImageScraping())

    await act(async () => {
      try {
        await result.current.scrapeUrl('https://example.com')
      } catch (e) {
        // Expected error
      }
    })

    await waitFor(() => {
      expect(result.current.error).toBe('Network error')
    })
  })

  it('clears error on successful scrape after error', async () => {
    scrapingModule.scrapingService.scrapeUrl
      .mockRejectedValueOnce(new Error('First error'))
      .mockResolvedValueOnce({
        title: 'Product',
        imageUrl: 'https://example.com/image.jpg'
      })

    const { result } = renderHook(() => useImageScraping())

    // First scrape fails
    await act(async () => {
      try {
        await result.current.scrapeUrl('https://example.com/1')
      } catch (e) {
        // Expected
      }
    })

    await waitFor(() => {
      expect(result.current.error).toBe('First error')
    })

    // Second scrape succeeds
    await act(async () => {
      await result.current.scrapeUrl('https://example.com/2')
    })

    await waitFor(() => {
      expect(result.current.error).toBeNull()
    })
  })

  it('resets loading state after error', async () => {
    scrapingModule.scrapingService.scrapeUrl.mockRejectedValue(
      new Error('Test error')
    )

    const { result } = renderHook(() => useImageScraping())

    await act(async () => {
      try {
        await result.current.scrapeUrl('https://example.com')
      } catch (e) {
        // Expected error
      }
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('provides scrapeUrl function', () => {
    const { result } = renderHook(() => useImageScraping())
    expect(typeof result.current.scrapeUrl).toBe('function')
  })
})
