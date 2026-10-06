# 🎨 Frontend Setup & Development Guide

Complete guide for setting up and developing the React admin dashboard.

---

## 📋 Prerequisites

- Node.js 16+ (recommended 18+)
- npm or yarn package manager
- Backend API running (or dev server)

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

```bash
# Copy example config
cp .env.example .env.local

# Edit .env.local
nano .env.local
```

**`.env.local`**:
```env
VITE_API_URL=http://localhost:5000
VITE_ENABLE_ADVANCED_TESTING=true
```

### 3. Start Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` (or next available port).

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/           # Reusable React components
│   │   └── Layout.jsx       # Main app layout
│   │
│   ├── pages/               # Page components (routes)
│   │   ├── Dashboard.jsx    # Overview page
│   │   ├── ConnectorsList.jsx
│   │   ├── ConnectorDetail.jsx
│   │   ├── CreateConnector.jsx
│   │   ├── TestConnector.jsx
│   │   ├── Documentation.jsx
│   │   └── Statistics.jsx
│   │
│   ├── services/            # API communication
│   │   └── api.js          # Axios instance + all API calls
│   │
│   ├── store/              # State management
│   │   └── index.js        # Zustand stores
│   │
│   ├── utils/              # Utility functions
│   ├── hooks/              # Custom React hooks
│   │
│   ├── App.jsx             # Main app component + routing
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles (Tailwind)
│
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS config
├── postcss.config.js       # PostCSS config
├── package.json
├── .env.example            # Environment template
└── .gitignore

```

---

## 🛠️ Development

### Run Development Server

```bash
npm run dev

# With specific port
npm run dev -- --port 3000
```

### Build for Production

```bash
npm run build
```

Output: `dist/` folder ready for deployment

### Preview Production Build

```bash
npm run preview
```

Test the production build locally.

---

## 📦 Dependencies

### Core
- **React 18.2** - UI library
- **React Router 6** - Client-side routing
- **Vite 5** - Fast build tool
- **Tailwind CSS 3** - Utility-first CSS

### State Management
- **Zustand 4** - Lightweight state management

### API & HTTP
- **Axios** - HTTP client

### UI & UX
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications
- **React Syntax Highlighter** - Code block rendering

### Utilities
- **Date-fns** - Date manipulation

---

## 🎨 Styling

### Tailwind CSS

All styling uses Tailwind utility classes.

**Example Component**:
```jsx
function MyComponent() {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900">Title</h3>
      <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
        Action
      </button>
    </div>
  );
}
```

### Custom Utility Classes

Defined in `src/index.css`:

```css
.btn-primary    /* Primary button style */
.btn-secondary  /* Secondary button style */
.btn-danger     /* Danger button style */
.card           /* Card container */
.input-field    /* Form input */
.label          /* Form label */
.badge          /* Badge component */
.badge-primary  /* Primary badge */
.badge-success  /* Success badge */
```

---

## 🔄 State Management (Zustand)

### Connector Store

```javascript
import { useConnectorStore } from './store';

function MyComponent() {
  const {
    connectors,
    loading,
    error,
    fetchConnectors,
    createConnector,
    deleteConnector,
  } = useConnectorStore();

  useEffect(() => {
    fetchConnectors();
  }, []);

  return (
    // Use state and actions
  );
}
```

### Available Stores

1. **useConnectorStore** - Connector CRUD and management
2. **useStatsStore** - Statistics and analytics

---

## 🌐 API Integration

### Using API Service

```javascript
import { connectorsAPI, testAPI } from './services/api';

// List connectors
const data = await connectorsAPI.list({ status: 'active' });

// Create connector
const newConnector = await connectorsAPI.create({
  name: 'My Connector',
  provider: 'anthropic',
  // ...
});

