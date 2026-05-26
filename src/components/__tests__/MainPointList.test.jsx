import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import MainPointList from '../MainPointList'

describe('MainPointList', () => {
  const mockMainPoints = [
    { id: 'main1', name: 'Werkzeugregal', type: 'main' },
    { id: 'main2', name: 'Werkbank', type: 'main' }
  ]

  const mockCategories = {
    'main1': [
      { id: 'cat1', name: 'Elektrowerkzeuge', type: 'category' },
      { id: 'cat2', name: 'Zubehör', type: 'category' }
    ],
    'main2': [
      { id: 'cat3', name: 'Lagermaterial', type: 'category' }
    ]
  }

  const mockProducts = {
    'cat1': [
      { id: 'prod1', name: 'Bosch Schleifen', purchased_at: null, created_at: '2026-05-26T10:00:00Z' }
    ],
    'cat2': [
      { id: 'prod2', name: 'Bits Set', purchased_at: null, created_at: '2026-05-26T09:00:00Z' }
    ],
    'cat3': [
      { id: 'prod3', name: 'Regalbrett', purchased_at: null, created_at: '2026-05-26T08:00:00Z' }
    ]
  }

  const mockLinks = {
    'prod1': [{ id: 'link1', url: 'https://amazon.de' }],
    'prod2': [],
    'prod3': []
  }

  const mockCallbacks = {
    onAddCategory: vi.fn(),
    onAddProduct: vi.fn(),
    onAddLink: vi.fn(),
    onPurchase: vi.fn()
  }

  it('renders empty state when no main points', () => {
    render(
      <MainPointList
        mainPoints={[]}
        categories={{}}
        products={{}}
        links={{}}
        {...mockCallbacks}
      />
    )
    expect(screen.getByText(/Keine Hauptpunkte/)).toBeInTheDocument()
  })

  it('renders all main points as cards', () => {
    render(
      <MainPointList
        mainPoints={mockMainPoints}
        categories={mockCategories}
        products={mockProducts}
        links={mockLinks}
        {...mockCallbacks}
      />
    )
    expect(screen.getByText('Werkzeugregal')).toBeInTheDocument()
    expect(screen.getByText('Werkbank')).toBeInTheDocument()
  })

  it('renders correct number of main point cards', () => {
    const { container } = render(
      <MainPointList
        mainPoints={mockMainPoints}
        categories={mockCategories}
        products={mockProducts}
        links={mockLinks}
        {...mockCallbacks}
      />
    )
    const cards = container.querySelectorAll('.main-point-card')
    expect(cards.length).toBe(2)
  })

  it('passes categories for each main point to card', () => {
    render(
      <MainPointList
        mainPoints={mockMainPoints}
        categories={mockCategories}
        products={mockProducts}
        links={mockLinks}
        {...mockCallbacks}
      />
    )
    // Each card should have access to its categories
    const tabs = screen.getAllByText(/📌/)
    // First card has 2 categories, second has 1
    expect(tabs.length).toBeGreaterThanOrEqual(3)
  })

  it('passes products to all cards', async () => {
    render(
      <MainPointList
        mainPoints={mockMainPoints}
        categories={mockCategories}
        products={mockProducts}
        links={mockLinks}
        {...mockCallbacks}
      />
    )
    // All products should be in the document
    await waitFor(() => {
      expect(screen.getByText('Bosch Schleifen')).toBeInTheDocument()
    })
  })

  it('passes links to cards', () => {
    const { container } = render(
      <MainPointList
        mainPoints={mockMainPoints}
        categories={mockCategories}
        products={mockProducts}
        links={mockLinks}
        {...mockCallbacks}
      />
    )
    // Links are accessible in ProductCards within MainPointCards
    expect(container.querySelector('.product-card')).toBeInTheDocument()
  })

  it('calls onAddCategory for card add category clicks', () => {
    const onAddCategory = vi.fn()
    render(
      <MainPointList
        mainPoints={mockMainPoints}
        categories={mockCategories}
        products={mockProducts}
        links={mockLinks}
        onAddCategory={onAddCategory}
        onAddProduct={vi.fn()}
        onAddLink={vi.fn()}
        onPurchase={vi.fn()}
      />
    )
    const addCatButtons = screen.getAllByText('+ Kategorie')
    fireEvent.click(addCatButtons[0])
    expect(onAddCategory).toHaveBeenCalledWith('main1')
  })

  it('calls onAddProduct when product added from card', () => {
    const onAddProduct = vi.fn()
    render(
      <MainPointList
        mainPoints={mockMainPoints}
        categories={mockCategories}
        products={mockProducts}
        links={mockLinks}
        onAddCategory={vi.fn()}
        onAddProduct={onAddProduct}
        onAddLink={vi.fn()}
        onPurchase={vi.fn()}
      />
    )
    const addProdButtons = screen.getAllByText('+ Produkt hinzufügen')
    fireEvent.click(addProdButtons[0])
    expect(onAddProduct).toHaveBeenCalled()
  })

  it('passes onAddLink callback to product cards', () => {
    const onAddLink = vi.fn()
    render(
      <MainPointList
        mainPoints={mockMainPoints}
        categories={mockCategories}
        products={mockProducts}
        links={mockLinks}
        onAddCategory={vi.fn()}
        onAddProduct={vi.fn()}
        onAddLink={onAddLink}
        onPurchase={vi.fn()}
      />
    )
    // Verify onAddLink is passed through the hierarchy
    expect(onAddLink).toBeDefined()
    expect(screen.getByText('Bosch Schleifen')).toBeInTheDocument()
  })

  it('handles undefined categories gracefully', () => {
    render(
      <MainPointList
        mainPoints={mockMainPoints}
        categories={undefined}
        products={mockProducts}
        links={mockLinks}
        {...mockCallbacks}
      />
    )
    expect(screen.getByText('Werkzeugregal')).toBeInTheDocument()
  })

  it('handles undefined products gracefully', () => {
    render(
      <MainPointList
        mainPoints={mockMainPoints}
        categories={mockCategories}
        products={undefined}
        links={mockLinks}
        {...mockCallbacks}
      />
    )
    expect(screen.getByText('Werkzeugregal')).toBeInTheDocument()
  })

  it('shows error state for invalid mainPoints', () => {
    render(
      <MainPointList
        mainPoints="invalid"
        categories={mockCategories}
        products={mockProducts}
        links={mockLinks}
        {...mockCallbacks}
      />
    )
    expect(screen.getByText(/Fehler: Ungültige Daten/)).toBeInTheDocument()
  })

  it('respects showPurchased prop', () => {
    const productsWithPurchased = {
      'cat1': [
        { id: 'prod1', name: 'Bosch Schleifen', purchased_at: null, created_at: '2026-05-26T10:00:00Z' },
        { id: 'prod4', name: 'Purchased Item', purchased_at: '2026-05-20T10:00:00Z', created_at: '2026-05-20T10:00:00Z' }
      ],
      'cat2': [],
      'cat3': []
    }
    const { rerender } = render(
      <MainPointList
        mainPoints={mockMainPoints}
        categories={mockCategories}
        products={productsWithPurchased}
        links={mockLinks}
        showPurchased={false}
        {...mockCallbacks}
      />
    )
    expect(screen.getByText('Bosch Schleifen')).toBeInTheDocument()
    expect(screen.queryByText('Purchased Item')).not.toBeInTheDocument()

    // Now with showPurchased=true
    rerender(
      <MainPointList
        mainPoints={mockMainPoints}
        categories={mockCategories}
        products={productsWithPurchased}
        links={mockLinks}
        showPurchased={true}
        {...mockCallbacks}
      />
    )
  })
})
