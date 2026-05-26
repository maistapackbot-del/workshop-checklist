import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PurchaseTrackingModal from '../PurchaseTrackingModal'

describe('PurchaseTrackingModal', () => {
  const mockCallbacks = {
    onClose: vi.fn(),
    onAddTracking: vi.fn(),
    onSkip: vi.fn()
  }

  beforeEach(() => {
    mockCallbacks.onClose.mockClear()
    mockCallbacks.onAddTracking.mockClear()
    mockCallbacks.onSkip.mockClear()
  })

  it('renders when isOpen is true', () => {
    render(
      <PurchaseTrackingModal isOpen={true} {...mockCallbacks} />
    )
    expect(screen.getByText('Versand-Tracking hinzufügen')).toBeDefined()
    expect(screen.getByPlaceholderText(/tracking.carrier/)).toBeDefined()
  })

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <PurchaseTrackingModal isOpen={false} {...mockCallbacks} />
    )
    expect(container.querySelector('.modal-overlay')).toBeNull()
  })

  it('renders close button', () => {
    render(
      <PurchaseTrackingModal isOpen={true} {...mockCallbacks} />
    )
    expect(screen.getByText('✕')).toBeDefined()
  })

  it('closes modal when close button clicked', () => {
    render(
      <PurchaseTrackingModal isOpen={true} {...mockCallbacks} />
    )
    const closeBtn = screen.getByText('✕')
    fireEvent.click(closeBtn)
    expect(mockCallbacks.onClose).toHaveBeenCalled()
  })

  it('closes modal when overlay clicked', () => {
    const { container } = render(
      <PurchaseTrackingModal isOpen={true} {...mockCallbacks} />
    )
    const overlay = container.querySelector('.modal-overlay')
    fireEvent.click(overlay)
    expect(mockCallbacks.onClose).toHaveBeenCalled()
  })

  it('updates tracking URL input', () => {
    render(
      <PurchaseTrackingModal isOpen={true} {...mockCallbacks} />
    )
    const urlInput = screen.getByPlaceholderText(/tracking.carrier/)
    fireEvent.change(urlInput, { target: { value: 'https://tracking.dhl.de/123456' } })
    expect(urlInput.value).toBe('https://tracking.dhl.de/123456')
  })

  it('updates carrier selection', () => {
    render(
      <PurchaseTrackingModal isOpen={true} {...mockCallbacks} />
    )
    const carrierSelect = screen.getByDisplayValue('DHL')
    fireEvent.change(carrierSelect, { target: { value: 'ups' } })
    expect(carrierSelect.value).toBe('ups')
  })

  it('renders carrier dropdown with options', () => {
    render(
      <PurchaseTrackingModal isOpen={true} {...mockCallbacks} />
    )
    const carrierSelect = screen.getByLabelText('Versandunternehmen:')
    expect(carrierSelect).toBeDefined()

    const options = carrierSelect.querySelectorAll('option')
    expect(options.length).toBeGreaterThan(1)
  })

  it('shows error when tracking URL is empty', () => {
    render(
      <PurchaseTrackingModal isOpen={true} {...mockCallbacks} />
    )
    const addBtn = screen.getByText('Tracking hinzufügen')
    fireEvent.click(addBtn)
    expect(screen.queryByText('Tracking-URL erforderlich')).toBeDefined()
  })

  it('shows error for invalid URL', () => {
    render(
      <PurchaseTrackingModal isOpen={true} {...mockCallbacks} />
    )
    const urlInput = screen.getByPlaceholderText(/tracking.carrier/)
    fireEvent.change(urlInput, { target: { value: 'not-a-valid-url' } })

    const addBtn = screen.getByText('Tracking hinzufügen')
    fireEvent.click(addBtn)
    expect(screen.queryByText('Gültige URL erforderlich')).toBeDefined()
  })

  it('disables tracking button when URL is empty', () => {
    render(
      <PurchaseTrackingModal isOpen={true} {...mockCallbacks} />
    )
    const addBtn = screen.getByText('Tracking hinzufügen')
    expect(addBtn.disabled).toBe(true)
  })

  it('enables tracking button when URL is provided', () => {
    render(
      <PurchaseTrackingModal isOpen={true} {...mockCallbacks} />
    )
    const urlInput = screen.getByPlaceholderText(/tracking.carrier/)
    fireEvent.change(urlInput, { target: { value: 'https://tracking.dhl.de/123456' } })

    const addBtn = screen.getByText('Tracking hinzufügen')
    expect(addBtn.disabled).toBe(false)
  })

  it('calls onAddTracking with URL and carrier', () => {
    render(
      <PurchaseTrackingModal isOpen={true} {...mockCallbacks} />
    )
    const urlInput = screen.getByPlaceholderText(/tracking.carrier/)
    fireEvent.change(urlInput, { target: { value: 'https://tracking.dhl.de/123456' } })

    const carrierSelect = screen.getByDisplayValue('DHL')
    fireEvent.change(carrierSelect, { target: { value: 'ups' } })

    const addBtn = screen.getByText('Tracking hinzufügen')
    fireEvent.click(addBtn)

    expect(mockCallbacks.onAddTracking).toHaveBeenCalledWith({
      trackingUrl: 'https://tracking.dhl.de/123456',
      carrier: 'ups'
    })
  })

  it('calls onSkip when skip button clicked', () => {
    render(
      <PurchaseTrackingModal isOpen={true} {...mockCallbacks} />
    )
    const skipBtn = screen.getByText('Überspringen')
    fireEvent.click(skipBtn)
    expect(mockCallbacks.onSkip).toHaveBeenCalled()
  })

  it('calls onClose when cancel button clicked', () => {
    render(
      <PurchaseTrackingModal isOpen={true} {...mockCallbacks} />
    )
    const cancelBtn = screen.getAllByText('Abbrechen')[0]
    fireEvent.click(cancelBtn)
    expect(mockCallbacks.onClose).toHaveBeenCalled()
  })

  it('disables all buttons when loading', () => {
    render(
      <PurchaseTrackingModal isOpen={true} isLoading={true} {...mockCallbacks} />
    )
    const skipBtn = screen.getByText('Überspringen')
    const cancelBtn = screen.getAllByText('Abbrechen')[0]
    const addBtn = screen.getByText('Wird hinzugefügt...')

    expect(skipBtn.disabled).toBe(true)
    expect(cancelBtn.disabled).toBe(true)
    expect(addBtn.disabled).toBe(true)
  })

  it('disables inputs when loading', () => {
    render(
      <PurchaseTrackingModal isOpen={true} isLoading={true} {...mockCallbacks} />
    )
    const urlInput = screen.getByPlaceholderText(/tracking.carrier/)
    const carrierSelect = screen.getByLabelText('Versandunternehmen:')

    expect(urlInput.disabled).toBe(true)
    expect(carrierSelect.disabled).toBe(true)
  })

  it('clears form on successful tracking add', () => {
    const { rerender } = render(
      <PurchaseTrackingModal isOpen={true} {...mockCallbacks} />
    )
    const urlInput = screen.getByPlaceholderText(/tracking.carrier/)
    fireEvent.change(urlInput, { target: { value: 'https://tracking.dhl.de/123456' } })

    const addBtn = screen.getByText('Tracking hinzufügen')
    fireEvent.click(addBtn)

    rerender(
      <PurchaseTrackingModal isOpen={true} {...mockCallbacks} />
    )
    const newUrlInput = screen.getByPlaceholderText(/tracking.carrier/)
    expect(newUrlInput.value).toBe('')
  })

  it('renders carrier label', () => {
    render(
      <PurchaseTrackingModal isOpen={true} {...mockCallbacks} />
    )
    expect(screen.getByLabelText('Versandunternehmen:')).toBeDefined()
  })
})
