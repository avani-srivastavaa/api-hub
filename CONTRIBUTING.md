# 🤝 Contributing Guide

Thank you for contributing to the Universal AI API Connector & Hub! This guide will help you get started.

---

## 📋 Table of Contents

1. [Getting Started](#-getting-started)
2. [Development Setup](#-development-setup)
3. [Branching Strategy](#-branching-strategy)
4. [Commit Guidelines](#-commit-guidelines)
5. [Pull Request Process](#-pull-request-process)
6. [Code Style](#-code-style)
7. [Testing](#-testing)
8. [Documentation](#-documentation)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Git
- GitHub account
- Understanding of JavaScript/React

### First Steps

1. Fork the repository
2. Clone your fork
3. Add upstream remote: `git remote add upstream https://github.com/original/api-hub.git`
4. Create a feature branch
5. Make your changes
6. Submit a pull request

---

## 🛠️ Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/api-hub.git
cd api-hub
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env

# Edit .env with your settings
nano .env

# Initialize database
npm run migrate
npm run seed

# Start development server
npm run dev
```

### 3. Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env.local

# Start development server
npm run dev
```

### 4. Verify Setup

```bash
# Test backend
curl http://localhost:5000/health

# Test frontend
# Open http://localhost:5173 in browser
```

---

## 🌳 Branching Strategy

### Branch Naming

Use descriptive branch names with prefixes:

```
feature/add-webhook-support
fix/connector-validation-bug
docs/update-api-reference
chore/update-dependencies
test/add-connector-tests
```

### Branch Rules

- Branch from `main` or `develop`
- One feature/fix per branch
- Keep branches short-lived (< 1 week ideally)
- Delete branch after merge

### Examples

```bash
# Create feature branch
git checkout -b feature/groq-provider

# Create bugfix branch
git checkout -b fix/token-count-error

# Update and push
git push origin feature/groq-provider
```

---

## 📝 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Build, dependencies, etc.

### Scope

Component affected:
- `backend`
- `frontend`
- `database`
- `docker`
- `docs`

### Subject

- Imperative mood ("add" not "added")
- Don't capitalize first letter
- No period at end
- Max 50 characters

### Body

- Explain what and why, not how
- Wrap at 72 characters
- Separate from subject with blank line

### Examples

```
feat(backend): add groq provider support

Implement Groq AI provider for faster inference times.
Adds GroqProvider class following BaseProvider pattern.

Resolves #123
```

```
fix(frontend): correct connector list loading state

Fixed race condition where loading state wasn't cleared
if error occurred during fetch. Now properly handles
both success and error states.

Fixes #456
```

---

## 🔄 Pull Request Process

### Before Creating PR

1. Update your branch: `git pull upstream main`
2. Ensure tests pass: `npm test`
3. Ensure no linting errors: `npm run lint`
4. Update documentation if needed
5. Self-review your code

### Creating PR

1. Push your branch
2. Create pull request on GitHub
3. Fill out PR template completely
4. Link related issues: "Fixes #123"
5. Request reviewers

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update
- [ ] Breaking change

## Changes Made
- Detailed list of changes
- One bullet per change

## Testing
How to test these changes:
1. Step 1
2. Step 2

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review complete
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests pass
- [ ] No new warnings generated
```

### Review Process

1. At least 1 approval required
2. All conversations resolved
3. CI/CD checks passing
4. No merge conflicts

### After Approval

1. Rebase on main: `git rebase upstream/main`
2. Squash commits if requested
3. Merge PR (maintainer does this)
4. Delete branch

---

## 🎨 Code Style

### General Rules

- Use ESM imports/exports
- Use async/await, not callbacks
- Use meaningful variable names
- Keep functions small and focused
- Use comments for "why", not "what"

### Backend (Node.js/Express)

```javascript
// Good
async function fetchConnector(id) {
  const connector = await ConnectorService.getById(id);
  if (!connector) {
    throw new Error('Connector not found');
  }
  return connector;
}

// Bad
function getConnector(id) {
  return db.query(`SELECT * FROM connectors WHERE id='${id}'`);
}
```

### Frontend (React)

```javascript
// Good
function ConnectorList() {
  const { connectors, loading } = useConnectorStore();
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div className="space-y-4">
      {connectors.map(c => (
        <ConnectorCard key={c.id} connector={c} />
      ))}
    </div>
  );
}

// Bad
function ConnectorList() {
  const [connectors, setConnectors] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetch('/api/connectors')
      .then(r => r.json())
      .then(d => {
        setConnectors(d);
        setLoading(false);
      });
  }, []);
  
  if (loading) return <div>Loading...</div>;
  return <ul>{connectors.map(c => <li>{c.name}</li>)}</ul>;
}
```

### Formatting

- Use Prettier (if configured)
- 2-space indentation
- No trailing commas in function params
- Single quotes for strings (JavaScript)
- Semicolons at end of statements

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run specific test
npm test -- tests/providers.test.js

# Run with coverage
npm test -- --coverage
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

### Test File Naming

- Backend: `src/__tests__/feature.test.js`
- Frontend: `src/__tests__/Component.test.jsx`

### Writing Tests

```javascript
// Backend example
describe('ConnectorService', () => {
  it('should create a connector', async () => {
    const data = {
      name: 'Test',
      provider: 'anthropic',
      system_prompt: 'Help'
    };
    
    const connector = await ConnectorService.create(data);
    expect(connector.name).toBe('Test');
  });
});

// Frontend example
describe('Dashboard', () => {
  it('should display stats', () => {
    render(<Dashboard />);
    expect(screen.getByText(/system status/i)).toBeInTheDocument();
  });
});
```

### Coverage Targets

- Backend: 80%+ coverage
- Frontend: 70%+ coverage
- Critical paths: 100% coverage

---

## 📚 Documentation

### Update When

- [ ] Adding new feature
- [ ] Changing API endpoint
- [ ] Adding new configuration option
- [ ] Fixing bug (if doc was unclear)
- [ ] Updating dependencies

### Files to Update

- `README.md` - Overview changes
- `API_DOCUMENTATION.md` - API changes
- `SETUP_AND_RUN.md` - Setup changes
- `TROUBLESHOOTING.md` - Known issues
- Code comments - For complex logic

### Documentation Format

```markdown
# Section Title

Brief intro paragraph.

## Subsection

Explanation of feature/concept.

### Example

```bash
code example
```

## Related

- Link to related docs
- Link to relevant issues
```

---

## 📋 Checklists

### Before Committing

- [ ] Code runs locally
- [ ] Tests pass
- [ ] No console errors/warnings
- [ ] Follows code style
- [ ] Meaningful commit message

### Before Pushing

- [ ] Branch updated from upstream
- [ ] Conflicts resolved
- [ ] All changes intentional
- [ ] No debug code left
- [ ] .env files not included

### Before PR

- [ ] Description complete
- [ ] Type of change noted
- [ ] Testing steps included
- [ ] Documentation updated
- [ ] No breaking changes (or noted)

---

## 🆘 Need Help?

### Questions?

- Check [GETTING_STARTED.md](GETTING_STARTED.md)
- Read [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Open a GitHub discussion

### Found a Bug?

1. Search existing issues first
2. Create new issue with:
   - Clear title
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Environment (OS, Node version, etc.)

### Suggesting a Feature?

1. Search existing issues/discussions
2. Describe use case
3. Suggest implementation approach
4. Discuss in issue before coding

---

## 🎯 Development Workflow

### Typical Day

```bash
# 1. Update from upstream
git pull upstream main

# 2. Create feature branch
git checkout -b feature/my-feature

# 3. Make changes
# (Edit files, test locally)

# 4. Commit changes
git add .
git commit -m "feat(backend): add new feature"

# 5. Push to GitHub
git push origin feature/my-feature

# 6. Create pull request on GitHub
# Fill out PR template
# Request reviewers

# 7. Address feedback
# Make changes, push again
# Conversation in PR

# 8. Merge when approved
# GitHub (maintainer) merges
# Branch deleted automatically
```

---

## 📞 Code Review Guidelines

### As an Author

- Request reviewers promptly
- Respond to feedback respectfully
- Ask clarifying questions if needed
- Push new commits (don't force push)
- Thank reviewers when done

### As a Reviewer

- Be constructive and kind
- Suggest improvements, don't demand
- Ask questions about unclear code
- Approve when satisfied
- Leave comments for author to address

---

## 🚀 Becoming a Maintainer

### Requirements

- 5+ merged pull requests
- Active contributor for 3+ months
- Good understanding of codebase
- Consistent quality and communication
- Commitment to the project

### Contact

Reach out to existing maintainers if interested!

---

## 📜 License

All contributions are made under the same license as the project.

---

## ✨ Thank You!

Your contributions make this project better. We appreciate your effort!

**Happy coding!** 🎉

---

### Quick Links

- [Issues](https://github.com/yourusername/api-hub/issues)
- [Discussions](https://github.com/yourusername/api-hub/discussions)
- [Pull Requests](https://github.com/yourusername/api-hub/pulls)
- [Main Repository](https://github.com/yourusername/api-hub)

---

**Questions? Ask in Discussions or open an Issue!**