// Test connector
const result = await testAPI.test(connectorId, { sample: 'input' });
```

### API Methods Available

**System**:
- `systemAPI.health()`
- `systemAPI.dbTest()`
- `systemAPI.systemInfo()`

**Connectors**:
- `connectorsAPI.list(filters)`
- `connectorsAPI.create(data)`
- `connectorsAPI.getById(id)`
- `connectorsAPI.update(id, data)`
- `connectorsAPI.delete(id)`
- `connectorsAPI.disable(id)`
- `connectorsAPI.enable(id)`
- `connectorsAPI.getStats(id)`
- `connectorsAPI.getAllStats()`
- `connectorsAPI.getLogs(id, limit, offset)`

**Documentation**:
- `docsAPI.listDocs()`
- `docsAPI.getDoc(id)`
- `docsAPI.getHtmlDoc(id)`

**Testing**:
- `testAPI.test(connectorId, input)`
- `testAPI.quickTest(connectorId, input)`

---

## 🎯 Key Features

### Dashboard
- System status overview
- Available AI providers
- Key metrics (requests, tokens, costs)
- Top performing connectors

### Connectors Page
- List all connectors
- Filter by status and provider
- Quick actions (view, test, delete)

### Connector Details
- Full configuration display
- Input/output schema visualization
- System prompt display
- Timestamp information

### Create Connector
- Form for creating new connectors
- Provider selection
- Model configuration
- System prompt definition

### Testing Interface
- Send test requests to connectors
- View responses and metadata
- Monitor performance metrics

### Documentation
- Browse auto-generated API docs
- View JSON and HTML documentation
- Endpoint examples and schemas

### Statistics
- View usage statistics
- Success rates and response times
- Token usage and costs
- Connector performance metrics

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Dashboard loads and displays data
- [ ] Can create a new connector
- [ ] Can view connector details
- [ ] Can test a connector
- [ ] Can view documentation
- [ ] Can view statistics
- [ ] Filters work correctly
- [ ] Error messages display properly
- [ ] Forms validate input
- [ ] API errors are handled gracefully

### Browser DevTools

1. **Network Tab** - Monitor API calls
2. **Console Tab** - Check for errors
3. **React DevTools** - Inspect component state
4. **Redux DevTools** - (Not used, but Zustand state can be logged)

---

## 🔧 Common Tasks

### Add a New Page

1. Create `src/pages/MyPage.jsx`:

```jsx
function MyPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Page</h1>
      {/* Content */}
    </div>
  );
}

export default MyPage;
```

2. Add route in `App.jsx`:

```jsx
import MyPage from './pages/MyPage';

<Route path="/my-page" element={<MyPage />} />
```

3. Add navigation link in `Layout.jsx`

### Add a New Component

1. Create `src/components/MyComponent.jsx`
2. Import and use in pages

### Add API Call

1. Add method to `src/services/api.js`
2. Use in component via store or direct import

### Modify Styles

- Global styles: `src/index.css`
- Component styles: Tailwind classes in JSX

---

## 🐛 Debugging

### Enable Debug Logging

```javascript
// In any component
console.log('State:', useConnectorStore.getState());
```

### React DevTools

1. Install React DevTools browser extension
2. Inspect components and their props/state
3. View component tree

### Network Issues

1. Check browser Network tab
2. Verify `VITE_API_URL` is correct
3. Check backend CORS settings
4. Verify backend is running

### State Issues

```javascript
// Subscribe to store changes
useConnectorStore.subscribe(
  (state) => console.log('State updated:', state),
  (state) => state.connectors // Only subscribe to connectors changes
);
```

---

## 📱 Responsive Design

Frontend is fully responsive:
- **Mobile**: 1-column layout
- **Tablet**: 2-column layout
- **Desktop**: 3+ column layout

Tailwind breakpoints used:
- `sm` (640px)
- `md` (768px)
- `lg` (1024px)
- `xl` (1280px)

---

## ⚡ Performance Tips

1. **Code Splitting** - Routes are lazy loaded via React Router
2. **Image Optimization** - Use appropriate formats and sizes
3. **State Management** - Zustand is lightweight and efficient
4. **API Caching** - Implement in Zustand store if needed
5. **Build Optimization** - Vite handles tree-shaking automatically

---

## 🚀 Deployment

### Build & Deploy to Vercel

```bash
# Vercel auto-detects Vite projects
vercel

# Or use GitHub integration
```

### Deploy to Railway

```bash
# Railway auto-detects npm projects
# Set build command: npm run build
# Set start command: npm run preview
```

### Deploy to Netlify

```bash
# Netlify auto-detects Vite projects
# Set build directory: dist
```

---

## 📚 Learning Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Guide](https://vitejs.dev)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Router](https://reactrouter.com)
- [Axios Documentation](https://axios-http.com)

---

## 🆘 Common Issues

### Port Already in Use
```bash
npm run dev -- --port 3001
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### API Calls Failing
- Check backend is running
- Verify `VITE_API_URL` is correct
- Check browser console for errors
- Check Network tab in DevTools

### Styles Not Loading
- Clear browser cache (Ctrl+Shift+Delete)
- Rebuild: `npm run dev`
- Check Tailwind config

---

## 📝 Adding Features

### New Feature Checklist

- [ ] Create page/component
- [ ] Add API calls to `services/api.js`
- [ ] Add store methods if needed
- [ ] Add routing in `App.jsx`
- [ ] Add navigation link in `Layout.jsx`
- [ ] Test all flows
- [ ] Handle errors and edge cases
- [ ] Add loading states
- [ ] Test on mobile
- [ ] Document in README

---

**Happy coding!** 🎉

For issues or questions, check the backend's `SETUP_AND_RUN.md` for backend troubleshooting.
