# 🚨 CRITICAL SECURITY WARNING

## Exposed Credentials Detected

**Date**: 2025-11-17
**Severity**: CRITICAL

### Issue
The following files containing actual API credentials were previously committed to git:
- `CCEP.prod.json`
- `CCEP.sandbox.json`
- `CCEP.uat.json`
- `TP.json.prod.json`
- `TP.json.sandbox.key.json`

These files have been removed from git tracking, but **they still exist in git history**.

### Exposed Data
The following credentials are exposed in git history:
- API Keys
- Usernames
- Passwords
- Merchant Codes

### Required Actions

#### IMMEDIATE (Do Now)
1. **Rotate ALL credentials** found in these files
2. **Generate new API keys** from your payment provider
3. **Update production systems** with new credentials

#### Soon (This Week)
4. **Remove from git history** using one of these methods:

   **Option A: BFG Repo-Cleaner (Recommended)**
   ```bash
   # Install BFG
   brew install bfg  # or download from https://rtyley.github.io/bfg-repo-cleaner/

   # Clone a fresh copy
   git clone --mirror https://github.com/ZenithPayments/zenpay-payment-plugin.git

   # Remove the files from history
   bfg --delete-files 'CCEP.*.json' zenpay-payment-plugin.git
   bfg --delete-files 'TP.*.json' zenpay-payment-plugin.git

   # Clean up
   cd zenpay-payment-plugin.git
   git reflog expire --expire=now --all && git gc --prune=now --aggressive

   # Force push (WARNING: This rewrites history)
   git push --force
   ```

   **Option B: git filter-branch**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch CCEP.*.json TP.*.json" \
     --prune-empty --tag-name-filter cat -- --all

   git push --force --all
   git push --force --tags
   ```

5. **Inform all team members** to re-clone the repository after history rewrite
6. **Audit access logs** to check if exposed credentials were accessed

### Prevention
- ✅ Files are now properly gitignored
- ✅ Use environment variables for sensitive data
- ✅ Never commit actual credentials to version control
- ✅ Use `.env` files (also gitignored) for local development
- ✅ Use secret managers (AWS Secrets Manager, HashiCorp Vault, etc.) for production

### Status
- [x] Removed files from git tracking (commit: TBD)
- [ ] Credentials rotated
- [ ] Files removed from git history
- [ ] Team notified
- [ ] Access logs audited

---

**This file will be deleted after the security issue is resolved.**
