import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CategoryTabs from '../CategoryTabs'

describe('CategoryTabs', () => {
  const mockCategories = [
    { id: 'cat1', name: 'Werkzeuge', type: 'category' },
    { id: 'cat2', name: 'Elektrowerkzeuge', type: 'category' },
    { id: 'cat3', name: 'Zubehör', type: 'category' }
  ]

  const mockCallbacks = {
    onSelectCategory: vi.fn(),
    onAddCategory: vi.fn()
  }

  it('renders category tabs', () => {
    render(
      <CategoryTabs
        categories={mockCategories}
        activeCategory={null}
        {...mockCallbacks}
      />
    )
    expect(screen.getByText(/Werkzeuge/)).toBeInTheDocument()
    expect(screen.getByText(/Elektrowerkzeuge/)).toBeInTheDocument()
    expect(screen.getByText(/Zubehör/)).toBeInTheDocument()
  })

  it('highlights active category with active class', () => {
    const { container } = render(
      <CategoryTabs
        categories={mockCategories}
        activeCategory={mockCategories[0]}
        {...mockCallbacks}
      />
    )
    const tabs = container.querySelectorAll('.tab')
    expect(tabs[0]).toHaveClass('active')
    expect(tabs[1]).not.toHaveClass('active')
  })

  it('calls onSelectCategory when tab clicked', () => {
    const onSelectCategory = vi.fn()
    render(
      <CategoryTabs
        categories={mockCategories}
        activeCategory={null}
        onSelectCategory={onSelectCategory}
        onAddCategory={vi.fn()}
      />
    )
    const firstTab = screen.getByText(/Werkzeuge/)
    fireEvent.click(firstTab)
    expect(onSelectCategory).toHaveBeenCalledWith(mockCategories[0])
  })

  it('renders add category button', () => {
    render(
      <CategoryTabs
        categories={mockCategories}
        activeCategory={null}
        {...mockCallbacks}
      />
    )
    expect(screen.getByText('+ Kategorie')).toBeInTheDocument()
  })

  it('calls onAddCategory when add button clicked', () => {
    const onAddCategory = vi.fn()
    render(
      <CategoryTabs
        categories={mockCategories}
        activeCategory={null}
        onSelectCategory={vi.fn()}
        onAddCategory={onAddCategory}
      />
    )
    const addBtn = screen.getByText('+ Kategorie')
    fireEvent.click(addBtn)
    expect(onAddCategory).toHaveBeenCalled()
  })

  it('shows emoji indicator for each tab', () => {
    const { container } = render(
      <CategoryTabs
        categories={mockCategories}
        activeCategory={null}
        {...mockCallbacks}
      />
    )
    const tabs = container.querySelectorAll('.tab')
    tabs.forEach(tab => {
      expect(tab.textContent).toContain('📌')
    })
  })

  it('handles empty categories array', () => {
    const { container } = render(
      <CategoryTabs
        categories={[]}
        activeCategory={null}
        {...mockCallbacks}
      />
    )
    const tabsList = container.querySelector('.tabs-list')
    expect(tabsList).toBeInTheDocument()
    expect(tabsList.children.length).toBe(0)
  })

  it('handles undefined categories gracefully', () => {
    const { container } = render(
      <CategoryTabs
        categories={undefined}
        activeCategory={null}
        {...mockCallbacks}
      />
    )
    // Component should still render without crashing - shows error div
    expect(container.querySelector('.category-tabs')).toBeInTheDocument()
  })

  it('handles null activeCategory', () => {
    const { container } = render(
      <CategoryTabs
        categories={mockCategories}
        activeCategory={null}
        {...mockCallbacks}
      />
    )
    const tabs = container.querySelectorAll('.tab')
    tabs.forEach(tab => {
      expect(tab).not.toHaveClass('active')
    })
  })

  it('renders all tabs even with long names', () => {
    const longCategories = [
      { id: '1', name: 'Sehr lange Kategoriename die gekürzt werden sollte' },
      { id: '2', name: 'Noch eine sehr lange Kategoriebezeichnung' }
    ]
    render(
      <CategoryTabs
        categories={longCategories}
        activeCategory={null}
        {...mockCallbacks}
      />
    )
    expect(screen.getByTitle('Sehr lange Kategoriename die gekürzt werden sollte')).toBeInTheDocument()
  })

  it('displays correct number of tabs matching categories', () => {
    const { container } = render(
      <CategoryTabs
        categories={mockCategories}
        activeCategory={null}
        {...mockCallbacks}
      />
    )
    const tabs = container.querySelectorAll('.tab')
    expect(tabs.length).toBe(mockCategories.length)
  })
})
