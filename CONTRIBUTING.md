# Contributing to PlanManage

Thank you for your interest in contributing to PlanManage! This document provides guidelines and information about contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guide](#style-guide)
- [Commit Messages](#commit-messages)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)
- [Additional Notes](#additional-notes)

---

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

### Our Standards

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

---

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible.

**How to Submit A Good Bug Report:**

1. Use a clear and descriptive title
2. Describe the exact steps to reproduce the problem
3. Provide specific examples to demonstrate the steps
4. Describe the behavior you observed after following the steps
5. Explain which behavior you expected to see instead and why
6. Include screenshots if possible

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

1. Use a clear and descriptive title
2. Provide a step-by-step description of the suggested enhancement
3. Provide specific examples to demonstrate the steps
4. Describe the current behavior and explain which behavior you expected to see instead
5. Explain why this enhancement would be useful

### Your First Code Contribution

Unsure where to begin contributing? You can start by looking through these `beginner` and `help-wanted` issues:

- **Beginner issues** - issues which should only require a few lines of code
- **Help wanted issues** - issues which should be a bit more involved

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

---

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 14.0
- npm or yarn or pnpm

### Setup Steps

1. **Fork and clone the repository**

```bash
git clone https://github.com/your-username/PlanManage.git
cd PlanManage
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/planmanage
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

4. **Initialize the database**

```bash
npx prisma generate
npx prisma db push
```

5. **Start the development server**

```bash
npm run dev
```

6. **Run tests**

```bash
npm run test
```

---

## Pull Request Process

1. Update the README.md with details of changes to the interface
2. Update the CHANGELOG.md with your changes
3. The PR will be merged once you have the sign-off of at least one maintainer

### PR Checklist

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published in downstream modules

---

## Style Guide

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

### TypeScript Style Guide

- All TypeScript must pass the linter (`npm run lint`)
- All TypeScript must pass type checking (`npm run type-check`)
- Use TypeScript strict mode
- Avoid using `any` type
- Use optional chaining `?.` and nullish coalescing `??`

### CSS Style Guide

- Use Tailwind CSS for styling
- Follow the utility-first approach
- Use shadcn/ui components when available
- Keep custom CSS to a minimum

### Documentation Style Guide

- Use Markdown for documentation
- Reference code with backticks
- Include code examples when possible
- Keep documentation up to date

---

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools

### Examples

```
feat(tasks): add subtask functionality

- Support creating subtasks
- Support subtask progress display
- Support subtask drag-and-drop sorting

Closes #123
```

```
fix(auth): resolve login redirect issue

The login page was not redirecting to the dashboard after successful
authentication. This was caused by an incorrect redirect URL in the
NextAuth configuration.

Fixes #456
```

---

## Reporting Bugs

### Before Submitting A Bug Report

- Check the [issues](https://github.com/your-username/PlanManage/issues) to see if the problem has already been reported
- If you're unable to find an open issue addressing the problem, open a new one

### How Do I Submit A Good Bug Report?

Bugs are tracked as GitHub issues. Create an issue and provide the following information:

- Use a clear and descriptive title
- Describe the exact steps to reproduce the problem
- Provide specific examples to demonstrate the steps
- Describe the behavior you observed after following the steps
- Explain which behavior you expected to see instead and why
- Include screenshots or animated GIFs if possible
- Include your environment details (OS, browser, Node.js version, etc.)

---

## Suggesting Enhancements

### Before Submitting An Enhancement Suggestion

- Check if the enhancement has already been suggested
- Check if the enhancement aligns with the project's goals

### How Do I Submit A Good Enhancement Suggestion?

Enhancement suggestions are tracked as GitHub issues. Create an issue and provide the following information:

- Use a clear and descriptive title
- Provide a step-by-step description of the suggested enhancement
- Provide specific examples to demonstrate the steps
- Describe the current behavior and explain which behavior you expected to see instead
- Explain why this enhancement would be useful
- List some other projects where this enhancement exists, if applicable

---

## Additional Notes

### Issue and Pull Request Labels

This section lists the labels we use to help us track and manage issues and pull requests.

**Type of Issue:**
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed

**Status:**
- `duplicate` - This issue or pull request already exists
- `invalid` - This doesn't seem right
- `wontfix` - This will not be worked on
- `ready for review` - Ready for code review
- `in progress` - Currently being worked on

**Priority:**
- `high` - High priority
- `medium` - Medium priority
- `low` - Low priority

---

## Questions?

If you have any questions, please feel free to:

- Open an issue
- Contact the maintainers
- Join our community discussions

---

Thank you for contributing to PlanManage! 🎉
