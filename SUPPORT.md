# Support

## Getting Help

If you need help with PlanManage, there are several ways to get support:

### Documentation

Before asking for help, please check our documentation:

- **[User Guide](docs/user-guide/README.md)** - How to use PlanManage
- **[API Documentation](docs/api/README.md)** - API reference
- **[Developer Guide](docs/developer/README.md)** - How to contribute
- **[README](README.md)** - Project overview

### Community Support

#### GitHub Issues

For bug reports and feature requests:
- Search existing issues before creating a new one
- Use the issue templates provided
- Include as much detail as possible

**Create an Issue**: [GitHub Issues](https://github.com/your-username/PlanManage/issues)

#### GitHub Discussions

For questions, ideas, and general discussions:
- Ask questions about usage
- Share ideas and feedback
- Help other users

**Join Discussions**: [GitHub Discussions](https://github.com/your-username/PlanManage/discussions)

### Direct Support

#### Email Support

For urgent or private matters:
- **General Support**: support@planmanage.com
- **Security Issues**: security@planmanage.com
- **Business Inquiries**: business@planmanage.com

**Response Time**: We aim to respond within 48 hours.

#### Community Chat

Join our community chat for real-time help:
- **Discord**: [Join our Discord](https://discord.gg/planmanage)
- **Slack**: [Join our Slack](https://join.slack.com/t/planmanage/shared_invite/...)

## Common Issues

### Installation Issues

**Problem**: `npm install` fails

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Database Issues

**Problem**: Database connection fails

**Solution**:
1. Check your `DATABASE_URL` in `.env.local`
2. Ensure PostgreSQL is running
3. Verify database credentials
4. Check if the database exists

```bash
# Test database connection
npx prisma db pull
```

### Build Issues

**Problem**: Build fails

**Solution**:
```bash
# Clean build cache
rm -rf .next

# Regenerate Prisma client
npx prisma generate

# Try building again
npm run build
```

### Authentication Issues

**Problem**: Login doesn't work

**Solution**:
1. Check `NEXTAUTH_SECRET` is set
2. Check `NEXTAUTH_URL` matches your URL
3. Clear browser cookies
4. Check database for user records

## Reporting Bugs

When reporting bugs, please include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Step-by-step instructions
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: OS, browser, Node.js version
6. **Screenshots**: If applicable
7. **Logs**: Any error messages

### Bug Report Template

```markdown
## Bug Description

[Clear description of the bug]

## Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior

[What should happen]

## Actual Behavior

[What actually happens]

## Environment

- OS: [e.g., Windows 11, macOS 14]
- Browser: [e.g., Chrome 120, Firefox 121]
- Node.js: [e.g., 18.17.0]
- PlanManage Version: [e.g., 0.3.0]

## Screenshots

[If applicable]

## Additional Context

[Any other information]
```

## Feature Requests

We love hearing your ideas! When suggesting features:

1. **Check existing requests** to avoid duplicates
2. **Describe the problem** you're trying to solve
3. **Propose a solution** if you have one
4. **Explain the benefits** for users

### Feature Request Template

```markdown
## Feature Description

[Clear description of the feature]

## Problem Statement

[What problem does this solve?]

## Proposed Solution

[How should this work?]

## Benefits

[Why is this valuable?]

## Alternatives Considered

[Other approaches you've thought about]

## Additional Context

[Any other information]
```

## Contributing

Want to contribute? Great! Here's how:

1. **Read the [Contributing Guide](CONTRIBUTING.md)**
2. **Check the [Issues](https://github.com/your-username/PlanManage/issues)** for things to work on
3. **Fork the repository**
4. **Create a pull request**

### Good First Issues

Looking for something to work on? Check out issues labeled:
- `good first issue` - Great for beginners
- `help wanted` - We need help with these
- `documentation` - Help improve our docs

## Professional Support

For enterprise or professional support:

- **Custom Development**: We can build custom features for your needs
- **Consulting**: Architecture and implementation advice
- **Training**: Team training on PlanManage
- **Priority Support**: Faster response times

Contact us at: business@planmanage.com

## Security Issues

**DO NOT** report security vulnerabilities through public channels.

Please report security issues to: security@planmanage.com

See our [Security Policy](SECURITY.md) for more details.

## Feedback

We value your feedback! Let us know:

- What you love about PlanManage
- What could be improved
- Any issues you've encountered
- Suggestions for new features

---

*Last updated: 2024-06-13*
*Version: 1.0*
