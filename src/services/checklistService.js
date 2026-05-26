/**
 * Checklist service for managing checklist items
 *
 * Handles CRUD operations for the 3-level hierarchical structure:
 * - Hauptpunkt (main point): top-level items
 * - Kategorie (category): sub-items under Hauptpunkte
 * - Produkt (product): items under Kategorien
 */
import { supabase } from './supabaseClient'

const VALID_TYPES = ['hauptpunkt', 'kategorie', 'produkt']

export const checklistService = {
  /**
   * Fetch all top-level items for current user
   * @returns {Promise<Array>} Array of main points (parent_id = null)
   * @throws {Error} If database query fails
   */
  async getMainPoints() {
    const { data, error } = await supabase
      .from('checklist_items')
      .select('*')
      .is('parent_id', null)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  },

  /**
   * Fetch children of a parent item
   * @param {string} parentId - Parent item ID
   * @returns {Promise<Array>} Array of child items
   * @throws {Error} If database query fails or parent not found
   */
  async getChildren(parentId) {
    if (!parentId) throw new Error('Parent ID required')

    const { data, error } = await supabase
      .from('checklist_items')
      .select('*')
      .eq('parent_id', parentId)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  },

  /**
   * Create new item
   * @param {string} name - Item name
   * @param {string} type - Item type ('hauptpunkt', 'kategorie', or 'produkt')
   * @param {string} parentId - Parent item ID (optional, null for top-level)
   * @returns {Promise<object>} Created item
   * @throws {Error} If validation fails or database operation fails
   */
  async createItem(name, type, parentId = null) {
    // Validate inputs
    if (!name || !name.trim()) throw new Error('Item name required')
    if (!VALID_TYPES.includes(type)) {
      throw new Error(`Invalid type: ${type}. Must be one of: ${VALID_TYPES.join(', ')}`)
    }

    // If has parent, verify parent exists
    if (parentId) {
      const { data: parent, error: parentError } = await supabase
        .from('checklist_items')
        .select('id, type')
        .eq('id', parentId)
        .single()

      if (parentError || !parent) {
        throw new Error(`Parent item ${parentId} not found`)
      }
    }

    const { data, error } = await supabase
      .from('checklist_items')
      .insert([{
        name: name.trim(),
        type,
        parent_id: parentId
      }])
      .select()

    if (error) throw new Error(error.message)
    if (!data || data.length === 0) throw new Error('No data returned from creation')
    return data[0]
  },

  /**
   * Update item
   * @param {string} id - Item ID
   * @param {object} updates - Fields to update (name, description, order_index, purchase_notes, etc.)
   * @returns {Promise<object>} Updated item
   * @throws {Error} If database operation fails
   */
  async updateItem(id, updates) {
    if (!id) throw new Error('Item ID required')
    if (!updates || Object.keys(updates).length === 0) {
      throw new Error('No updates provided')
    }

    const { data, error } = await supabase
      .from('checklist_items')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) throw new Error(error.message)
    if (!data || data.length === 0) throw new Error('Item not found')
    return data[0]
  },

  /**
   * Mark item as purchased
   * @param {string} id - Item ID
   * @returns {Promise<object>} Updated item with purchased_at timestamp
   * @throws {Error} If database operation fails
   */
  async markPurchased(id) {
    if (!id) throw new Error('Item ID required')
    return this.updateItem(id, { purchased_at: new Date().toISOString() })
  },

  /**
   * Mark item as unpurchased
   * @param {string} id - Item ID
   * @returns {Promise<object>} Updated item with purchased_at = null
   * @throws {Error} If database operation fails
   */
  async markUnpurchased(id) {
    if (!id) throw new Error('Item ID required')
    return this.updateItem(id, { purchased_at: null })
  },

  /**
   * Delete item
   * @param {string} id - Item ID
   * @throws {Error} If database operation fails
   */
  async deleteItem(id) {
    if (!id) throw new Error('Item ID required')

    const { error } = await supabase
      .from('checklist_items')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
  }
}
