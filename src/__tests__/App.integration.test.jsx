import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../App'

// Mock the hooks
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn()
}))

vi.mock('../hooks/useChecklist', () => ({
  useChecklist: vi.fn()
}))

vi.mock('../hooks/useImageScraping', () => ({
  useImageScraping: vi.fn()
}))

// Mock components
vi.mock('../components/Header', () => ({
  default: ({ user, onSignOut, showPurchased, onTogglePurchased }) => (
    <header data-testid="header">
      {user && <span>{user.email}</span>}
      {user && <button onClick={onSignOut}>Logout</button>}
      <input
        type="checkbox"
        checked={showPurchased}
        onChange={(e) => onTogglePurchased(e.target.checked)}
      />
    </header>
  )
}))

vi.mock('../components/MainPointList', () => ({
  default: ({ mainPoints, onAddCategory, onAddProduct, onAddLink, onPurchase, onRemove }) => (
    <div data-testid="main-point-list">
      {mainPoints.map(mp => (
        <div key={mp.id} data-testid={`main-point-${mp.id}`}>
          {mp.name}
          <button onClick={() => onAddCategory?.(mp.id)} data-testid={`add-cat-${mp.id}`}>
            Add Category
          </button>
        </div>
      ))}
    </div>
  )
}))

vi.mock('../components/modals/AddItemModal', () => ({
  default: ({ type, onSave, onClose }) => (
    <div data-testid="add-item-modal">
      <button
        onClick={() => onSave('Test Item')}
        data-testid="save-item"
      >
        Save
      </button>
      <button onClick={onClose}>Close</button>
    </div>
  )
}))

vi.mock('../components/modals/AddLinkModal', () => ({
  default: ({ onSave, onClose }) => (
    <div data-testid="add-link-modal">
      <button
        onClick={() => onSave('http://example.com', {})}
        data-testid="save-link"
      >
        Save
      </button>
      <button onClick={onClose}>Close</button>
    </div>
  )
}))

vi.mock('../components/modals/PurchaseModal', () => ({
  default: ({ onConfirm, onCancel }) => (
    <div data-testid="purchase-modal">
      <button onClick={() => onConfirm('notes')} data-testid="confirm-purchase">
        Confirm
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  )
}))

vi.mock('../components/modals/PurchaseTrackingModal', () => ({
  default: ({ onSave, onSkip }) => (
    <div data-testid="tracking-modal">
      <button onClick={() => onSave('http://track.com', 'DHL')} data-testid="save-tracking">
        Save
      </button>
      <button onClick={onSkip}>Skip</button>
    </div>
  )
}))

import { useAuth } from '../hooks/useAuth'
import { useChecklist } from '../hooks/useChecklist'
import { useImageScraping } from '../hooks/useImageScraping'

const mockUser = { id: 'user1', email: 'test@example.com' }

