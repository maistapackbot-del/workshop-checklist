import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AddItemModal from '../AddItemModal'

describe('AddItemModal', () => {
  const mockParentItems = [
    { id: '1', name: 'Elektrowerkzeuge' },
    { id: '2', name: 'Befestigungsmaterial' }
  ]

  const mockCallbacks = {
    onClose: vi.fn(),
    onAddItem: vi.fn()
  }

  beforeEach(() => {
    mockCallbacks.onClose.mockClear()
    mockCallbacks.onAddItem.mockClear()
  })

  it('renders when isOpen is true', () => {
    render(
      <AddItemModal isOpen={true} {...mockCallbacks} />
    )
    expect(screen.getByText('Neues Element hinzufügen')).toBeDefined()
    expect(screen.getByPlaceholderText(/Elektrowerkzeuge/)).toBeDefined()
  })

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <AddItemModal isOpen={false} {...mockCallbacks} />
    )
    expect(container.querySelector('.modal-overlay')).toBeNull()
  })

  it('renders close button', () => {
    render(
      <AddItemModal isOpen={true} {...mockCallbacks} />
    )
    expect(screen.getByText('✕')).toBeDefined()
  })

  it('closes modal when close button clicked', () => {
    render(
      <AddItemModal isOpen={true} {...mockCallbacks} />
    )
    const closeBtn = screen.getByText('✕')
    fireEvent.click(closeBtn)
    expect(mockCallbacks.onClose).toHaveBeenCalled()
  })

  it('closes modal when overlay clicked', () => {
    const { container } = render(
      <AddItemModal isOpen={true} {...mockCallbacks} />
    )
    const overlay = container.querySelector('.modal-overlay')
    fireEvent.click(overlay)
    expect(mockCallbacks.onClose).toHaveBeenCalled()
  })

  it('updates name input', () => {
    render(
      <AddItemModal isOpen={true} {...mockCallbacks} />
    )
    const nameInput = screen.getByPlaceholderText(/Elektrowerkzeuge/)
    fireEvent.change(nameInput, { target: { value: 'Neue Kategorie' } })
    expect(nameInput.value).toBe('Neue Kategorie')
  })

  it('renders type buttons (hauptpunkt, kategorie, produkt)', () => {
    render(
      <AddItemModal isOpen={true} {...mockCallbacks} />
    )
    expect(screen.getByText('Hauptpunkt')).toBeDefined()
    expect(screen.getByText('Kategorie')).toBeDefined()
    expect(screen.getByText('Produkt')).toBeDefined()
  })

  it('defaults to produkttype', () => {
    render(
      <AddItemModal isOpen={true} {...mockCallbacks} />
    )
    const produktBtn = screen.getByText('Produkt')
    expect(produktBtn.className).toContain('active')
  })

  it('changes type when type button clicked', () => {
    render(
      <AddItemModal isOpen={true} {...mockCallbacks} />
    )
    const hauptpunktBtn = screen.getByText('Hauptpunkt')
    fireEvent.click(hauptpunktBtn)
    expect(hauptpunktBtn.className).toContain('active')
  })

  it('shows parent select for kategorie and produkt', () => {
    render(
      <AddItemModal isOpen={true} parentItems={mockParentItems} {...mockCallbacks} />
    )
    expect(screen.getByLabelText('Übergeordnetes Element:')).toBeDefined()
  })

  it('hides parent select for hauptpunkt', () => {
    const { rerender } = render(
      <AddItemModal isOpen={true} parentItems={mockParentItems} {...mockCallbacks} />
    )
    let parentSelect = screen.queryByLabelText('Übergeordnetes Element:')
    expect(parentSelect).toBeDefined()

    // Change to hauptpunkt
    const hauptpunktBtn = screen.getByText('Hauptpunkt')
    fireEvent.click(hauptpunktBtn)

    rerender(
      <AddItemModal isOpen={true} parentItems={mockParentItems} {...mockCallbacks} />
    )
    parentSelect = screen.queryByLabelText('Übergeordnetes Element:')
    expect(parentSelect).toBeNull()
  })

  it('populates parent select with parent items', () => {
    render(
      <AddItemModal isOpen={true} parentItems={mockParentItems} {...mockCallbacks} />
    )
    const parentSelect = screen.getByDisplayValue('-- Wählen Sie ein Element --')
    const options = parentSelect.querySelectorAll('option')
    expect(options[1].textContent).toBe('Elektrowerkzeuge')
    expect(options[2].textContent).toBe('Befestigungsmaterial')
  })

  it('shows error when name is empty', () => {
    render(
      <AddItemModal isOpen={true} {...mockCallbacks} />
    )
    const addBtn = screen.getByText('Hinzufügen')
    fireEvent.click(addBtn)
    expect(screen.getByText('Name erforderlich')).toBeDefined()
  })

  it('shows error when name is too short', () => {
    render(
      <AddItemModal isOpen={true} {...mockCallbacks} />
    )
    const nameInput = screen.getByPlaceholderText(/Elektrowerkzeuge/)
    fireEvent.change(nameInput, { target: { value: 'a' } })

    const addBtn = screen.getByText('Hinzufügen')
    fireEvent.click(addBtn)
    expect(screen.getByText('Name muss mindestens 2 Zeichen lang sein')).toBeDefined()
  })

  it('shows error when parent not selected for kategorie', () => {
    render(
      <AddItemModal isOpen={true} parentItems={mockParentItems} {...mockCallbacks} />
    )
    const nameInput = screen.getByPlaceholderText(/Elektrowerkzeuge/)
    fireEvent.change(nameInput, { target: { value: 'Neue Unterkategorie' } })

    const addBtn = screen.getByText('Hinzufügen')
    fireEvent.click(addBtn)
    expect(screen.getByText('Bitte wählen Sie ein übergeordnetes Element')).toBeDefined()
  })

  it('calls onAddItem with hauptpunkt type', () => {
    render(
      <AddItemModal isOpen={true} {...mockCallbacks} />
    )
    const nameInput = screen.getByPlaceholderText(/Elektrowerkzeuge/)
    fireEvent.change(nameInput, { target: { value: 'Mein Hauptpunkt' } })

    const hauptpunktBtn = screen.getByText('Hauptpunkt')
    fireEvent.click(hauptpunktBtn)

    const addBtn = screen.getByText('Hinzufügen')
    fireEvent.click(addBtn)

    expect(mockCallbacks.onAddItem).toHaveBeenCalledWith({
      name: 'Mein Hauptpunkt',
      type: 'hauptpunkt',
      parentId: null
    })
  })

  it('calls onAddItem with kategorie and parent', () => {
    render(
      <AddItemModal isOpen={true} parentItems={mockParentItems} {...mockCallbacks} />
    )
    const nameInput = screen.getByPlaceholderText(/Elektrowerkzeuge/)
    fireEvent.change(nameInput, { target: { value: 'Neue Kategorie' } })

    const kategorieBtn = screen.getByText('Kategorie')
    fireEvent.click(kategorieBtn)

    const parentSelect = screen.getByDisplayValue('-- Wählen Sie ein Element --')
    fireEvent.change(parentSelect, { target: { value: '1' } })

    const addBtn = screen.getByText('Hinzufügen')
    fireEvent.click(addBtn)

    expect(mockCallbacks.onAddItem).toHaveBeenCalledWith({
      name: 'Neue Kategorie',
      type: 'kategorie',
      parentId: '1'
    })
  })

  it('calls onAddItem with produkt type', () => {
    render(
      <AddItemModal isOpen={true} parentItems={mockParentItems} {...mockCallbacks} />
    )
    const nameInput = screen.getByPlaceholderText(/Elektrowerkzeuge/)
    fireEvent.change(nameInput, { target: { value: 'Bohrschrauber' } })

    const parentSelect = screen.getByDisplayValue('-- Wählen Sie ein Element --')
    fireEvent.change(parentSelect, { target: { value: '2' } })

    const addBtn = screen.getByText('Hinzufügen')
    fireEvent.click(addBtn)

    expect(mockCallbacks.onAddItem).toHaveBeenCalledWith({
      name: 'Bohrschrauber',
      type: 'produkt',
      parentId: '2'
    })
  })

  it('trims name before calling onAddItem', () => {
    render(
      <AddItemModal isOpen={true} {...mockCallbacks} />
    )
    const nameInput = screen.getByPlaceholderText(/Elektrowerkzeuge/)
    fireEvent.change(nameInput, { target: { value: '  Mein Hauptpunkt  ' } })

    const hauptpunktBtn = screen.getByText('Hauptpunkt')
    fireEvent.click(hauptpunktBtn)

    const addBtn = screen.getByText('Hinzufügen')
    fireEvent.click(addBtn)

    expect(mockCallbacks.onAddItem).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Mein Hauptpunkt'
      })
    )
  })

  it('clears parent selection when changing type', () => {
    render(
      <AddItemModal isOpen={true} parentItems={mockParentItems} {...mockCallbacks} />
    )
    const parentSelect = screen.getByDisplayValue('-- Wählen Sie ein Element --')
    fireEvent.change(parentSelect, { target: { value: '1' } })
    expect(parentSelect.value).toBe('1')

    const hauptpunktBtn = screen.getByText('Hauptpunkt')
    fireEvent.click(hauptpunktBtn)

    // After type change, parent select should be hidden, so we can't verify the value change
    // But we can verify the parent ID is cleared in the onAddItem call
    const nameInput = screen.getByPlaceholderText(/Elektrowerkzeuge/)
    fireEvent.change(nameInput, { target: { value: 'Neuer Hauptpunkt' } })

    const addBtn = screen.getByText('Hinzufügen')
    fireEvent.click(addBtn)

    expect(mockCallbacks.onAddItem).toHaveBeenCalledWith(
      expect.objectContaining({
        parentId: null
      })
    )
  })

  it('disables inputs when loading', () => {
    render(
      <AddItemModal isOpen={true} isLoading={true} {...mockCallbacks} />
    )
    const nameInput = screen.getByPlaceholderText(/Elektrowerkzeuge/)
    expect(nameInput.disabled).toBe(true)
  })

  it('disables type buttons when loading', () => {
    render(
      <AddItemModal isOpen={true} isLoading={true} {...mockCallbacks} />
    )
    const hauptpunktBtn = screen.getByText('Hauptpunkt')
    expect(hauptpunktBtn.disabled).toBe(true)
  })

  it('calls onClose when cancel button clicked', () => {
    render(
      <AddItemModal isOpen={true} {...mockCallbacks} />
    )
    const cancelBtn = screen.getByText('Abbrechen')
    fireEvent.click(cancelBtn)
    expect(mockCallbacks.onClose).toHaveBeenCalled()
  })
})
