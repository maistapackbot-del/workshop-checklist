import { describe, it, expect, vi, beforeEach } from 'vitest'
import { scrapingService } from '../scrapingService'

// Mock fetch
global.fetch = vi.fn()
global.DOMParser = class {
  parseFromString(html, type) {
    // Simple mock that returns a document-like object
    const doc = {
      querySelector: vi.fn((selector) => {
        if (selector.includes('og:title')) {
          return { getAttribute: () => 'Test Product' }
        }
        if (selector.includes('og:image')) {
          return { getAttribute: () => 'https://example.com/image.jpg' }
        }
        if (selector.includes('title')) {
          return { textContent: 'Test Title' }
        }
        if (selector === 'img[alt]') {
          return { src: 'https://example.com/product.jpg' }
        }
        if (selector === 'script[type="application/ld+json"]') {
          return null
        }
        return null
      }),
      querySelectorAll: vi.fn((selector) => {
        if (selector === 'script[type="application/ld+json"]') {
          return []
        }
        return []
      })
    }
    return doc
  }
}

describe('scrapingService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch.mockClear()
  })

  it('scrapeUrl validates URL format', async () => {
    await expect(scrapingService.scrapeUrl('invalid-url'))
      .rejects.toThrow('Invalid URL format')
  })

  it('scrapeUrl fetches and parses HTML', async () => {
    const mockHtml = '<html><head><meta property="og:title" content="Product"></head></html>'
    global.fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockHtml)
    })

    const result = await scrapingService.scrapeUrl('https://example.com/product')
    expect(result.title).toBeDefined()
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/product',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'User-Agent': expect.any(String)
        })
      })
    )
  })

  it('scrapeUrl throws on failed fetch', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 404 })

    await expect(scrapingService.scrapeUrl('https://example.com/notfound'))
      .rejects.toThrow('Failed to fetch URL')
  })

  it('detectPlatform identifies platforms', () => {
    expect(scrapingService.detectPlatform('https://amazon.de/product')).toBe('Amazon')
    expect(scrapingService.detectPlatform('https://ebay.com/item')).toBe('eBay')
    expect(scrapingService.detectPlatform('https://willhaben.at/item')).toBe('Willhaben')
    expect(scrapingService.detectPlatform('https://unknown.com/item')).toBe('Other')
  })

  it('makeAbsoluteUrl handles different URL formats', () => {
    expect(scrapingService.makeAbsoluteUrl('https://example.com/img.jpg'))
      .toBe('https://example.com/img.jpg')

    expect(scrapingService.makeAbsoluteUrl('//cdn.example.com/img.jpg'))
      .toBe('https://cdn.example.com/img.jpg')

    expect(scrapingService.makeAbsoluteUrl('/images/img.jpg'))
      .toBe('/images/img.jpg')
  })

  it('parseMetadata extracts title and image', () => {
    const mockDoc = {
      querySelector: vi.fn((selector) => {
        if (selector.includes('og:title')) {
          return { getAttribute: () => 'Product Title' }
        }
        if (selector.includes('og:image')) {
          return { getAttribute: () => 'https://example.com/image.jpg' }
        }
        if (selector === 'title') {
          return { textContent: 'Fallback Title' }
        }
        return null
      }),
      querySelectorAll: vi.fn(() => [])
    }

    // Mock DOMParser
    const originalParse = DOMParser.prototype.parseFromString
    DOMParser.prototype.parseFromString = vi.fn(() => mockDoc)

    const result = scrapingService.parseMetadata('<html></html>')
    expect(result.title).toBeDefined()
    expect(result.imageUrl).toBeDefined()
  })

  it('getMetaContent retrieves content by property', () => {
    const mockDoc = {
      querySelector: vi.fn((selector) => {
        if (selector === 'meta[property="og:title"]') {
          return { getAttribute: () => 'OG Title' }
        }
        return null
      }),
      querySelectorAll: vi.fn(() => [])
    }

    DOMParser.prototype.parseFromString = vi.fn(() => mockDoc)

    const result = scrapingService.getMetaContent(mockDoc, 'og:title')
    expect(result).toBe('OG Title')
  })

  it('extractImageUrl returns first image src', () => {
    const mockDoc = {
      querySelector: vi.fn((selector) => {
        if (selector === 'img[alt]') {
          return { src: 'https://example.com/image.jpg' }
        }
        return null
      }),
      querySelectorAll: vi.fn(() => [])
    }

    DOMParser.prototype.parseFromString = vi.fn(() => mockDoc)

    const result = scrapingService.extractImageUrl(mockDoc)
    expect(result).toBe('https://example.com/image.jpg')
  })

  it('extractPrice extracts from JSON-LD schema', () => {
    const jsonLdData = {
      '@type': 'Product',
      offers: {
        price: '99.99'
      }
    }

    const mockScript = {
      textContent: JSON.stringify(jsonLdData)
    }

    const mockDoc = {
      querySelector: vi.fn(() => null),
      querySelectorAll: vi.fn((selector) => {
        if (selector === 'script[type="application/ld+json"]') {
          return [mockScript]
        }
        return []
      })
    }

    DOMParser.prototype.parseFromString = vi.fn(() => mockDoc)

    const result = scrapingService.extractPrice(mockDoc)
    expect(result).toBe(99.99)
  })

  it('parseMetadata handles missing data gracefully', () => {
    const mockDoc = {
      querySelector: vi.fn(() => null),
      querySelectorAll: vi.fn(() => [])
    }

    DOMParser.prototype.parseFromString = vi.fn(() => mockDoc)

    const result = scrapingService.parseMetadata('<html></html>')
    expect(result.title).toBe('No title found')
    expect(result.imageUrl).toBeNull()
    expect(result.price).toBeNull()
  })

  it('makeAbsoluteUrl returns null for null input', () => {
    expect(scrapingService.makeAbsoluteUrl(null)).toBeNull()
  })

  it('scrapeUrl propagates network errors', async () => {
    global.fetch.mockRejectedValue(new Error('Network timeout'))

    await expect(scrapingService.scrapeUrl('https://example.com/product'))
      .rejects.toThrow('Network timeout')
  })

  it('detectPlatform handles uppercase URLs', () => {
    expect(scrapingService.detectPlatform('https://AMAZON.COM/product')).toBe('Amazon')
    expect(scrapingService.detectPlatform('https://EBAY.CO.UK/item')).toBe('eBay')
  })

  it('detectPlatform recognizes Hornbach and Decathlon', () => {
    expect(scrapingService.detectPlatform('https://hornbach.de/product')).toBe('Hornbach')
    expect(scrapingService.detectPlatform('https://decathlon.de/product')).toBe('Decathlon')
  })
})
