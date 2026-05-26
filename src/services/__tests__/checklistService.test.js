import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checklistService } from '../checklistService'
import * as supabaseModule from '../supabaseClient'

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn()
  }
}))

describe('checklistService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getMainPoints fetches top-level items', async () => {
    const mockData = [
      { id: '1', name: 'Elektrowerkzeuge', type: 'hauptpunkt', parent_id: null }
    ]

    supabaseModule.supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        is: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockData, error: null })
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
          order: vi.fn().mockResolvedValue({ data: mockData, error: null })
        })
      })
    })

    const result = await checklistService.getChildren('1')
    expect(result).toEqual(mockData)
  })

  it('createItem inserts new item', async () => {
    const mockData = { id: '3', name: 'DeWalt 18V', type: 'produkt', parent_id: '2' }

    supabaseModule.supabase.from.mockReturnValue({
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
          order: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' }
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
          order: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Query failed' }
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
})
