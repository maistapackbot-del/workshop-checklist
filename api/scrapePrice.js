import cheerio from 'cheerio'

/**
 * API endpoint to extract price from product URLs
 * Handles multiple e-commerce platforms with intelligent selectors
 */
export default async function handler(req, res) {
  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { url } = req.body

  if (!url) {
    return res.status(400).json({ error: 'URL required' })
  }

  try {
    const price = await extractPrice(url)
    return res.status(200).json({ price, url })
  } catch (error) {
    console.error('Price extraction failed:', error.message)
    return res.status(200).json({ price: null, error: error.message })
  }
}

/**
 * Extract price from product URL
 * @param {string} url - Product URL
 * @returns {Promise<number|null>} Price or null if not found
 */
async function extractPrice(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    timeout: 10000
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`)
  }

  const html = await response.text()
  const $ = cheerio.load(html)

  // Common price selectors for various e-commerce sites
  const priceSelectors = [
    // Amazon
    'span.a-price-whole',
    'span[data-a-color="price"]',
    '.a-price-whole',
    // Generic e-commerce
    '[data-price]',
    '.price',
    '.product-price',
    '.item-price',
    '[itemprop="price"]',
    '.current-price',
    '.sale-price',
    // Schema.org JSON-LD
    'script[type="application/ld+json"]'
  ]

  // Try each selector
  for (const selector of priceSelectors) {
    if (selector === 'script[type="application/ld+json"]') {
      const price = extractFromJsonLd($)
      if (price) return price
    } else {
      const element = $(selector)
      if (element.length > 0) {
        const text = element.first().text()
        const price = parsePrice(text)
        if (price !== null) return price
      }
    }
  }

  // Try to extract from any text containing price pattern
  const bodyText = $.text()
  const priceMatch = bodyText.match(/€[\s]?([\d.,]+)|(\d{1,5}[.,]\d{2})\s*€/g)
  if (priceMatch && priceMatch.length > 0) {
    const price = parsePrice(priceMatch[0])
    if (price !== null) return price
  }

  return null
}

/**
 * Extract price from JSON-LD structured data
 */
function extractFromJsonLd($) {
  const scripts = $('script[type="application/ld+json"]')

  for (const script of scripts) {
    try {
      const data = JSON.parse($(script).html())

      // Handle Product schema
      if (data['@type'] === 'Product' && data.offers) {
        const offers = Array.isArray(data.offers) ? data.offers[0] : data.offers
        if (offers.price) {
          return parseFloat(offers.price)
        }
      }

      // Handle nested products
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item['@type'] === 'Product' && item.offers?.price) {
            return parseFloat(item.offers.price)
          }
        }
      }
    } catch (e) {
      // Invalid JSON, continue
    }
  }

  return null
}

/**
 * Parse price from text string
 * Handles: €19.99, 19,99€, $19.99, etc.
 */
function parsePrice(text) {
  if (!text) return null

  // Remove common non-price characters and normalize
  const normalized = text
    .replace(/[€$]/g, '')
    .replace(/\s/g, '')
    .match(/[\d.,]+/)

  if (!normalized) return null

  // Handle different decimal separators
  let priceStr = normalized[0]
  const hasComma = priceStr.includes(',')
  const hasDot = priceStr.includes('.')

  if (hasComma && hasDot) {
    // Format like "1.000,99" (European)
    priceStr = priceStr.replace(/\./g, '').replace(',', '.')
  } else if (hasComma && !hasDot) {
    // Could be "19,99" (European) or "1,000" (thousands)
    const parts = priceStr.split(',')
    if (parts[1] && parts[1].length === 2) {
      // Likely decimal: "19,99"
      priceStr = priceStr.replace(',', '.')
    } else {
      // Likely thousands: "1,000"
      priceStr = priceStr.replace(',', '')
    }
  }

  const price = parseFloat(priceStr)
  return !isNaN(price) && price > 0 ? parseFloat(price.toFixed(2)) : null
}
