/**
 * Service for scraping product metadata from URLs
 *
 * Extracts metadata using:
 * 1. Open Graph meta tags (og:title, og:image, og:description)
 * 2. Schema.org structured data
 * 3. HTML parsing fallback
 */

export const scrapingService = {
  /**
   * Scrape product metadata from a URL
   * @param {string} url - Product URL to scrape
   * @returns {Promise<object>} Metadata object {title, imageUrl, description, price}
   * @throws {Error} If URL is invalid or fetch fails
   */
  async scrapeUrl(url) {
    if (!url || !url.startsWith('http')) {
      throw new Error('Invalid URL format')
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status}`)
      }

      const html = await response.text()
      const metadata = this.parseMetadata(html)

      return metadata
    } catch (error) {
      // Network errors, CORS issues, etc.
      throw new Error(`Scraping failed: ${error.message}`)
    }
  },

  /**
   * Parse metadata from HTML content
   * @param {string} html - HTML content
   * @returns {object} Metadata {title, imageUrl, description, price}
   * @private
   */
  parseMetadata(html) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    // Extract Open Graph metadata
    const ogTitle = this.getMetaContent(doc, 'og:title')
    const ogImage = this.getMetaContent(doc, 'og:image')
    const ogDescription = this.getMetaContent(doc, 'og:description')

    // Fallback to regular meta tags
    const title = ogTitle ||
                  this.getMetaContent(doc, 'name', 'title') ||
                  doc.querySelector('title')?.textContent ||
                  'No title found'

    const description = ogDescription ||
                       this.getMetaContent(doc, 'name', 'description') ||
                       ''

    const imageUrl = ogImage || this.extractImageUrl(doc)

    // Try to extract price from schema.org JSON-LD
    const price = this.extractPrice(doc)

    return {
      title: title.substring(0, 200), // Limit length
      imageUrl: imageUrl || null,
      description: description.substring(0, 500),
      price: price
    }
  },

  /**
   * Get meta tag content by property or name
   * @param {Document} doc - DOM document
   * @param {string} property - Property name or type
   * @param {string} name - Name attribute (optional)
   * @returns {string|null} Meta content or null
   * @private
   */
  getMetaContent(doc, property, name = null) {
    let element

    if (name) {
      // Look for <meta name="..." content="...">
      element = doc.querySelector(`meta[name="${name}"]`)
    } else {
      // Look for <meta property="..." content="...">
      element = doc.querySelector(`meta[property="${property}"]`)
      if (!element) {
        // Fallback to name attribute
        element = doc.querySelector(`meta[name="${property}"]`)
      }
    }

    return element?.getAttribute('content') || null
  },

  /**
   * Extract first image URL from document
   * @param {Document} doc - DOM document
   * @returns {string|null} Image URL or null
   * @private
   */
  extractImageUrl(doc) {
    // Try different image selectors
    const selectors = [
      'img[alt]',  // Prefer images with alt text
      'img.product-image',
      'img.main-image',
      'img[src*="product"]',
      'img' // Any image as fallback
    ]

    for (const selector of selectors) {
      const img = doc.querySelector(selector)
      if (img?.src) {
        // Make absolute URL if needed
        return this.makeAbsoluteUrl(img.src)
      }
    }

    return null
  },

  /**
   * Extract price from schema.org structured data
   * @param {Document} doc - DOM document
   * @returns {number|null} Price or null
   * @private
   */
  extractPrice(doc) {
    // Look for JSON-LD schema.org data
    const scripts = doc.querySelectorAll('script[type="application/ld+json"]')

    for (const script of scripts) {
      try {
        const data = JSON.parse(script.textContent)

        // Check for Product schema
        if (data['@type'] === 'Product' && data.offers) {
          const offers = Array.isArray(data.offers) ? data.offers[0] : data.offers
          if (offers.price) {
            return parseFloat(offers.price)
          }
        }

        // Check nested Product types
        if (data.itemListElement) {
          for (const item of data.itemListElement) {
            if (item['@type'] === 'Product' && item.offers?.price) {
              return parseFloat(item.offers.price)
            }
          }
        }
      } catch (e) {
        // Invalid JSON, continue
      }
    }

    return null
  },

  /**
   * Convert relative URL to absolute
   * @param {string} url - URL (relative or absolute)
   * @returns {string} Absolute URL
   * @private
   */
  makeAbsoluteUrl(url) {
    if (!url) return null
    if (url.startsWith('http')) return url
    if (url.startsWith('//')) return 'https:' + url
    return url // Return as-is if relative (will be resolved by browser)
  },

  /**
   * Detect platform from URL
   * @param {string} url - Product URL
   * @returns {string} Platform name (amazon, ebay, willhaben, etc.)
   */
  detectPlatform(url) {
    const hostname = new URL(url).hostname.toLowerCase()

    if (hostname.includes('amazon')) return 'Amazon'
    if (hostname.includes('ebay')) return 'eBay'
    if (hostname.includes('willhaben')) return 'Willhaben'
    if (hostname.includes('idealo')) return 'idealo'
    if (hostname.includes('alternate')) return 'Alternate'
    if (hostname.includes('baumarkt')) return 'Baumarkt'
    if (hostname.includes('hornbach')) return 'Hornbach'
    if (hostname.includes('decathlon')) return 'Decathlon'

    return 'Other'
  }
}
