import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useChecklist } from '../useChecklist'
import * as checklistServiceModule from '../../services/checklistService'
import * as productLinksServiceModule from '../../services/productLinksService'
import * as trackingLinksServiceModule from '../../services/trackingLinksService'

// Mock all services
vi.mock('../../services/checklistService', () => ({
  checklistService: {
    getMainPoints: vi.fn(),
    getChildren: vi.fn(),
    createItem: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
    markPurchased: vi.fn(),
    markUnpurchased: vi.fn()
  }
}))

vi.mock('../../services/productLinksService', () => ({
  productLinksService: {
    getLinksForProduct: vi.fn(),
    createLink: vi.fn(),
    updateLink: vi.fn(),
    deleteLink: vi.fn()
  }
}))

vi.mock('../../services/trackingLinksService', () => ({
  trackingLinksService: {
    getTrackingLinks: vi.fn(),
    addTrackingLink: vi.fn(),
    updateTrackingLink: vi.fn(),
    deleteTrackingLink: vi.fn()
  }
}))

const { checklistService } = checklistServiceModule
const { productLinksService } = productLinksServiceModule
const { trackingLinksService } = trackingLinksServiceModule

describe('useChecklist hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // Initialization tests
  describe('initialization', () => {
    it('initializes with loading state', () => {
      checklistService.getMainPoints.mockResolvedValue([])
      productLinksService.getLinksForProduct.mockResolvedValue([])
      trackingLinksService.getTrackingLinks.mockResolvedValue([])

      const { result } = renderHook(() => useChecklist())

      expect(result.current.loading).toBe(true)
      expect(result.current.mainPoints).toEqual([])
      expect(result.current.error).toBe(null)
      expect(result.current.showPurchased).toBe(true)
    })

    it('loads main points on mount', async () => {
      const mockMainPoints = [
        { id: 'mp1', name: 'Main Point 1', type: 'hauptpunkt' },
        { id: 'mp2', name: 'Main Point 2', type: 'hauptpunkt' }
      ]

      checklistService.getMainPoints.mockResolvedValue(mockMainPoints)
      checklistService.getChildren.mockResolvedValue([])
      productLinksService.getLinksForProduct.mockResolvedValue([])
      trackingLinksService.getTrackingLinks.mockResolvedValue([])

      const { result } = renderHook(() => useChecklist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.mainPoints).toEqual(mockMainPoints)
    })

    it('loads hierarchical data correctly', async () => {
      const mockMainPoints = [{ id: 'mp1', name: 'Main Point 1', type: 'hauptpunkt' }]
      const mockCategories = [{ id: 'cat1', name: 'Category 1', type: 'kategorie' }]
      const mockProducts = [{ id: 'prod1', name: 'Product 1', type: 'produkt' }]
      const mockLinks = [{ id: 'link1', url: 'http://example.com' }]

      checklistService.getMainPoints.mockResolvedValue(mockMainPoints)
      checklistService.getChildren
        .mockResolvedValueOnce(mockCategories) // Children of main point
        .mockResolvedValueOnce(mockProducts) // Children of category
      productLinksService.getLinksForProduct.mockResolvedValue(mockLinks)
      trackingLinksService.getTrackingLinks.mockResolvedValue([])

      const { result } = renderHook(() => useChecklist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.mainPoints).toEqual(mockMainPoints)
      expect(result.current.categories['mp1']).toEqual(mockCategories)
      expect(result.current.products['cat1']).toEqual(mockProducts)
      expect(result.current.links['prod1']).toEqual(mockLinks)
    })
  })

  // Create operations
  describe('create operations', () => {
    beforeEach(() => {
      checklistService.getMainPoints.mockResolvedValue([])
      checklistService.getChildren.mockResolvedValue([])
      productLinksService.getLinksForProduct.mockResolvedValue([])
      trackingLinksService.getTrackingLinks.mockResolvedValue([])
    })

    it('creates a main point', async () => {
      const newMainPoint = { id: 'mp1', name: 'New Main Point', type: 'hauptpunkt' }
      checklistService.createItem.mockResolvedValue(newMainPoint)

      const { result } = renderHook(() => useChecklist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let createdItem
      await act(async () => {
        createdItem = await result.current.createMainPoint('New Main Point')
      })

      expect(createdItem).toEqual(newMainPoint)
      expect(result.current.mainPoints).toContainEqual(newMainPoint)
      expect(checklistService.createItem).toHaveBeenCalledWith('New Main Point', 'hauptpunkt')
    })

    it('creates a category under a main point', async () => {
      const mockMainPoints = [{ id: 'mp1', name: 'Main Point 1', type: 'hauptpunkt' }]
      const newCategory = { id: 'cat1', name: 'New Category', type: 'kategorie', parent_id: 'mp1' }

      checklistService.getMainPoints.mockResolvedValue(mockMainPoints)
      checklistService.getChildren.mockResolvedValue([])
      checklistService.createItem.mockResolvedValue(newCategory)
      productLinksService.getLinksForProduct.mockResolvedValue([])
      trackingLinksService.getTrackingLinks.mockResolvedValue([])

      const { result } = renderHook(() => useChecklist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let createdItem
      await act(async () => {
        createdItem = await result.current.createCategory('mp1', 'New Category')
      })

      expect(createdItem).toEqual(newCategory)
      expect(result.current.categories['mp1']).toContainEqual(newCategory)
      expect(checklistService.createItem).toHaveBeenCalledWith('New Category', 'kategorie', 'mp1')
    })

    it('creates a product under a parent', async () => {
      const newProduct = { id: 'prod1', name: 'New Product', type: 'produkt', parent_id: 'cat1' }

      checklistService.getMainPoints.mockResolvedValue([])
      checklistService.getChildren.mockResolvedValue([])
      checklistService.createItem.mockResolvedValue(newProduct)
      productLinksService.getLinksForProduct.mockResolvedValue([])
      trackingLinksService.getTrackingLinks.mockResolvedValue([])

      const { result } = renderHook(() => useChecklist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let createdItem
      await act(async () => {
        createdItem = await result.current.createProduct('cat1', 'New Product')
      })

      expect(createdItem).toEqual(newProduct)
      expect(result.current.products['cat1']).toContainEqual(newProduct)
      expect(checklistService.createItem).toHaveBeenCalledWith('New Product', 'produkt', 'cat1')
    })

    it('handles create errors', async () => {
      checklistService.getMainPoints.mockResolvedValue([])
      checklistService.getChildren.mockResolvedValue([])
      const error = new Error('Creation failed')
      checklistService.createItem.mockRejectedValue(error)
      productLinksService.getLinksForProduct.mockResolvedValue([])
      trackingLinksService.getTrackingLinks.mockResolvedValue([])

      const { result } = renderHook(() => useChecklist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let thrownError = null
      await act(async () => {
        try {
          await result.current.createMainPoint('New Main Point')
        } catch (err) {
          thrownError = err
        }
      })

      expect(thrownError?.message).toBe('Creation failed')
      expect(result.current.error).toBe('Creation failed')
    })
  })

  // Link operations
  describe('link operations', () => {
    beforeEach(() => {
      checklistService.getMainPoints.mockResolvedValue([])
      checklistService.getChildren.mockResolvedValue([])
      productLinksService.getLinksForProduct.mockResolvedValue([])
      trackingLinksService.getTrackingLinks.mockResolvedValue([])
    })

    it('adds a product link', async () => {
      const newLink = { id: 'link1', product_id: 'prod1', url: 'http://example.com' }
      productLinksService.createLink.mockResolvedValue(newLink)

      const { result } = renderHook(() => useChecklist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let addedLink
      await act(async () => {
        addedLink = await result.current.addProductLink('prod1', 'http://example.com', {})
      })

      expect(addedLink).toEqual(newLink)
      expect(result.current.links['prod1']).toContainEqual(newLink)
    })

    it('adds a tracking link', async () => {
      const newTracking = { id: 'track1', product_link_id: 'link1', tracking_url: 'http://tracking.com', carrier: 'DHL' }
      trackingLinksService.addTrackingLink.mockResolvedValue(newTracking)

      const { result } = renderHook(() => useChecklist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let addedTracking
      await act(async () => {
        addedTracking = await result.current.addTrackingLink('link1', 'http://tracking.com', 'DHL')
      })

      expect(addedTracking).toEqual(newTracking)
      expect(result.current.tracking['link1']).toContainEqual(newTracking)
    })

    it('handles link errors', async () => {
      checklistService.getMainPoints.mockResolvedValue([])
      checklistService.getChildren.mockResolvedValue([])
      const error = new Error('Link creation failed')
      productLinksService.createLink.mockRejectedValue(error)
      productLinksService.getLinksForProduct.mockResolvedValue([])
      trackingLinksService.getTrackingLinks.mockResolvedValue([])

      const { result } = renderHook(() => useChecklist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let thrownError = null
      await act(async () => {
        try {
          await result.current.addProductLink('prod1', 'http://example.com')
        } catch (err) {
          thrownError = err
        }
      })

      expect(thrownError?.message).toBe('Link creation failed')
      expect(result.current.error).toBe('Link creation failed')
    })
  })

  // Purchase operations
  describe('purchase operations', () => {
    beforeEach(() => {
      checklistService.getMainPoints.mockResolvedValue([])
      checklistService.getChildren.mockResolvedValue([])
      productLinksService.getLinksForProduct.mockResolvedValue([])
      trackingLinksService.getTrackingLinks.mockResolvedValue([])
    })

    it('marks a product as purchased', async () => {
      checklistService.updateItem.mockResolvedValue({})

      const { result } = renderHook(() => useChecklist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.markPurchased('prod1', 'Test notes')
      })

      expect(checklistService.updateItem).toHaveBeenCalledWith(
        'prod1',
        expect.objectContaining({
          purchase_notes: 'Test notes'
        })
      )
    })

    it('marks a product as unpurchased', async () => {
      checklistService.updateItem.mockResolvedValue({})

      const { result } = renderHook(() => useChecklist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.markUnpurchased('prod1')
      })

      expect(checklistService.updateItem).toHaveBeenCalledWith('prod1', { purchased_at: null })
    })
  })

  // Delete operations
  describe('delete operations', () => {
    it('deletes an item and reloads data', async () => {
      checklistService.getMainPoints.mockResolvedValue([])
      checklistService.getChildren.mockResolvedValue([])
      checklistService.deleteItem.mockResolvedValue({})
      productLinksService.getLinksForProduct.mockResolvedValue([])
      trackingLinksService.getTrackingLinks.mockResolvedValue([])

      const { result } = renderHook(() => useChecklist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const initialCallCount = checklistService.getMainPoints.mock.calls.length

      await act(async () => {
        await result.current.deleteItem('item1')
      })

      expect(checklistService.deleteItem).toHaveBeenCalledWith('item1')
      expect(checklistService.getMainPoints.mock.calls.length).toBeGreaterThan(initialCallCount)
    })

    it('deletes a product link', async () => {
      checklistService.getMainPoints.mockResolvedValue([])
      checklistService.getChildren.mockResolvedValue([])
      productLinksService.deleteLink.mockResolvedValue({})
      productLinksService.getLinksForProduct.mockResolvedValue([])
      trackingLinksService.getTrackingLinks.mockResolvedValue([])

      const { result } = renderHook(() => useChecklist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.deleteProductLink('link1')
      })

      expect(productLinksService.deleteLink).toHaveBeenCalledWith('link1')
    })

    it('deletes a tracking link', async () => {
      checklistService.getMainPoints.mockResolvedValue([])
      checklistService.getChildren.mockResolvedValue([])
      trackingLinksService.deleteTrackingLink.mockResolvedValue({})
      productLinksService.getLinksForProduct.mockResolvedValue([])
      trackingLinksService.getTrackingLinks.mockResolvedValue([])

      const { result } = renderHook(() => useChecklist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.deleteTrackingLink('track1')
      })

      expect(trackingLinksService.deleteTrackingLink).toHaveBeenCalledWith('track1')
    })
  })

  // State management
  describe('state management', () => {
    beforeEach(() => {
      checklistService.getMainPoints.mockResolvedValue([])
      checklistService.getChildren.mockResolvedValue([])
      productLinksService.getLinksForProduct.mockResolvedValue([])
      trackingLinksService.getTrackingLinks.mockResolvedValue([])
    })

    it('toggles showPurchased state', async () => {
      const { result } = renderHook(() => useChecklist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.showPurchased).toBe(true)

      act(() => {
        result.current.setShowPurchased(false)
      })

      expect(result.current.showPurchased).toBe(false)
    })

    it('clears error when operation succeeds', async () => {
      checklistService.getMainPoints.mockResolvedValue([])
      checklistService.getChildren.mockResolvedValue([])
      checklistService.createItem.mockResolvedValue({ id: 'mp1', name: 'New' })
      productLinksService.getLinksForProduct.mockResolvedValue([])
      trackingLinksService.getTrackingLinks.mockResolvedValue([])

      const { result } = renderHook(() => useChecklist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.createMainPoint('New Main Point')
      })

      expect(result.current.error).toBe(null)
    })
  })

  // Reload function
  describe('reload function', () => {
    it('reloads all data', async () => {
      const mockMainPoints = [{ id: 'mp1', name: 'Main Point', type: 'hauptpunkt' }]
      checklistService.getMainPoints.mockResolvedValue(mockMainPoints)
      checklistService.getChildren.mockResolvedValue([])
      productLinksService.getLinksForProduct.mockResolvedValue([])
      trackingLinksService.getTrackingLinks.mockResolvedValue([])

      const { result } = renderHook(() => useChecklist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const initialCallCount = checklistService.getMainPoints.mock.calls.length

      await act(async () => {
        await result.current.reload()
      })

      expect(checklistService.getMainPoints.mock.calls.length).toBeGreaterThan(initialCallCount)
    })
  })
})
