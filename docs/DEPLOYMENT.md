# Deployment Guide

Complete step-by-step guide for deploying the Workshop Checklist application to Vercel with Supabase backend.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Vercel Setup](#vercel-setup)
3. [Environment Variables](#environment-variables)
4. [Database Configuration](#database-configuration)
5. [Custom Domain](#custom-domain)
6. [Database Migrations](#database-migrations)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- GitHub repository with project code
- Vercel account (free at https://vercel.com)
- Supabase account (free at https://supabase.com)
- Supabase project created and configured
- Database tables created and migrated

## Vercel Setup

### Step 1: Prepare GitHub Repository

1. Push your code to GitHub
2. Ensure `.env.local` is in `.gitignore`
3. Commit the `.vercelignore`, `vercel.json`, and `README.md` files:
   ```bash
   git add .vercelignore vercel.json README.md
   git commit -m "feat: add Vercel deployment configuration"
   git push
   ```

### Step 2: Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Select your GitHub repository
4. Choose project name (e.g., `workshop-checklist`)
5. Framework preset: **Vite** will be auto-detected
6. Click "Deploy"

### Step 3: Initial Deployment

Vercel will attempt to build and deploy. It will likely fail due to missing environment variables. This is expected.

## Environment Variables

### Step 1: Gather Supabase Credentials

From your Supabase project dashboard:

1. Go to **Settings** → **API**
2. Copy your **Project URL** (e.g., `https://xyzxyzxyz.supabase.co`)
3. Copy your **anon public key** under "Project API keys"

### Step 2: Add to Vercel

In Vercel dashboard for your project:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables (same for all environments):

   | Key | Value |
   |-----|-------|
   | `VITE_SUPABASE_URL` | Your Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | Your Supabase anon public key |

3. Click "Save"

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Click the three dots on the failed deployment
3. Select "Redeploy" or
4. Push a new commit to trigger automatic deployment

## Database Configuration

### Step 1: Create Supabase Tables

If not already created, create the following tables in your Supabase project:

#### Users Table
(Usually auto-created by Supabase Auth)

```sql
-- Supabase automatically creates users table for auth
-- Additional profile fields can be added as needed
```

#### Categories Table

```sql
CREATE TABLE categories (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_categories_user_id ON categories(user_id);
```

#### Products Table

```sql
CREATE TABLE products (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  deadline TIMESTAMP,
  purchased BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_purchased ON products(purchased);
```

#### Product Links Table

```sql
CREATE TABLE product_links (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  image_url TEXT,
  price TEXT,
  platform TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_product_links_product_id ON product_links(product_id);
```

### Step 2: Set Row-Level Security (RLS)

Enable RLS on all tables and add policies:

```sql
-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_links ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Users can view own categories" ON categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- Products policies
CREATE POLICY "Users can view own products" ON products
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" ON products
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" ON products
  FOR DELETE USING (auth.uid() = user_id);

-- Product links policies
CREATE POLICY "Users can view own product links" ON product_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products WHERE products.id = product_links.product_id 
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own product links" ON product_links
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM products WHERE products.id = product_links.product_id 
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own product links" ON product_links
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM products WHERE products.id = product_links.product_id 
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own product links" ON product_links
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM products WHERE products.id = product_links.product_id 
      AND products.user_id = auth.uid()
    )
  );
```

### Step 3: Test Database Connection

After deploying to Vercel:

1. Open your deployed application
2. Try to sign up with a test email
3. Check that categories and products can be created
4. Verify data appears in Supabase dashboard

## Custom Domain

### Step 1: Add Domain to Vercel

1. In Vercel project settings → **Domains**
2. Enter your custom domain (e.g., `checklist.example.com`)
3. Follow DNS configuration instructions for your registrar

### Step 2: Configure DNS

Vercel will provide DNS records to add. This varies by registrar (GoDaddy, Namecheap, Route 53, etc.):

**Example (CNAME):**
```
subdomain: checklist
type: CNAME
value: cname.vercel-dns.com.
```

### Step 3: Verify Domain

1. Wait for DNS propagation (can take 24-48 hours)
2. Vercel will show "Valid Configuration" when ready
3. Your app will be accessible at your custom domain

## Database Migrations

### On Each Deployment

Vercel redeploys when you push to your repository. Database tables remain unchanged unless you explicitly run migrations.

### Manual Migrations

To add new tables or modify schema after deployment:

1. Open Supabase SQL Editor
2. Copy SQL migration code
3. Execute in SQL editor
4. Test your application

## Monitoring & Maintenance

### Vercel Monitoring

1. **Deployments**: Monitor build logs for errors
2. **Analytics**: Track page views and performance
3. **Error Tracking**: Set up alerts for failed deployments

### Supabase Monitoring

1. **Database**: Monitor query performance in SQL section
2. **Auth**: Check authentication logs
3. **Storage**: Monitor database usage

### Regular Maintenance

- **Weekly**: Review error logs
- **Monthly**: Check database performance and optimize queries
- **Quarterly**: Review and update dependencies

## Troubleshooting

### Build Fails with "Missing Environment Variables"

**Solution:**
1. Go to Vercel project settings → Environment Variables
2. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
3. Redeploy the project

### Application Shows Blank Screen

**Solution:**
1. Check browser console for errors (F12)
2. Verify environment variables are correct
3. Check Supabase project status (not deleted/paused)
4. Clear browser cache and reload

### Database Connection Errors

**Solution:**
1. Verify Supabase project is active
2. Check that user table exists
3. Ensure RLS policies allow connections
4. Test connection with SQL query in Supabase SQL Editor:
   ```sql
   SELECT COUNT(*) FROM auth.users;
   ```

### Authentication Not Working

**Solution:**
1. Go to Supabase Auth settings
2. Verify email provider is enabled
3. Check email templates exist
4. Ensure auth redirect URLs include deployed domain:
   - Add `https://yourdomain.com/`
   - Add `https://yourdomain.com/login`

### Deployed App Looks Different Than Local

**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Check CSS is loading: inspect element styles
4. Verify all environment variables are deployed

### Database Quotas Exceeded

**Solution:**
1. Upgrade Supabase plan
2. Archive old data
3. Optimize queries to reduce row reads

## Performance Optimization

### Vercel

- Auto-scaling handles traffic
- CDN distributes static assets globally
- Monitor analytics for slowdowns

### Supabase

- Ensure indexes exist on frequently filtered columns
- Use pagination for large result sets
- Cache queries in application when appropriate

## Security Checklist

Before production deployment:

- [ ] Environment variables set in Vercel (not in code)
- [ ] RLS policies enabled on all tables
- [ ] `.env.local` in `.gitignore`
- [ ] Sensitive data not logged
- [ ] HTTPS enabled (Vercel auto-enables)
- [ ] Supabase Auth email provider configured
- [ ] Custom domain configured with HTTPS

## Rollback Instructions

If deployment has issues:

1. In Vercel dashboard → **Deployments**
2. Find previous stable deployment
3. Click three dots → "Promote to Production"
4. Previous version becomes active
5. Investigate and fix issues before redeploying

## Next Steps

After successful deployment:

1. Test all features thoroughly
2. Set up monitoring and alerts
3. Document any custom configurations
4. Plan regular backup strategy
5. Monitor performance metrics

## Support

For deployment issues:

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Repository Issues**: Report bugs on GitHub
