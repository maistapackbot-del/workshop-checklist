/**
 * Service for managing tracking links
 */
import { supabase } from './supabaseClient'

export const trackingLinksService = {
  /**
   * Get all tracking links for a product link
   * @param {string} productLinkId - Product link ID
   * @returns {Promise<Array>} Array of tracking links
   * @throws {Error} If database query fails
   */
  async getTrackingLinks(productLinkId) {
    if (!productLinkId) throw new Error('Product link ID required')

    const { data, error } = await supabase
      .from('tracking_links')
      .select('*')
      .eq('product_link_id', productLinkId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  },

  /**
   * Add a tracking link
   * @param {string} productLinkId - Product link ID
   * @param {string} trackingUrl - Tracking URL
   * @param {string} carrier - Carrier name (e.g., "DHL")
   * @returns {Promise<object>} Created tracking link
   * @throws {Error} If database operation fails
   */
  async addTrackingLink(productLinkId, trackingUrl, carrier) {
    if (!productLinkId || !trackingUrl) {
      throw new Error('Product link ID and tracking URL required')
    }
    if (!trackingUrl.startsWith('http')) {
      throw new Error('Invalid tracking URL format')
    }

    // Get current user for user_id
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('tracking_links')
      .insert([{
        user_id: user.id,
        product_link_id: productLinkId,
        tracking_url: trackingUrl,
        carrier
      }])
      .select()

    if (error) throw new Error(error.message)
    if (!data || data.length === 0) throw new Error('No data returned')
    return data[0]
  },

  /**
   * Update a tracking link
   * @param {string} trackingLinkId - Tracking link ID
   * @param {object} updates - Fields to update
   * @returns {Promise<object>} Updated tracking link
   * @throws {Error} If database operation fails
   */
  async updateTrackingLink(trackingLinkId, updates) {
    if (!trackingLinkId) throw new Error('Tracking link ID required')

    const { data, error } = await supabase
      .from('tracking_links')
      .update(updates)
      .eq('id', trackingLinkId)
      .select()

    if (error) throw new Error(error.message)
    if (!data || data.length === 0) throw new Error('Tracking link not found')
    return data[0]
  },

  /**
   * Delete a tracking link
   * @param {string} trackingLinkId - Tracking link ID
   * @throws {Error} If database operation fails
   */
  async deleteTrackingLink(trackingLinkId) {
    if (!trackingLinkId) throw new Error('Tracking link ID required')

    const { error } = await supabase
      .from('tracking_links')
      .delete()
      .eq('id', trackingLinkId)

    if (error) throw new Error(error.message)
  }
}
