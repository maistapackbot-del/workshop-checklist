import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProductCard from '../ProductCard'

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'DeWalt Bohrschrauber',
    description: 'Kabellos, 18V',
    purchased_at: null,
    order_index: 0
  }

  const mockLinks = [
    {
      id: 'link1',
      url: 'https://amazon.de/product',
      title: 'DeWalt 18V Bohrschrauber',
      price: 89.99,
      platform: 'Amazon',
      image_url: 'https://example.com/image.jpg'
    }
  ]

  const mockCallbacks = {
    onAddLink: vi.fn(),
    onPurchase: vi.fn(),
    onRemove: vi.fn()
  }

  it('renders product name', () => {
    render(
      <ProductCard product={mockProduct} {...mockCallbacks} />
    )
    expect(screen.getByText('DeWalt Bohrschrauber')).toBeDefined()
  })

  it('displays purchased status', () => {
    const purchasedProduct = { ...mockProduct, purchased_at: '2026-05-26T10:00:00Z' }
    const { container } = render(
      <ProductCard product={purchasedProduct} {...mockCallbacks} />
    )
    expect(container.querySelector('.product-card.purchased')).toBeDefined()
  })

  it('shows unpurchased checkbox', () => {
    render(
      <ProductCard product={mockProduct} {...mockCallbacks} />
    )
    expect(screen.getByText('○')).toBeDefined()
  })

  it('shows purchased checkmark', () => {
    const purchasedProduct = { ...mockProduct, purchased_at: '2026-05-26T10:00:00Z' }
    render(
      <ProductCard product={purchasedProduct} {...mockCallbacks} />
    )
    expect(screen.getByText('✓')).toBeDefined()
  })

  it('calls onPurchase when purchase button clicked', () => {
    render(
      <ProductCard product={mockProduct} links={mockLinks} {...mockCallbacks} />
    )
    const purchaseButton = screen.getByText(/Kaufen|Gekauft/)
    fireEvent.click(purchaseButton)
    expect(mockCallbacks.onPurchase).toHaveBeenCalledWith('1')
  })

  it('calls onRemove when delete button clicked', () => {
    render(
      <ProductCard product={mockProduct} links={mockLinks} {...mockCallbacks} />
    )
    const deleteButton = screen.getByText('✕')
    fireEvent.click(deleteButton)
    expect(mockCallbacks.onRemove).toHaveBeenCalledWith('1')
  })

  it('displays product links when expanded', () => {
    render(
      <ProductCard product={mockProduct} links={mockLinks} {...mockCallbacks} />
    )
    const header = screen.getByText('DeWalt Bohrschrauber').closest('.product-name-section')
    fireEvent.click(header)

    expect(screen.getByText('DeWalt 18V Bohrschrauber')).toBeDefined()
    expect(screen.getByText('Amazon')).toBeDefined()
  })

  it('calls onAddLink when add link button clicked', () => {
    render(
      <ProductCard product={mockProduct} links={mockLinks} {...mockCallbacks} />
    )
    const header = screen.getByText('DeWalt Bohrschrauber').closest('.product-name-section')
    fireEvent.click(header)

    const addLinkButton = screen.getByText('+ Link hinzufügen')
    fireEvent.click(addLinkButton)
    expect(mockCallbacks.onAddLink).toHaveBeenCalledWith('1')
  })

  it('shows "Noch keine Links" when no links', () => {
    render(
      <ProductCard product={mockProduct} links={[]} {...mockCallbacks} />
    )
    const header = screen.getByText('DeWalt Bohrschrauber').closest('.product-name-section')
    fireEvent.click(header)

    expect(screen.getByText('Noch keine Links hinzugefügt')).toBeDefined()
  })

  it('displays product description', () => {
    render(
      <ProductCard product={mockProduct} {...mockCallbacks} />
    )
    expect(screen.getByText('Kabellos, 18V')).toBeDefined()
  })

  it('toggles expanded state on name click', () => {
    const { container } = render(
      <ProductCard product={mockProduct} links={mockLinks} {...mockCallbacks} />
    )

    const nameSection = screen.getByText('DeWalt Bohrschrauber').closest('.product-name-section')
    expect(container.querySelector('.product-links-section')).toBeNull()

    fireEvent.click(nameSection)
    expect(container.querySelector('.product-links-section')).toBeDefined()
  })
})
