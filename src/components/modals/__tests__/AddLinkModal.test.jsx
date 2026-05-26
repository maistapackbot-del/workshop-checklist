import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AddLinkModal from '../AddLinkModal'

describe('AddLinkModal', () => {
  const mockCallbacks = {
    onClose: vi.fn(),
    onAddLink: vi.fn()
  }

  beforeEach(() => {
    mockCallbacks.onClose.mockClear()
    mockCallbacks.onAddLink.mockClear()
  })

  beforeEach(() => {
    mockCallbacks.onClose.mockClear()
    mockCallbacks.onAddLink.mockClear()
  })

  it('renders when isOpen is true', () => {
    render(
      <AddLinkModal isOpen={true} {...mockCallbacks} />
    )
    expect(screen.getByText('Link hinzufügen')).toBeDefined()
    expect(screen.getByPlaceholderText('https://example.com/product')).toBeDefined()
  })

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <AddLinkModal isOpen={false} {...mockCallbacks} />
    )
    expect(container.querySelector('.modal-overlay')).toBeNull()
  })

  it('closes modal when close button clicked', () => {
    render(
      <AddLinkModal isOpen={true} {...mockCallbacks} />
    )
    const closeBtn = screen.getByText('✕')
    fireEvent.click(closeBtn)
    expect(mockCallbacks.onClose).toHaveBeenCalled()
  })

  it('closes modal when overlay clicked', () => {
    const { container } = render(
      <AddLinkModal isOpen={true} {...mockCallbacks} />
    )
    const overlay = container.querySelector('.modal-overlay')
    fireEvent.click(overlay)
    expect(mockCallbacks.onClose).toHaveBeenCalled()
  })

  it('stops event propagation when modal content clicked', () => {
    const { container } = render(
      <AddLinkModal isOpen={true} {...mockCallbacks} />
    )
    const modalContainer = container.querySelector('.modal-container')
    const stopPropagation = vi.fn()
    fireEvent.click(modalContainer, { stopPropagation })
    expect(mockCallbacks.onClose).not.toHaveBeenCalled()
  })

  it('updates URL input value', () => {
    render(
      <AddLinkModal isOpen={true} {...mockCallbacks} />
    )
    const urlInput = screen.getByPlaceholderText('https://example.com/product')
    fireEvent.change(urlInput, { target: { value: 'https://amazon.de/product' } })
    expect(urlInput.value).toBe('https://amazon.de/product')
  })

  it('shows error when URL is empty', () => {
    render(
      <AddLinkModal isOpen={true} {...mockCallbacks} />
    )
    const metadataBtn = screen.getByText('Metadaten laden')
    fireEvent.click(metadataBtn)
    expect(screen.queryByText('URL erforderlich')).toBeDefined()
  })

  it('shows error for invalid URL', () => {
    render(
      <AddLinkModal isOpen={true} {...mockCallbacks} />
    )
    const urlInput = screen.getByPlaceholderText('https://example.com/product')
    fireEvent.change(urlInput, { target: { value: 'not-a-valid-url' } })

    const metadataBtn = screen.getByText('Metadaten laden')
    fireEvent.click(metadataBtn)
    expect(screen.queryByText('Gültige URL erforderlich')).toBeDefined()
  })

  it('disables metadata button when URL is empty', () => {
    render(
      <AddLinkModal isOpen={true} {...mockCallbacks} />
    )
    const metadataBtn = screen.getByText('Metadaten laden')
    expect(metadataBtn.disabled).toBe(true)
  })

  it('enables metadata button when URL is provided', () => {
    render(
      <AddLinkModal isOpen={true} {...mockCallbacks} />
    )
    const urlInput = screen.getByPlaceholderText('https://example.com/product')
    fireEvent.change(urlInput, { target: { value: 'https://amazon.de/product' } })

    const metadataBtn = screen.getByText('Metadaten laden')
    expect(metadataBtn.disabled).toBe(false)
  })

  it('calls onAddLink with URL when metadata loaded', async () => {
    render(
      <AddLinkModal isOpen={true} {...mockCallbacks} />
    )
    const urlInput = screen.getByPlaceholderText('https://example.com/product')
    fireEvent.change(urlInput, { target: { value: 'https://amazon.de/product' } })

    const metadataBtn = screen.getByText('Metadaten laden')
    fireEvent.click(metadataBtn)

    await waitFor(() => {
      expect(screen.getByText('Metadaten Vorschau')).toBeDefined()
    })

    const addLinkBtn = screen.getAllByText(/Link hinzufügen|Hinzufügen/)[1]
    fireEvent.click(addLinkBtn)

    expect(mockCallbacks.onAddLink).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://amazon.de/product'
      })
    )
  })

  it('shows metadata preview after loading', async () => {
    render(
      <AddLinkModal isOpen={true} {...mockCallbacks} />
    )
    const urlInput = screen.getByPlaceholderText('https://example.com/product')
    fireEvent.change(urlInput, { target: { value: 'https://amazon.de/product' } })

    const metadataBtn = screen.getByText('Metadaten laden')
    fireEvent.click(metadataBtn)

    await waitFor(() => {
      expect(screen.getByText('Metadaten Vorschau')).toBeDefined()
    })
  })

  it('disables inputs when loading', () => {
    render(
      <AddLinkModal isOpen={true} isLoading={true} {...mockCallbacks} />
    )
    const urlInput = screen.getByPlaceholderText('https://example.com/product')
    expect(urlInput.disabled).toBe(true)
  })

  it('clears form on cancel', () => {
    render(
      <AddLinkModal isOpen={true} {...mockCallbacks} />
    )
    const urlInput = screen.getByPlaceholderText('https://example.com/product')
    fireEvent.change(urlInput, { target: { value: 'https://amazon.de/product' } })

    const cancelBtn = screen.getByText('Abbrechen')
    fireEvent.click(cancelBtn)

    expect(mockCallbacks.onClose).toHaveBeenCalled()
  })
})
