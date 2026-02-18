---
description: Automatically deploy changes to Vercel
---

### Automated Deployment Workflow

To automatically deploy your changes, you can use the following steps:

// turbo
1. **Sync with GitHub**
   This command will stage all changes, commit them with a generic message, and push to main.
   ```powershell
   npm run deploy
   ```

2. **Monitor on Vercel**
   Your site is now building at [Vercel](https://vercel.com/dashboard). It will be live in 1-2 minutes.
