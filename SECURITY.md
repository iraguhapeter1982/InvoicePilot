# Security Guidelines for InvoicePilot

## 🔐 Environment Variables Security

### Critical Security Rules:

1. **NEVER commit `.env` files to Git**
2. **Always use `.env.example` as a template**
3. **Immediately revoke exposed API keys**
4. **Use different keys for development and production**

### API Keys That Must Be Protected:

- `RESEND_API_KEY` - Email service authentication
- `DATABASE_URL` - Database connection string
- `SESSION_SECRET` - Session encryption key
- `STRIPE_SECRET_KEY` - Payment processing (if used)

## 🚨 What to Do If Keys Are Exposed:

### Immediate Actions:

1. **Revoke the exposed key immediately**

   - Go to the service provider (Resend, Stripe, etc.)
   - Delete/revoke the compromised key
   - Generate a new key

2. **Update your local environment**

   - Replace the key in your `.env` file
   - Test that the application still works

3. **Clean Git history if needed**

   ```bash
   # If the key was committed, you may need to clean git history
   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env' --prune-empty --tag-name-filter cat -- --all
   ```

4. **Force push to overwrite remote history**
   ```bash
   git push origin --force --all
   git push origin --force --tags
   ```

## 🛡️ Prevention Measures:

### For Developers:

1. **Always check `.gitignore` includes `.env`**
2. **Use `.env.example` for documentation**
3. **Never include actual secrets in code**
4. **Use environment variable validation**

### For Production:

1. **Use different keys for prod/dev**
2. **Enable API key restrictions when possible**
3. **Monitor API key usage**
4. **Rotate keys regularly**

## 📝 Environment Setup:

1. Copy the example file:

   ```bash
   cp .env.example .env
   ```

2. Fill in your actual values:

   ```bash
   RESEND_API_KEY=re_your_actual_key_here
   DATABASE_URL=your_actual_database_url
   # ... other variables
   ```

3. Never commit the `.env` file!

## 🔍 Security Checklist:

- [ ] `.env` is in `.gitignore`
- [ ] No secrets in code or config files
- [ ] Different keys for different environments
- [ ] API keys have appropriate restrictions
- [ ] Regular key rotation schedule
- [ ] Team knows security procedures

## 📞 Emergency Contacts:

- **Resend Support**: https://resend.com/docs
- **Neon Support**: https://neon.tech/docs
- **GitHub Security**: https://github.com/security
