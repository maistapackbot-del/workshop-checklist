/**
 * Service for extracting product metadata
 * Uses: Microlink API (CORS bypass), Custom API endpoint (server-side scraping)
 * Returns: title, description, image, price, etc.
 */

export const imageService = {
  /**
   * Fetch price via custom API endpoint (server-side scraping with cheerio)
   * @param {string} url - Product URL
   * @returns {Promise<number|null>} Price or null if extraction fails
   */
  async fetchPriceViaApi(url) {
    try {
      const response = await fetch('/api/scrapePrice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      const data = await response.json()
      return data.price || null
    } catch (err) {
      console.error('Price API fetch failed:', err)
      return null
    }
  },
  /**
   * Fetch metadata via Microlink API (bypasses CORS)
   * Falls back to custom API for price extraction if Microlink doesn't provide it
   * @param {string} url - Product URL
   * @returns {Promise<object>} Metadata {title, description, image, price}
   */
  async fetchMetadataViaMicrolink(url) {
    try {
      const response = await fetch(
        `https://api.microlink.io/?url=${encodeURIComponent(url)}`
      )
      const data = await response.json()

      if (data.data) {
        // Extract price from multiple possible locations
        let price = data.data.price

        // Try alternative price locations
        if (!price && data.data.offer) {
          price = data.data.offer.price || data.data.offer.priceCurrency
        }
        if (!price && data.data.offers) {
          price = Array.isArray(data.data.offers) ? data.data.offers[0]?.price : data.data.offers.price
        }

        // Try to extract from description if contains price pattern
        if (!price && data.data.description) {
          const priceMatch = data.data.description.match(/[€$]\s?[\d.,]+/)
          if (priceMatch) {
            price = parseFloat(priceMatch[0].replace(/[€$\s]/g, '').replace(',', '.'))
          }
        }

        // Convert price string to number if needed
        if (price && typeof price === 'string') {
          price = parseFloat(price.replace(/[€$\s,]/g, '.').replace(/\.(?=.*\.)/g, ''))
        }

        // Ensure price is a number or null
        price = (price && !isNaN(price)) ? price : null

        // If still no price, try custom API endpoint
        if (!price) {
          try {
            price = await this.fetchPriceViaApi(url)
          } catch (apiErr) {
            console.error('Custom API price extraction failed:', apiErr)
          }
        }

        console.log('Metadata extraction:', { url, title: data.data.title, price })

        return {
          title: data.data.title || null,
          description: data.data.description || null,
          image_url: data.data.image?.url || data.data.logo?.url || null,
          price: price
        }
      }
      return null
    } catch (err) {
      console.error('Microlink fetch failed:', err)
      return null
    }
  },

  /**
   * Get screenshot of webpage via Microlink
   * @param {string} url - Product URL
   * @returns {string} Screenshot URL
   */
  getScreenshotUrl(url) {
    try {
      return `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false`
    } catch (err) {
      return null
    }
  },

  /**
   * Get favicon URL for a website
   * @param {string} url - Website URL
   * @returns {string} Favicon URL
   */
  getFaviconUrl(url) {
    try {
      const urlObj = new URL(url)
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`
    } catch {
      return null
    }
  }
}
