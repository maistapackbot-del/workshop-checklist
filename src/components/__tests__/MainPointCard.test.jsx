import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import MainPointCard from '../MainPointCard'

describe('MainPointCard', () => {
  const mockMainPoint = {
    id: 'main1',
    name: 'Werkzeugregal',
    type: 'main'
  }

  const mockCategories = [
    { id: 'cat1', name: 'Elektrowerkzeuge', type: 'category' },
    { id: 'cat2', name: 'Bits & Zubehör', type: 'category' }
  ]

  const mockProducts = {
    'cat1': [
      { id: 'prod1', name: 'Bosch Schleifen', purchased_at: null, created_at: '2026-05-26T10:00:00Z' }
    ],
    'cat2': [
      { id: 'prod2', name: 'Bits Set', purchased_at: null, created_at: '2026-05-26T09:00:00Z' }
    ]
  }

  const mockLinks = {
    'prod1': [{ id: 'link1', url: 'https://amazon.de', title: 'Amazon' }],
    'prod2': []
  }

  const mockCallbacks = {
    onAddCategory: vi.fn(),
    onSelectCategory: vi.fn(),
    onAddProduct: vi.fn(),
    onAddLink: vi.fn(),
    onPurchase: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders main point name in header', () => {
    render(
      <MainPointCard
        mainPoint={mockMainPoint}
        categories={mockCategories}
        products={mockProducts}
        links={mockLinks}
        {...mockCallbacks}
      />
    )
    expect(screen.getByText('Werkzeugregal')).toBeInTheDocument()
  })

  it('displays total product count in header', () => {
    render(
      <MainPointCard
        mainPoint={mockMainPoint}
        categories={mockCategories}
        products={mockProducts}
        links={mockLinks}
        {...mockCallbacks}
      />
    )
    expect(screen.getByText(/↓ 2 Produkte/)).toBeInTheDocument()
  })

  it('starts expanded by default', () => {
    const { container } = render(
      <MainPointCard
        mainPoint={mockMainPoint}
        categories={mockCategories}
        products={mockProducts}
        links={mockLinks}
        {...mockCallbacks}
      />
    )
    expect(container.querySelector('.category-tabs')).toBeInTheDocument()
  })

  it('collapses when header clicked', async () => {
    const { container } = render(
      <MainPointCard
        mainPoint={mockMainPoint}
        categories={mockCategories}
        products={mockProducts}
        links={mockLinks}
        {...mockCallbacks}
      />
    )
    const header = container.querySelector('.main-point-header')
    fireEvent.click(header)
    await waitFor(() => {
      expect(container.querySelector('.category-tabs')).not.toBeInTheDocument()
    })
  })

  it('expands when collapsed header clicked', async () => {
    const { container } = render(
      <MainPointCard
        mainPoint={mockMainPoint}
        categories={mockCategories}
        products={mockProducts}
        links={mockLinks}
        {...mockCallbacks}
      />
    )
    const header = container.querySelector('.main-point-header')
    // Collapse
    fireEvent.click(header)
    // Expand
    fireEvent.click(header)
    await waitFor(() => {
      expect(container.querySelector('.category-tabs')).toBeInTheDocument()
    })
  })

  it('auto-selects first category on mount', async () => {
    render(
      <MainPointCard
        mainPoint={mockMainPoint}
        categories={mockCategories}
        products={mockProducts}
        links={mockLinks}
        {...mockCallbacks}
      />
    )
    const tabs = screen.getAllByText(/📌/)
    await waitFor(() => {
      expect(tabs[0].closest('.tab')).toHaveClass('active')
    })
  })

  it('renders category tabs', () => {
    const { container } = render(
      <MainPointCard
        mainPoint={mockMainPoint}
        categories={mockCategories}
        products={mockProducts}
        links={mockLinks}
        {...mockCallbacks}
      />
    )
    expect(container.querySelector('.category-tabs')).toBeInTheDocument()
  })

  it('renders product grid for active category', () => {
    render(
      <MainPointCard
        mainPoint={mockMainPoint}
        categories={mockCategories}
        products={mockProducts}
        links={mockLinks}
        {...mockCallbacks}
      />
    )
    expect(screen.getByText('Bosch Schleifen')).toBeInTheDocument()
  })

  it('renders add product button', () => {
    render(
      <MainPointCard
        mainPoint={mockMainPoint}
        categories={mockCategories}
        products={mockProducts}
        links={mockLinks}
        {...mockCallbacks}
      />
    )
    expect(screen.getByText('+ Produkt hinzufügen')).toBeInTheDocument()
  })

  it('calls onAddProduct when add button clicked', () => {
    const onAddProduct = vi.fn()
    render(
      <MainPointCard
        mainPoint={mockMainPoint}
        categories={mockCategories}
        products={mockProducts}
        links={mockLinks}
        onAddCategory={vi.fn()}
        onSelectCategory={vi.fn()}
        onAddProduct={onAddProduct}
        onAddLink={vi.fn()}
        onPurchase={vi.fn()}
      />
    )
    const addBtn = screen.getByText('+ Produkt hinzufügen')
    fireEvent.click(addBtn)
    expect(onAddProduct).toHaveBeenCalledWith('cat1')
  })

  it('handles empty categories', () => {
    render(
      <MainPointCard
        mainPoint={mockMainPoint}
        categories={[]}
        products={{}}
        links={{}}
        {...mockCallbacks}
      />
    )
    expect(screen.getByText(/Werkzeugregal/)).toBeInTheDocument()
  })

  it('displays expand/collapse icon correctly', () => {
    const { container, rerender } = render(
      <MainPointCard
        mainPoint={mockMainPoint}
        categories={mockCategories}
        products={mockProducts}
        links={mockLinks}
        {...mockCallbacks}
      />
    )
    const header = container.querySelector('.main-point-header')
    expect(header.textContent).toContain('▼')
    fireEvent.click(header)
    rerender(
      <MainPointCard
        mainPoint={mockMainPoint}
        categories={mockCategories}
        products={mockProducts}
        links={mockLinks}
        {...mockCallbacks}
      />
    )
  })

  it('calls onAddCategory when category add button clicked', () => {
    const onAddCategory = vi.fn()
    const { container } = render(
      <MainPointCard
        mainPoint={mockMainPoint}
        categories={mockCategories}
        products={mockProducts}
        links={mockLinks}
        onAddCategory={onAddCategory}
        onSelectCategory={vi.fn()}
        onAddProduct={vi.fn()}
        onAddLink={vi.fn()}
        onPurchase={vi.fn()}
      />
    )
    const addCatBtn = screen.getByText('+ Kategorie')
    fireEvent.click(addCatBtn)
    expect(onAddCategory).toHaveBeenCalledWith('main1')
  })
})
