# Marketrix - Marketing Planner

A comprehensive marketing planner for managing products, content, and ads.

## Features
- Product Management
- Content Planning (Monthly & Ideas)
- Ads Planning & Feedback
- Dashboard with Analytics
- Settings for Company & Users

## Deployment

### GitHub Pages

This project uses `BrowserRouter` and is configured for root-level hosting (e.g., `username.github.io`).

1.  **Push to GitHub**: Push this repository to a new GitHub repository.
2.  **Enable Pages**:
    -   Go to **Settings** > **Pages** in your GitHub repository.
    -   Under **Build and deployment** > **Source**, select **GitHub Actions**.
3.  **Note for Project Pages**: If you are hosting on a project page (e.g., `username.github.io/repo-name`), you may need to:
    -   Update `base: '/'` to `base: '/repo-name/'` in `vite.config.ts`.
    -   Update the `Router` basename in `App.tsx`.

### Vercel (Recommended)

This project is optimized for Vercel with a `vercel.json` file for SPA routing.

1.  **Connect to GitHub**: Push this repository to your GitHub account.
2.  **Import to Vercel**: Go to [Vercel](https://vercel.com) and import the project.
3.  **Configure Environment Variables**:
    -   Add `GEMINI_API_KEY` if you plan to use AI features.
4.  **Deploy**: Vercel will automatically detect the Vite configuration and deploy the app.

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
