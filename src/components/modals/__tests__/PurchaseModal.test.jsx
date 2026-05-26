import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PurchaseModal from '../PurchaseModal'

describe('PurchaseModal', () => {
  const mockCallbacks = {
    onClose: vi.fn(),
    onConfirm: vi.fn()
  }

  beforeEach(() => {
    mockCallbacks.onClose.mockClear()
    mockCallbacks.onConfirm.mockClear()
  })

  it('renders when isOpen is true', () => {
    render(
      <PurchaseModal isOpen={true} productName="Bohrschrauber" {...mockCallbacks} />
    )
    expect(screen.getByText('Kauf bestätigen')).toBeDefined()
    expect(screen.getByText(/Ist "Bohrschrauber" gekauft/)).toBeDefined()
  })

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <PurchaseModal isOpen={false} {...mockCallbacks} />
    )
    expect(container.querySelector('.modal-overlay')).toBeNull()
  })

  it('renders close button with X', () => {
    render(
      <PurchaseModal isOpen={true} {...mockCallbacks} />
    )
    expect(screen.getByText('✕')).toBeDefined()
  })

  it('closes modal when close button clicked', () => {
    render(
      <PurchaseModal isOpen={true} {...mockCallbacks} />
    )
    const closeBtn = screen.getByText('✕')
    fireEvent.click(closeBtn)
    expect(mockCallbacks.onClose).toHaveBeenCalled()
  })

  it('closes modal when overlay clicked', () => {
    const { container } = render(
      <PurchaseModal isOpen={true} {...mockCallbacks} />
    )
    const overlay = container.querySelector('.modal-overlay')
    fireEvent.click(overlay)
    expect(mockCallbacks.onClose).toHaveBeenCalled()
  })

  it('does not close when modal content clicked', () => {
    const { container } = render(
      <PurchaseModal isOpen={true} {...mockCallbacks} />
    )
    const modalContainer = container.querySelector('.modal-container')
    fireEvent.click(modalContainer)
    expect(mockCallbacks.onClose).not.toHaveBeenCalled()
  })

  it('allows entering purchase notes', () => {
    render(
      <PurchaseModal isOpen={true} {...mockCallbacks} />
    )
    const notesInput = screen.getByPlaceholderText(/Rechnungsnummer/)
    fireEvent.change(notesInput, { target: { value: 'Rechnungsnummer: 123456' } })
    expect(notesInput.value).toBe('Rechnungsnummer: 123456')
  })

  it('calls onConfirm when confirm button clicked', () => {
    render(
      <PurchaseModal isOpen={true} {...mockCallbacks} />
    )
    const confirmBtn = screen.getByText('Ja, gekauft')
    fireEvent.click(confirmBtn)
    expect(mockCallbacks.onConfirm).toHaveBeenCalled()
  })

  it('passes notes in onConfirm callback', () => {
    render(
      <PurchaseModal isOpen={true} {...mockCallbacks} />
    )
    const notesInput = screen.getByPlaceholderText(/Rechnungsnummer/)
    fireEvent.change(notesInput, { target: { value: 'Invoice #123' } })

    const confirmBtn = screen.getByText('Ja, gekauft')
    fireEvent.click(confirmBtn)

    expect(mockCallbacks.onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        notes: 'Invoice #123'
      })
    )
  })

  it('trims notes before passing to callback', () => {
    render(
      <PurchaseModal isOpen={true} {...mockCallbacks} />
    )
    const notesInput = screen.getByPlaceholderText(/Rechnungsnummer/)
    fireEvent.change(notesInput, { target: { value: '  Invoice #123  ' } })

    const confirmBtn = screen.getByText('Ja, gekauft')
    fireEvent.click(confirmBtn)

    expect(mockCallbacks.onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        notes: 'Invoice #123'
      })
    )
  })

  it('calls onClose when cancel button clicked', () => {
    render(
      <PurchaseModal isOpen={true} {...mockCallbacks} />
    )
    const cancelBtn = screen.getByText('Abbrechen')
    fireEvent.click(cancelBtn)
    expect(mockCallbacks.onClose).toHaveBeenCalled()
  })

  it('disables buttons when isLoading is true', () => {
    render(
      <PurchaseModal isOpen={true} isLoading={true} {...mockCallbacks} />
    )
    const confirmBtn = screen.getByText('Wird verarbeitet...')
    const cancelBtn = screen.getByText('Abbrechen')
    expect(confirmBtn.disabled).toBe(true)
    expect(cancelBtn.disabled).toBe(true)
  })

  it('disables textarea when isLoading is true', () => {
    render(
      <PurchaseModal isOpen={true} isLoading={true} {...mockCallbacks} />
    )
    const notesInput = screen.getByPlaceholderText(/Rechnungsnummer/)
    expect(notesInput.disabled).toBe(true)
  })

  it('renders notes textarea', () => {
    render(
      <PurchaseModal isOpen={true} {...mockCallbacks} />
    )
    const notesInput = screen.getByPlaceholderText(/Rechnungsnummer/)
    expect(notesInput).toBeDefined()
    expect(notesInput.rows).toBe(3)
  })

  it('shows loading text instead of confirm button text when loading', () => {
    const { rerender } = render(
      <PurchaseModal isOpen={true} isLoading={false} {...mockCallbacks} />
    )
    expect(screen.getByText('Ja, gekauft')).toBeDefined()

    rerender(
      <PurchaseModal isOpen={true} isLoading={true} {...mockCallbacks} />
    )
    expect(screen.getByText('Wird verarbeitet...')).toBeDefined()
  })
})
