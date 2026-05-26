# Workshop Checklist

A modern, responsive web application for managing workshop tasks, products, and checklist items with real-time database synchronization.

## Features

- **Product Management**: Create, edit, and delete products with categories
- **Task Tracking**: Add tasks with deadlines, priorities, and deadline countdown timers
- **Link Management**: Store and manage links to product details with metadata
- **Real-time Sync**: Automatic synchronization with Supabase database
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Dark Theme**: Eye-friendly dark mode UI
- **Authentication**: Secure email/password authentication
- **Search & Filter**: Quick search and filter products by category
- **Progress Tracking**: Visual indicators for task completion and deadline urgency

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: CSS3 with CSS Variables for theming
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library
- **UI Components**: Custom React components

## Setup Instructions

### Prerequisites

- Node.js 16+ and npm
- A Supabase account (free tier available at https://supabase.com)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd workshop-checklist
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env.local`
   - Add your Supabase credentials:
     ```
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key-here
     ```

4. **Set up database**
   - See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for database migration instructions

5. **Start development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous public key |

## Database Setup

The application uses PostgreSQL via Supabase with the following main tables:

- **users**: User authentication and profiles
- **categories**: Product categories (with foreign key to users)
- **products**: Products and checklist items (with foreign keys to users and categories)
- **product_links**: Links associated with products (with metadata)

For detailed database setup and migration instructions, see [DEPLOYMENT.md](./docs/DEPLOYMENT.md).

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Check code style

### Project Structure

```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── services/           # API and database services
├── styles/             # CSS stylesheets
├── database/           # Database configuration
├── utils/              # Utility functions
├── __tests__/          # Test files
├── App.jsx            # Main application component
└── main.jsx           # Application entry point
```

## Deployment

### Deploy to Vercel

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for complete deployment instructions including:

- Step-by-step Vercel setup
- Environment variable configuration
- Custom domain setup
- Database migration on deployment
- Troubleshooting guide

**Quick Start:**
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy with one click

## Features in Detail

### Products
- Add products with name, description, and optional deadline
- Assign products to categories
- Mark products as purchased (with fade effect)
- View and manage associated links
- Display deadline countdown for urgent items

### Tasks
- Create tasks with optional deadlines
- Set urgency levels based on deadline proximity
- View remaining time to deadline
- 24-hour time format display
- Color-coded urgency indicators

### Links
- Store links to product details (Amazon, local stores, etc.)
- Auto-fetch link metadata (title, image, price)
- Display platform information
- Quick access to product details

### Categories
- Organize products by custom categories
- Expandable/collapsible category sections
- Quick add product to category
- Category-based filtering

## Testing

The project includes a comprehensive test suite:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test -- ProductCard.test.jsx
```

Tests cover:
- Component rendering
- User interactions
- API calls and mocking
- State management
- Form validation

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Styling

The application uses CSS variables for theming. Dark theme variables:

```css
--bg-primary: #1a1a1a
--bg-secondary: #2a2a2a
--text-primary: #ffffff
--text-secondary: #aaaaaa
--accent-blue: #2196f3
--accent-green: #4caf50
--accent-orange: #ff9800
--border-color: #3a3a3a
```

All animations use a consistent transition speed of 0.2s for smooth interactions.

## Troubleshooting

### Common Issues

**Cannot connect to database?**
- Verify Supabase credentials in `.env.local`
- Ensure Supabase project is active
- Check network connectivity

**Authentication issues?**
- Clear browser cookies/cache
- Verify email is registered
- Check Supabase Auth settings

**Build errors?**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Clear Vite cache: `rm -rf .vite`

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for more troubleshooting tips.

## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to repository
4. Open pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub or contact the development team.
# workshop-checklist
