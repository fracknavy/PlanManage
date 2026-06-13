# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.3.x   | :white_check_mark: |
| 0.2.x   | :white_check_mark: |
| 0.1.x   | :x:                |
| < 0.1   | :x:                |

## Reporting a Vulnerability

We take the security of our software seriously. If you believe you have found a security vulnerability in PlanManage, please report it to us as described below.

**Please do NOT report security vulnerabilities through public GitHub issues.**

### How to Report

**Please report security vulnerabilities by emailing: security@planmanage.com**

You should receive a response within 48 hours. If for some reason you do not, please follow up to ensure we received your original message.

### What to Include

Please include the following information in your report:

- **Type of issue** (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- **Full paths of source file(s)** related to the manifestation of the issue
- **The location of the affected source code** (tag/branch/commit or direct URL)
- **Any special configuration** required to reproduce the issue
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact of the issue**, including how an attacker might exploit it

### What to Expect

After you submit a report, we will:

1. **Acknowledge** your report within 48 hours
2. **Confirm** the vulnerability and determine its impact
3. **Notify** you when the vulnerability has been fixed
4. **Credit** you in the security advisory (unless you prefer to remain anonymous)

## Security Measures

### Authentication & Authorization

- **Password Hashing**: All passwords are hashed using bcrypt with 12 rounds
- **Session Management**: Secure session handling via NextAuth.js
- **JWT Tokens**: Signed with a secure secret
- **Route Protection**: Middleware-based route protection
- **API Authentication**: All API routes require valid session

### Data Protection

- **Input Validation**: All user input is validated using Zod schemas
- **SQL Injection Prevention**: Prisma ORM prevents SQL injection
- **XSS Protection**: HTML escaping and Content Security Policy
- **CSRF Protection**: CSRF tokens for state-changing operations
- **Rate Limiting**: API rate limiting to prevent abuse

### Infrastructure

- **HTTPS**: All communications encrypted in transit
- **Environment Variables**: Sensitive data stored in environment variables
- **Database Security**: PostgreSQL with proper access controls
- **Docker Security**: Non-root containers, minimal attack surface

### Monitoring & Logging

- **Error Tracking**: Comprehensive error logging
- **Audit Logging**: Track all important operations
- **Performance Monitoring**: Monitor for anomalies
- **Health Checks**: Regular health check endpoints

## Security Best Practices for Contributors

### Code Review

- All code changes require review before merging
- Security-sensitive changes require additional review
- Automated security scanning in CI/CD pipeline

### Dependencies

- Regular dependency updates
- Automated vulnerability scanning with Dependabot
- Lock file maintenance

### Testing

- Security-focused test cases
- Penetration testing for critical features
- Regular security audits

## Known Security Considerations

### Current Limitations

1. **Single-factor Authentication**: Only password-based authentication is supported
2. **No Email Verification**: Email verification is optional (can be enabled)
3. **Rate Limiting**: Currently in-memory (should use Redis in production)
4. **File Upload**: Local file storage (should use cloud storage in production)

### Planned Improvements

- Multi-factor authentication (MFA)
- OAuth2 provider support
- Enhanced audit logging
- Security headers optimization
- Regular security penetration testing

## Security Contacts

- **Security Team**: security@planmanage.com
- **Maintainers**: See [MAINTAINERS.md](MAINTAINERS.md)
- **GitHub Security**: Use GitHub's security advisories feature

## Responsible Disclosure

We kindly ask that you:

- **Do NOT** disclose the vulnerability publicly until we've had a chance to address it
- **Do NOT** exploit the vulnerability beyond what's necessary to demonstrate it
- **Do** give us reasonable time to address the issue before public disclosure
- **Do** make a good faith effort to avoid privacy violations and service disruption

## Bug Bounty

We currently do not have a formal bug bounty program. However, we deeply appreciate security researchers who responsibly disclose vulnerabilities and will publicly acknowledge their contributions (unless they prefer to remain anonymous).

## Security Advisories

Security advisories will be published on our GitHub Security Advisories page:

[GitHub Security Advisories](https://github.com/your-username/PlanManage/security/advisories)

## References

- [OWASP Top Ten](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Prisma Security](https://www.prisma.io/docs/guides/security)
- [NextAuth.js Security](https://next-auth.js.org/security)

---

*Last updated: 2024-06-13*
*Version: 1.0*
