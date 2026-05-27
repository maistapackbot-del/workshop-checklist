/**
 * Hook for managing image scraping with loading and error states
 * Uses Microlink API for reliable metadata extraction including prices
 */
import { useState } from 'react'
import { imageService } from '../services/imageService'

export function useImageScraping() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Scrape URL and return metadata via Microlink API
   * @param {string} url - Product URL
   * @returns {Promise<object>} Metadata {title, image_url, description, price}
   */
  const scrapeUrl = async (url) => {
    setLoading(true)
    setError(null)

    try {
      const metadata = await imageService.fetchMetadataViaMicrolink(url)
      if (!metadata) {
        throw new Error('Keine Metadaten gefunden')
      }
      return {
        title: metadata.title,
        image_url: metadata.image_url,
        description: metadata.description,
        price: metadata.price
      }
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
