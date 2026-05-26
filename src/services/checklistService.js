/**
 * Checklist service for managing checklist items
 */
import { supabase } from './supabaseClient'

export const checklistService = {
  // Fetch all top-level items for current user
  async getMainPoints() {
    const { data, error } = await supabase
      .from('checklist_items')
      .select('*')
      .is('parent_id', null)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data
  },

  // Fetch children of a parent item
  async getChildren(parentId) {
    const { data, error } = await supabase
      .from('checklist_items')
      .select('*')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data
  },

  // Create new item
  async createItem(name, type, parentId = null) {
    const { data, error } = await supabase
      .from('checklist_items')
      .insert([{
        name,
        type,
        parent_id: parentId
      }])
      .select()

    if (error) throw new Error(error.message)
    return data[0]
  },

  // Update item
  async updateItem(id, updates) {
    const { data, error } = await supabase
      .from('checklist_items')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) throw new Error(error.message)
    return data[0]
  },

  // Mark item as purchased
  async markPurchased(id) {
    return this.updateItem(id, { purchased_at: new Date().toISOString() })
  },

  // Mark item as unpurchased
  async markUnpurchased(id) {
    return this.updateItem(id, { purchased_at: null })
  },

  // Delete item
  async deleteItem(id) {
    const { error } = await supabase
      .from('checklist_items')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
  }
}
