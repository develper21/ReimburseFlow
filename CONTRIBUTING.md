# Contributing to Expenseura

Thank you for your interest in contributing to Expenseura! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/expenseura.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Commit with a clear message
7. Push to your fork
8. Create a Pull Request

## Development Setup

Follow the setup instructions in `SETUP_GUIDE.md` to get your local environment running.

## Code Style

### JavaScript/React
- Use functional components with hooks
- Follow ESLint rules (run `npm run lint`)
- Use meaningful variable and function names
- Add comments for complex logic
- Keep components small and focused

### CSS/Tailwind
- Use Tailwind utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing
- Use the color palette from `tailwind.config.js`

### File Organization
```
src/
├── components/     # Reusable UI components
├── pages/          # Page-level components
├── hooks/          # Custom React hooks
├── lib/            # Utility functions
└── ...
```

## Commit Messages

Use clear, descriptive commit messages:

```
feat: Add bulk expense upload feature
fix: Resolve OCR parsing issue with dates
docs: Update setup guide with troubleshooting
style: Format code with prettier
refactor: Simplify approval logic
test: Add tests for currency conversion
```

Prefixes:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

## Pull Request Process

1. **Update Documentation**: If you add features, update README.md and FEATURES.md
2. **Add Tests**: Include unit tests for new functionality
3. **Test Thoroughly**: Ensure all existing tests pass
4. **Update Changelog**: Add entry to CHANGELOG.md (if exists)
5. **Screenshots**: Include screenshots for UI changes
6. **Description**: Provide clear PR description with:
   - What changed
   - Why it changed
   - How to test it

## Testing

### Run Tests
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

### Writing Tests
- Test user-facing behavior, not implementation
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies

## Code Review

All submissions require review. We'll look for:
- Code quality and style
- Test coverage
- Documentation
- Performance implications
- Security considerations

## Bug Reports

When filing a bug report, include:
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Browser/OS information
- Console errors

Use this template:

```markdown
## Bug Description
[Clear description of the bug]

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- Browser: [e.g., Chrome 120]
- OS: [e.g., Windows 11]
- Version: [e.g., 1.0.0]

## Screenshots
[If applicable]

## Console Errors
[If any]
```

## Feature Requests

We welcome feature requests! Please:
- Check if it's already requested
- Provide clear use case
- Explain expected behavior
- Consider implementation complexity

## Areas for Contribution

### Good First Issues
- UI improvements
- Documentation updates
- Bug fixes
- Test coverage
- Accessibility improvements

### Advanced Contributions
- New approval rule types
- Integration with external services
- Performance optimizations
- Advanced reporting features

## Questions?

- Check existing issues and discussions
- Review documentation
- Ask in GitHub Discussions

## Code of Conduct

### Our Pledge
We pledge to make participation in our project a harassment-free experience for everyone.

### Our Standards
- Be respectful and inclusive
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior
- Harassment or discriminatory language
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to Expenseura! 🎉
