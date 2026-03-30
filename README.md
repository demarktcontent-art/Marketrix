# Marketrix - Marketing Planner

A comprehensive marketing planner for managing products, content, and ads.

## Features
- Product Management
- Content Planning (Monthly & Ideas)
- Ads Planning & Feedback
- Dashboard with Analytics
- Settings for Company & Users

## Deployment

### GitHub Pages (Recommended)

This project is configured for automated deployment to GitHub Pages.

1.  **Push to GitHub**: Push this repository to a new GitHub repository.
2.  **Enable Pages**:
    -   Go to **Settings** > **Pages** in your GitHub repository.
    -   Under **Build and deployment** > **Source**, select **GitHub Actions**.
3.  **Automatic Build**: The included GitHub Action will automatically build and deploy your app whenever you push to the `main` branch.

### Vercel

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