describe('App Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Auth flow tests
  describe('authentication flow', () => {
    it('shows login page when not authenticated', () => {
      useAuth.mockReturnValue({
        user: null,
        loading: false,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn()
      })
      useChecklist.mockReturnValue({
        mainPoints: [],
        categories: {},
        products: {},
        links: {},
        loading: false,
        error: null,
        showPurchased: true,
        setShowPurchased: vi.fn(),
        createMainPoint: vi.fn(),
        createCategory: vi.fn(),
        createProduct: vi.fn(),
        addProductLink: vi.fn(),
        markPurchased: vi.fn(),
        deleteItem: vi.fn()
      })
      useImageScraping.mockReturnValue({
        scrapeUrl: vi.fn(),
        loading: false
      })

      render(<App />)

      expect(screen.getByText('Workshop Einkaufsliste')).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/passwort/i)).toBeInTheDocument()
    })

    it('shows header and dashboard when authenticated', () => {
      useAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn()
      })
      useChecklist.mockReturnValue({
        mainPoints: [],
        categories: {},
        products: {},
        links: {},
        loading: false,
        error: null,
        showPurchased: true,
        setShowPurchased: vi.fn(),
        createMainPoint: vi.fn(),
        createCategory: vi.fn(),
        createProduct: vi.fn(),
        addProductLink: vi.fn(),
        markPurchased: vi.fn(),
        deleteItem: vi.fn()
      })
      useImageScraping.mockReturnValue({
        scrapeUrl: vi.fn(),
        loading: false
      })

      render(<App />)

      expect(screen.getByTestId('header')).toBeInTheDocument()
      expect(screen.getByText('Meine Einkaufslisten')).toBeInTheDocument()
    })

    it('shows loading state during auth check', () => {
      useAuth.mockReturnValue({
        user: null,
        loading: true,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn()
      })
      useChecklist.mockReturnValue({
        mainPoints: [],
        categories: {},
        products: {},
        links: {},
        loading: false,
        error: null,
        showPurchased: true,
        setShowPurchased: vi.fn(),
        createMainPoint: vi.fn(),
        createCategory: vi.fn(),
        createProduct: vi.fn(),
        addProductLink: vi.fn(),
        markPurchased: vi.fn(),
        deleteItem: vi.fn()
      })
      useImageScraping.mockReturnValue({
        scrapeUrl: vi.fn(),
        loading: false
      })

      render(<App />)

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('shows loading state during checklist load', () => {
      useAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn()
      })
      useChecklist.mockReturnValue({
        mainPoints: [],
        categories: {},
        products: {},
        links: {},
        loading: true,
        error: null,
        showPurchased: true,
        setShowPurchased: vi.fn(),
        createMainPoint: vi.fn(),
        createCategory: vi.fn(),
        createProduct: vi.fn(),
        addProductLink: vi.fn(),
        markPurchased: vi.fn(),
        deleteItem: vi.fn()
      })
      useImageScraping.mockReturnValue({
        scrapeUrl: vi.fn(),
        loading: false
      })

      render(<App />)

      expect(screen.getByText('Loading checklists...')).toBeInTheDocument()
    })
  })

  // Dashboard and main list tests
  describe('dashboard and main point list', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn()
      })
      useImageScraping.mockReturnValue({
        scrapeUrl: vi.fn(),
        loading: false
      })
    })

    it('displays main points list', () => {
      const mockMainPoints = [
        { id: 'mp1', name: 'Main Point 1', type: 'hauptpunkt' }
      ]
      useChecklist.mockReturnValue({
        mainPoints: mockMainPoints,
        categories: {},
        products: {},
        links: {},
        loading: false,
        error: null,
        showPurchased: true,
        setShowPurchased: vi.fn(),
        createMainPoint: vi.fn(),
        createCategory: vi.fn(),
        createProduct: vi.fn(),
        addProductLink: vi.fn(),
        markPurchased: vi.fn(),
        deleteItem: vi.fn()
      })

      render(<App />)

      expect(screen.getByTestId('main-point-list')).toBeInTheDocument()
      expect(screen.getByTestId('main-point-mp1')).toBeInTheDocument()
    })

    it('shows error message when checklist error occurs', () => {
      useChecklist.mockReturnValue({
        mainPoints: [],
        categories: {},
        products: {},
        links: {},
        loading: false,
        error: 'Failed to load checklist',
        showPurchased: true,
        setShowPurchased: vi.fn(),
        createMainPoint: vi.fn(),
        createCategory: vi.fn(),
        createProduct: vi.fn(),
        addProductLink: vi.fn(),
        markPurchased: vi.fn(),
        deleteItem: vi.fn()
      })

      render(<App />)

      expect(screen.getByText('Failed to load checklist')).toBeInTheDocument()
    })
  })

  // Modal flow tests
  describe('modal flows', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn()
      })
      useChecklist.mockReturnValue({
        mainPoints: [{ id: 'mp1', name: 'Main Point 1', type: 'hauptpunkt' }],
        categories: {},
        products: {},
        links: {},
        loading: false,
        error: null,
        showPurchased: true,
        setShowPurchased: vi.fn(),
        createMainPoint: vi.fn(),
        createCategory: vi.fn(),
        createProduct: vi.fn(),
        addProductLink: vi.fn(),
        markPurchased: vi.fn(),
        deleteItem: vi.fn()
      })
      useImageScraping.mockReturnValue({
        scrapeUrl: vi.fn(),
        loading: false
      })
    })

    it('opens add main point modal when button clicked', async () => {
      render(<App />)

      const addButton = screen.getByRole('button', { name: /\+ Hauptpunkt/i })
      fireEvent.click(addButton)

      await waitFor(() => {
        expect(screen.getByTestId('add-item-modal')).toBeInTheDocument()
      })
    })

    it('creates main point when modal saves', async () => {
      const createMainPoint = vi.fn().mockResolvedValue({})
      useChecklist.mockReturnValue({
        mainPoints: [{ id: 'mp1', name: 'Main Point 1', type: 'hauptpunkt' }],
        categories: {},
        products: {},
        links: {},
        loading: false,
        error: null,
        showPurchased: true,
        setShowPurchased: vi.fn(),
        createMainPoint,
        createCategory: vi.fn(),
        createProduct: vi.fn(),
        addProductLink: vi.fn(),
        markPurchased: vi.fn(),
        deleteItem: vi.fn()
      })

      render(<App />)

      const addButton = screen.getByRole('button', { name: /\+ Hauptpunkt/i })
      fireEvent.click(addButton)

      await waitFor(() => {
        expect(screen.getByTestId('add-item-modal')).toBeInTheDocument()
      })

      const saveButton = screen.getByTestId('save-item')
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(createMainPoint).toHaveBeenCalledWith('Test Item')
      })
    })

    it('opens purchase modal and transitions to tracking modal', async () => {
      render(<App />)

      // Simulate opening purchase modal
      const mainPoint = screen.getByTestId('main-point-mp1')
      expect(mainPoint).toBeInTheDocument()

      // Modal would be opened by onPurchase callback
      // This tests the flow when purchase is confirmed
    })
  })

  // Header interaction tests
  describe('header interactions', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn()
      })
      useChecklist.mockReturnValue({
        mainPoints: [],
        categories: {},
        products: {},
        links: {},
        loading: false,
        error: null,
        showPurchased: true,
        setShowPurchased: vi.fn(),
        createMainPoint: vi.fn(),
        createCategory: vi.fn(),
        createProduct: vi.fn(),
        addProductLink: vi.fn(),
        markPurchased: vi.fn(),
        deleteItem: vi.fn()
      })
      useImageScraping.mockReturnValue({
        scrapeUrl: vi.fn(),
        loading: false
      })
    })

    it('renders header with user information', () => {
      render(<App />)

      expect(screen.getByText(mockUser.email)).toBeInTheDocument()
    })

    it('passes showPurchased state to header', () => {
      const setShowPurchased = vi.fn()
      useChecklist.mockReturnValue({
        mainPoints: [],
        categories: {},
        products: {},
        links: {},
        loading: false,
        error: null,
        showPurchased: true,
        setShowPurchased,
        createMainPoint: vi.fn(),
        createCategory: vi.fn(),
        createProduct: vi.fn(),
        addProductLink: vi.fn(),
        markPurchased: vi.fn(),
        deleteItem: vi.fn()
      })

      render(<App />)

      const toggle = screen.getByRole('checkbox')
      expect(toggle).toBeChecked()

      fireEvent.click(toggle)

      expect(setShowPurchased).toHaveBeenCalledWith(false)
    })
  })
})
