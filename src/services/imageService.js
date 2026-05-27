/**
 * Service for extracting/generating product images
 * Falls back through multiple strategies:
 * 1. Scraped Open Graph image
 * 2. Website screenshot via Microlink API
 * 3. Website favicon
 * 4. Generic placeholder
 */

export const imageService = {
  /**
   * Get image URL for a link, with fallbacks
   * @param {string} url - Product URL
   * @param {string} scrapedImage - Already-scraped OG image (optional)
   * @returns {string} Image URL or null
   */
  getImageUrl(url, scrapedImage) {
    // Use scraped image if available
    if (scrapedImage) {
      return scrapedImage
    }

    try {
      const urlObj = new URL(url)
      const domain = urlObj.hostname

      // Try Microlink screenshot service (free tier)
      // Returns thumbnail screenshot of the page
      const microlinkUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false`

      return microlinkUrl
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
      // Use Google's favicon service as fallback
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`
    } catch {
      return null
    }
  }
}
