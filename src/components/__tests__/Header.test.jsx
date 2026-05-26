import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Header from '../Header'

describe('Header component', () => {
  const mockUser = {
    id: 'user123',
    email: 'test@example.com'
  }

  it('renders header with user email', () => {
    const mockOnSignOut = vi.fn()
    const mockOnTogglePurchased = vi.fn()

    render(
      <Header
        user={mockUser}
        onSignOut={mockOnSignOut}
        showPurchased={true}
        onTogglePurchased={mockOnTogglePurchased}
      />
    )

    expect(screen.getByText('Workshop Einkaufsliste')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('renders logout button', () => {
    const mockOnSignOut = vi.fn()
    const mockOnTogglePurchased = vi.fn()

    render(
      <Header
        user={mockUser}
        onSignOut={mockOnSignOut}
        showPurchased={true}
        onTogglePurchased={mockOnTogglePurchased}
      />
    )

    const logoutButton = screen.getByRole('button', { name: /abmelden/i })
    expect(logoutButton).toBeInTheDocument()
  })

  it('calls onSignOut when logout button is clicked', async () => {
    const mockOnSignOut = vi.fn().mockResolvedValue(undefined)
    const mockOnTogglePurchased = vi.fn()

    render(
      <Header
        user={mockUser}
        onSignOut={mockOnSignOut}
        showPurchased={true}
        onTogglePurchased={mockOnTogglePurchased}
      />
    )

    const logoutButton = screen.getByRole('button', { name: /abmelden/i })
    fireEvent.click(logoutButton)

    expect(mockOnSignOut).toHaveBeenCalled()
  })

  it('renders purchased items toggle', () => {
    const mockOnSignOut = vi.fn()
    const mockOnTogglePurchased = vi.fn()

    render(
      <Header
        user={mockUser}
        onSignOut={mockOnSignOut}
        showPurchased={true}
        onTogglePurchased={mockOnTogglePurchased}
      />
    )

    const toggle = screen.getByRole('checkbox')
    expect(toggle).toBeInTheDocument()
    expect(toggle).toBeChecked()
  })

  it('calls onTogglePurchased when toggle is changed', () => {
    const mockOnSignOut = vi.fn()
    const mockOnTogglePurchased = vi.fn()

    render(
      <Header
        user={mockUser}
        onSignOut={mockOnSignOut}
        showPurchased={true}
        onTogglePurchased={mockOnTogglePurchased}
      />
    )

    const toggle = screen.getByRole('checkbox')
    fireEvent.click(toggle)

    expect(mockOnTogglePurchased).toHaveBeenCalledWith(false)
  })

  it('reflects showPurchased prop in checkbox', () => {
    const mockOnSignOut = vi.fn()
    const mockOnTogglePurchased = vi.fn()

    const { rerender } = render(
      <Header
        user={mockUser}
        onSignOut={mockOnSignOut}
        showPurchased={true}
        onTogglePurchased={mockOnTogglePurchased}
      />
    )

    let toggle = screen.getByRole('checkbox')
    expect(toggle).toBeChecked()

    rerender(
      <Header
        user={mockUser}
        onSignOut={mockOnSignOut}
        showPurchased={false}
        onTogglePurchased={mockOnTogglePurchased}
      />
    )

    toggle = screen.getByRole('checkbox')
    expect(toggle).not.toBeChecked()
  })

  it('handles missing user gracefully', () => {
    const mockOnTogglePurchased = vi.fn()

    render(
      <Header
        user={null}
        onSignOut={undefined}
        showPurchased={true}
        onTogglePurchased={mockOnTogglePurchased}
      />
    )

    expect(screen.getByText('Workshop Einkaufsliste')).toBeInTheDocument()
    // Logout button should not be rendered
    expect(screen.queryByRole('button', { name: /abmelden/i })).not.toBeInTheDocument()
  })
})
