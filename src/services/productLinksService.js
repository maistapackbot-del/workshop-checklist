/**
 * Service for managing product links
 */
import { supabase } from './supabaseClient'

export const productLinksService = {
  /**
   * Get all links for a product
   * @param {string} productId - Product ID
   * @returns {Promise<Array>} Array of product links
   * @throws {Error} If database query fails
   */
  async getLinksForProduct(productId) {
    if (!productId) throw new Error('Product ID required')

    const { data, error } = await supabase
      .from('product_links')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  },

  /**
   * Create a new product link
   * @param {string} productId - Product ID
   * @param {string} url - Product URL
   * @param {object} metadata - Optional {platform, title, price, image_url}
   * @returns {Promise<object>} Created link
   * @throws {Error} If database operation fails
   */
  async createLink(productId, url, metadata = {}) {
    if (!productId || !url) throw new Error('Product ID and URL required')
    if (!url.startsWith('http')) throw new Error('Invalid URL format')

    // Get current user for user_id
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('product_links')
      .insert([{
        user_id: user.id,
        product_id: productId,
        url,
        platform: metadata.platform,
        title: metadata.title,
        price: metadata.price,
        image_url: metadata.image_url
      }])
      .select()

    if (error) throw new Error(error.message)
    if (!data || data.length === 0) throw new Error('No data returned')
    return data[0]
  },

  /**
   * Update a product link
   * @param {string} linkId - Link ID
   * @param {object} updates - Fields to update
   * @returns {Promise<object>} Updated link
   * @throws {Error} If database operation fails
   */
  async updateLink(linkId, updates) {
    if (!linkId) throw new Error('Link ID required')

    const { data, error } = await supabase
      .from('product_links')
      .update(updates)
      .eq('id', linkId)
      .select()

    if (error) throw new Error(error.message)
    if (!data || data.length === 0) throw new Error('Link not found')
    return data[0]
  },

  /**
   * Delete a product link
   * @param {string} linkId - Link ID
   * @throws {Error} If database operation fails
   */
  async deleteLink(linkId) {
    if (!linkId) throw new Error('Link ID required')

    const { error } = await supabase
      .from('product_links')
      .delete()
      .eq('id', linkId)

    if (error) throw new Error(error.message)
  }
}
