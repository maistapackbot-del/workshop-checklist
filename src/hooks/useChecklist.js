/**
 * Custom hook for managing all checklist data and operations.
 *
 * Provides:
 * - mainPoints: Array of top-level items
 * - categories: Object mapping mainPointId to category arrays
 * - products: Object mapping parentId (mainPoint or category) to product arrays
 * - links: Object mapping productId to product links
 * - tracking: Object mapping productLinkId to tracking links
 * - loading: Boolean indicating if data is being loaded
 * - error: String error message or null
 * - showPurchased: Boolean for filtering purchased items
 * - CRUD operations: create, update, delete items
 * - Link operations: add product links and tracking links
 * - Utility: reload function to refresh all data
 */

import { useState, useEffect } from 'react'
import { checklistService } from '../services/checklistService'
import { productLinksService } from '../services/productLinksService'
import { trackingLinksService } from '../services/trackingLinksService'

export function useChecklist() {
  const [mainPoints, setMainPoints] = useState([])
  const [categories, setCategories] = useState({})
  const [products, setProducts] = useState({})
  const [links, setLinks] = useState({})
  const [tracking, setTracking] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showPurchased, setShowPurchased] = useState(true)

  // Load initial data
  useEffect(() => {
    loadMainPoints()
  }, [])

  /**
   * Load all main points and their hierarchical children
   */
  const loadMainPoints = async () => {
    try {
      setLoading(true)
      setError(null)

      const items = await checklistService.getMainPoints()
      setMainPoints(items)

      // Load children for each main point
      const newCategories = {}
      const newProducts = {}
      const newLinks = {}
      const newTracking = {}

      for (const mainPoint of items) {
        const children = await checklistService.getChildren(mainPoint.id)

        const cats = children.filter(c => c.type === 'kategorie')
        const prods = children.filter(c => c.type === 'produkt')

        newCategories[mainPoint.id] = cats
        newProducts[mainPoint.id] = prods

        // Load children of categories (nested products)
        for (const cat of cats) {
          const catChildren = await checklistService.getChildren(cat.id)
          newProducts[cat.id] = catChildren

          // Load product links for category products
          for (const prod of catChildren) {
            const prodLinks = await productLinksService.getLinksForProduct(prod.id)
            newLinks[prod.id] = prodLinks

            // Load tracking links for each product link
            for (const link of prodLinks) {
              const trackingLinks = await trackingLinksService.getTrackingLinks(link.id)
              newTracking[link.id] = trackingLinks
            }
          }
        }

        // Load product links for main point products
        for (const prod of prods) {
          const prodLinks = await productLinksService.getLinksForProduct(prod.id)
          newLinks[prod.id] = prodLinks

          // Load tracking links for each product link
          for (const link of prodLinks) {
            const trackingLinks = await trackingLinksService.getTrackingLinks(link.id)
            newTracking[link.id] = trackingLinks
          }
        }
      }

      setCategories(newCategories)
      setProducts(newProducts)
      setLinks(newLinks)
      setTracking(newTracking)
    } catch (err) {
      setError(err.message)
      console.error('Error loading checklist:', err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Create a new main point
   * @param {string} name - Main point name
   * @returns {Promise<object>} Created item
   */
  const createMainPoint = async (name) => {
    try {
      const item = await checklistService.createItem(name, 'hauptpunkt')
      setMainPoints([...mainPoints, item])
      setError(null)
      return item
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  /**
   * Create a new category under a main point
   * @param {string} mainPointId - Parent main point ID
   * @param {string} name - Category name
   * @returns {Promise<object>} Created item
   */
  const createCategory = async (mainPointId, name) => {
    try {
      const item = await checklistService.createItem(name, 'kategorie', mainPointId)
      setCategories(prev => ({
        ...prev,
        [mainPointId]: [...(prev[mainPointId] || []), item]
      }))
      setError(null)
      return item
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  /**
   * Create a new product under a parent (main point or category)
   * @param {string} parentId - Parent item ID
   * @param {string} name - Product name
   * @returns {Promise<object>} Created item
   */
  const createProduct = async (parentId, name) => {
    try {
      const item = await checklistService.createItem(name, 'produkt', parentId)
      setProducts(prev => ({
        ...prev,
        [parentId]: [...(prev[parentId] || []), item]
      }))
      setError(null)
      return item
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  /**
   * Add a product link to a product
   * @param {string} productId - Product ID
   * @param {string} url - Product URL
   * @param {object} metadata - Optional metadata {platform, title, price, image_url}
   * @returns {Promise<object>} Created link
   */
  const addProductLink = async (productId, url, metadata = {}) => {
    try {
      const link = await productLinksService.createLink(productId, url, metadata)
      setLinks(prev => ({
        ...prev,
        [productId]: [...(prev[productId] || []), link]
      }))
      setError(null)
      return link
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  /**
   * Add a tracking link to a product link
   * @param {string} productLinkId - Product link ID
   * @param {string} trackingUrl - Tracking URL
   * @param {string} carrier - Carrier name
   * @returns {Promise<object>} Created tracking link
   */
  const addTrackingLink = async (productLinkId, trackingUrl, carrier) => {
    try {
      const track = await trackingLinksService.addTrackingLink(productLinkId, trackingUrl, carrier)
      setTracking(prev => ({
        ...prev,
        [productLinkId]: [...(prev[productLinkId] || []), track]
      }))
      setError(null)
      return track
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  /**
   * Mark a product as purchased
   * @param {string} productId - Product ID
   * @param {string} notes - Optional purchase notes
   * @returns {Promise<void>}
   */
  const markPurchased = async (productId, notes = '') => {
    try {
      const updates = { purchased_at: new Date().toISOString() }
      if (notes) updates.purchase_notes = notes

      await checklistService.updateItem(productId, updates)

      // Update local state for all products
      setProducts(prev => {
        const newProducts = { ...prev }
        Object.keys(newProducts).forEach(key => {
          newProducts[key] = newProducts[key].map(p =>
            p.id === productId ? { ...p, ...updates } : p
          )
        })
        return newProducts
      })
      setError(null)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  /**
   * Mark a product as unpurchased
   * @param {string} productId - Product ID
   * @returns {Promise<void>}
   */
  const markUnpurchased = async (productId) => {
    try {
      const updates = { purchased_at: null }

      await checklistService.updateItem(productId, updates)

      // Update local state for all products
      setProducts(prev => {
        const newProducts = { ...prev }
        Object.keys(newProducts).forEach(key => {
          newProducts[key] = newProducts[key].map(p =>
            p.id === productId ? { ...p, ...updates } : p
          )
        })
        return newProducts
      })
      setError(null)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  /**
   * Delete an item and reload data
   * @param {string} itemId - Item ID to delete
   * @returns {Promise<void>}
   */
  const deleteItem = async (itemId) => {
    try {
      await checklistService.deleteItem(itemId)
      await loadMainPoints()
      setError(null)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  /**
   * Delete a product link
   * @param {string} linkId - Product link ID to delete
   * @returns {Promise<void>}
   */
  const deleteProductLink = async (linkId) => {
    try {
      await productLinksService.deleteLink(linkId)
      // Reload to refresh state
      await loadMainPoints()
      setError(null)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  /**
   * Delete a tracking link
   * @param {string} trackingLinkId - Tracking link ID to delete
   * @returns {Promise<void>}
   */
  const deleteTrackingLink = async (trackingLinkId) => {
    try {
      await trackingLinksService.deleteTrackingLink(trackingLinkId)
      await loadMainPoints()
      setError(null)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  return {
    // State
    mainPoints,
    categories,
    products,
    links,
    tracking,
    loading,
    error,
    showPurchased,
    setShowPurchased,
    // Item operations
    createMainPoint,
    createCategory,
    createProduct,
    deleteItem,
    // Link operations
    addProductLink,
    deleteProductLink,
    addTrackingLink,
    deleteTrackingLink,
    // Purchase operations
    markPurchased,
    markUnpurchased,
    // Utility
    reload: loadMainPoints
  }
}
