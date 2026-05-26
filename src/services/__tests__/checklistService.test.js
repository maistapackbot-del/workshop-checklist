import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checklistService } from '../checklistService'
import * as supabaseModule from '../supabaseClient'

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn()
    }
  }
}))

describe('checklistService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock getUser for auth
    supabaseModule.supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-123' } },
      error: null
    })
  })

  it('getMainPoints fetches top-level items', async () => {
    const mockData = [
      { id: '1', name: 'Elektrowerkzeuge', type: 'hauptpunkt', parent_id: null }
    ]

    supabaseModule.supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        is: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockData, error: null })
          })
        })
      })
    })

    const result = await checklistService.getMainPoints()
    expect(result).toEqual(mockData)
  })

  it('getChildren fetches children of a parent', async () => {
    const mockData = [
      { id: '2', name: 'Bohrschrauber', type: 'kategorie', parent_id: '1' }
    ]

    supabaseModule.supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockData, error: null })
          })
        })
      })
    })

    const result = await checklistService.getChildren('1')
    expect(result).toEqual(mockData)
  })

  it('createItem inserts new item', async () => {
    const mockData = { id: '3', name: 'DeWalt 18V', type: 'produkt', parent_id: '2' }
    const mockParent = { id: '2', type: 'kategorie' }

    // First call for parent verification, second call for insert
    supabaseModule.supabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockParent, error: null })
          })
        })
      })
      .mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data: [mockData], error: null })
        })
      })

    const result = await checklistService.createItem('DeWalt 18V', 'produkt', '2')
    expect(result).toEqual(mockData)
  })

  it('markPurchased updates purchased_at timestamp', async () => {
    const mockData = { id: '3', purchased_at: '2026-05-26T10:00:00Z' }

    supabaseModule.supabase.from.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data: [mockData], error: null })
        })
      })
    })

    const result = await checklistService.markPurchased('3')
    expect(result.purchased_at).toBeTruthy()
  })

  it('markUnpurchased clears purchased_at timestamp', async () => {
    const mockData = { id: '3', purchased_at: null }

    supabaseModule.supabase.from.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data: [mockData], error: null })
        })
      })
    })

    const result = await checklistService.markUnpurchased('3')
    expect(result.purchased_at).toBeNull()
  })

  it('deleteItem removes an item', async () => {
    supabaseModule.supabase.from.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    })

    await checklistService.deleteItem('3')
    expect(supabaseModule.supabase.from).toHaveBeenCalledWith('checklist_items')
  })

  it('throws error on failed getMainPoints query', async () => {
    supabaseModule.supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        is: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' }
            })
          })
        })
      })
    })

    await expect(checklistService.getMainPoints()).rejects.toThrow('Database error')
  })

  it('throws error on failed getChildren query', async () => {
    supabaseModule.supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Query failed' }
            })
          })
        })
      })
    })

    await expect(checklistService.getChildren('1')).rejects.toThrow('Query failed')
  })

  it('throws error on failed createItem', async () => {
    supabaseModule.supabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Insert failed' }
        })
      })
    })

    await expect(checklistService.createItem('Test', 'produkt'))
      .rejects
      .toThrow('Insert failed')
  })

  it('throws error on failed updateItem', async () => {
    supabaseModule.supabase.from.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Update failed' }
          })
        })
      })
    })

    await expect(checklistService.markPurchased('3'))
      .rejects
      .toThrow('Update failed')
  })

  it('throws error on failed deleteItem', async () => {
    supabaseModule.supabase.from.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: { message: 'Delete failed' }
        })
      })
    })

    await expect(checklistService.deleteItem('3'))
      .rejects
      .toThrow('Delete failed')
  })

  it('updateItem accepts custom updates object', async () => {
    const mockData = { id: '3', name: 'Updated Name', description: 'New description' }

    supabaseModule.supabase.from.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data: [mockData], error: null })
        })
      })
    })

    const result = await checklistService.updateItem('3', { name: 'Updated Name', description: 'New description' })
    expect(result).toEqual(mockData)
  })

  it('createItem validates type parameter', async () => {
    await expect(checklistService.createItem('Test', 'invalid_type'))
      .rejects.toThrow(/Invalid type/)
  })

  it('createItem validates name parameter', async () => {
    await expect(checklistService.createItem('', 'produkt'))
      .rejects.toThrow('Item name required')
  })

  it('createItem verifies parent exists', async () => {
    supabaseModule.supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
        })
      })
    })

    await expect(checklistService.createItem('New Item', 'kategorie', 'invalid-parent'))
      .rejects.toThrow('Parent item invalid-parent not found')
  })

  it('updateItem requires ID parameter', async () => {
    await expect(checklistService.updateItem('', { name: 'Test' }))
      .rejects.toThrow('Item ID required')
  })

  it('updateItem requires updates object', async () => {
    await expect(checklistService.updateItem('3', {}))
      .rejects.toThrow('No updates provided')
  })

  it('markPurchased requires ID parameter', async () => {
    await expect(checklistService.markPurchased(''))
      .rejects.toThrow('Item ID required')
  })

  it('markUnpurchased requires ID parameter', async () => {
    await expect(checklistService.markUnpurchased(''))
      .rejects.toThrow('Item ID required')
  })

  it('deleteItem requires ID parameter', async () => {
    await expect(checklistService.deleteItem(''))
      .rejects.toThrow('Item ID required')
  })

  it('getChildren requires parent ID', async () => {
    await expect(checklistService.getChildren(''))
      .rejects.toThrow('Parent ID required')
  })

  it('getMainPoints orders by order_index first', async () => {
    const mockData = []
    const mockQuery = {
      select: vi.fn().mockReturnValue({
        is: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockData, error: null })
          })
        })
      })
    }

    supabaseModule.supabase.from.mockReturnValue(mockQuery)
    await checklistService.getMainPoints()

    const orderCalls = mockQuery.select().is().order.mock.calls
    expect(orderCalls[0][0]).toBe('order_index')
  })
})
