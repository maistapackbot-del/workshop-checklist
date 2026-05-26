/**
 * Hook for managing image scraping with loading and error states
 */
import { useState } from 'react'
import { scrapingService } from '../services/scrapingService'

export function useImageScraping() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Scrape URL and return metadata
   * @param {string} url - Product URL
   * @returns {Promise<object>} Metadata {title, imageUrl, description, price}
   */
  const scrapeUrl = async (url) => {
    setLoading(true)
    setError(null)

    try {
      const metadata = await scrapingService.scrapeUrl(url)
      return metadata
    } catch (err) {
      const message = err.message || 'Scraping failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { scrapeUrl, loading, error }
}
