/**
 * Service for extracting product metadata when browser scraping fails
 * Uses Microlink API to bypass CORS restrictions
 * Returns: title, description, image, etc.
 */

export const imageService = {
  /**
   * Fetch metadata via Microlink API (bypasses CORS)
   * @param {string} url - Product URL
   * @returns {Promise<object>} Metadata {title, description, image, etc}
   */
  async fetchMetadataViaMicrolink(url) {
    try {
      const response = await fetch(
        `https://api.microlink.io/?url=${encodeURIComponent(url)}`
      )
      const data = await response.json()

      if (data.data) {
        return {
          title: data.data.title || null,
          description: data.data.description || null,
          image_url: data.data.image?.url || null,
          price: data.data.price || null
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
