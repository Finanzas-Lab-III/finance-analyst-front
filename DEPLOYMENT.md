# Deployment Guide for Vercel

This document explains how to deploy the Finance Analyst Frontend to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. Your backend APIs deployed and accessible (optional for static deployment)
3. Git repository (GitHub, GitLab, or Bitbucket)

## Quick Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard

1. **Connect Your Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository

2. **Configure Build Settings**:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Environment Variables**:
   Set the following environment variables in the Vercel dashboard:
   ```
   NEXT_PUBLIC_SERVICE_URL=https://your-ai-analysis-api.com
   NEXT_PUBLIC_FILE_SERVICE_URL=https://your-file-service-api.com
   NEXT_PUBLIC_BUDGET_ANALYSIS_URL=https://your-budget-analysis-api.com
   ```

4. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically build and deploy your application

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Set Environment Variables**:
   ```bash
   vercel env add NEXT_PUBLIC_SERVICE_URL
   vercel env add NEXT_PUBLIC_SERVICE_URL
   vercel env add NEXT_PUBLIC_SERVICE_URL
   ```

5. **Redeploy with Environment Variables**:
   ```bash
   vercel --prod
   ```

## Configuration Files

The following files are configured for optimal Vercel deployment:

### `vercel.json`
Contains Vercel-specific configuration including:
- Function timeout settings
- CORS headers for API routes
- Build and output settings

### `next.config.ts`
Configured with:
- `output: 'standalone'` for optimized builds
- Image domain configuration
- Build error tolerance for deployment
- ESLint/TypeScript error handling

### `.env.example`
Template for environment variables needed in production.

## Environment Variables

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Main AI analysis API endpoint | `https://api.example.com` |
| `NEXT_PUBLIC_FILE_SERVICE_URL` | File service API endpoint | `https://files.example.com` |
| `NEXT_PUBLIC_BUDGET_ANALYSIS_URL` | Budget analysis API endpoint | `https://budget.example.com` |

### Setting Environment Variables in Vercel

1. Go to your project in the Vercel dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable with appropriate values for your environment
4. Redeploy the application

## Build Optimization

The project is configured to:
- Skip TypeScript strict checking during builds
- Ignore ESLint errors during builds
- Use standalone output for better performance
- Handle missing environment variables gracefully

## Troubleshooting

### Build Failures

1. **TypeScript Errors**: The build is configured to ignore TypeScript errors. If you want to fix them:
   - Remove `ignoreBuildErrors: true` from `next.config.ts`
   - Fix TypeScript issues in the codebase

2. **ESLint Errors**: Similar to TypeScript, ESLint errors are ignored:
   - Remove `ignoreDuringBuilds: true` from the ESLint config in `next.config.ts`
   - Fix ESLint issues

3. **Environment Variables**: If APIs are not available:
   - The app will fall back to localhost URLs in development
   - Ensure production APIs are accessible and CORS-enabled

### Runtime Issues

1. **API Connection Errors**: Check that:
   - Environment variables are correctly set
   - Backend APIs are deployed and accessible
   - CORS is properly configured on your backend

2. **Image Loading Issues**: Verify:
   - Image domains are added to `next.config.ts`
   - External image sources are accessible

## Monitoring and Analytics

Vercel provides built-in:
- Performance monitoring
- Error tracking
- Analytics dashboard
- Build and deployment logs

Access these features in your Vercel project dashboard.

## Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to Domains
3. Add your custom domain
4. Configure DNS records as instructed

## Continuous Deployment

Once connected to your Git repository, Vercel will automatically:
- Deploy on every push to the main branch
- Create preview deployments for pull requests
- Run builds and tests automatically

## Support

For deployment issues:
- Check [Vercel Documentation](https://vercel.com/docs)
- Review build logs in the Vercel dashboard
- Check the [Next.js deployment guide](https://nextjs.org/docs/deployment) 