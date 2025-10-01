# TechVaults Academy - Production Deployment Guide

## 🚀 Render Deployment Instructions

### Prerequisites
- GitHub repository with your code
- Supabase project with database configured
- Render account (free tier available)

### Step 1: Prepare Your Repository

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Production ready - Render deployment"
   git push origin main
   ```

2. **Ensure all files are committed:**
   - `render.yaml` ✅
   - `package.json` ✅ (with production scripts)
   - All source code ✅

### Step 2: Create Render Service

1. **Go to Render Dashboard:**
   - Visit: https://render.com/dashboard
   - Click "New +" → "Web Service"

2. **Connect GitHub Repository:**
   - Select your TechVaults Academy repository
   - Choose the main branch

3. **Configure Build Settings:**
   ```
   Build Command: pnpm install && pnpm build
   Start Command: pnpm start
   ```

### Step 3: Environment Variables

Set these in Render Dashboard → Environment:

```
NODE_ENV=production
VITE_SUPABASE_URL=https://yvfqzpofebspwidnpaph.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2ZnF6cG9mZWJzcHdpZG5wYXBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNDI2NDAsImV4cCI6MjA3NDgxODY0MH0.Fwl970ABRqgiwgQ8XVXXUwdJE9-wqBtf-teGGc5uwvg
VITE_APP_URL=https://your-app-name.onrender.com
VITE_COMPANY_EMAIL=academy@techvaults.com
```

### Step 4: Supabase Configuration

1. **Update Supabase Site URL:**
   - Go to Supabase Dashboard → Authentication → Settings
   - Set Site URL: `https://your-app-name.onrender.com`
   - Add Redirect URLs: `https://your-app-name.onrender.com/**`

2. **Email Templates (Optional):**
   - Customize email confirmation templates
   - Update sender information

### Step 5: Deploy

1. **Deploy the Service:**
   - Click "Create Web Service"
   - Wait for build to complete (5-10 minutes)

2. **Get Your Production URL:**
   - Render will provide: `https://your-app-name.onrender.com`
   - Update `VITE_APP_URL` with this URL

### Step 6: Post-Deployment

1. **Test the Application:**
   - Visit your production URL
   - Test login with admin credentials
   - Test student registration flow
   - Verify all features work

2. **Update Admin Instructions:**
   - Share production URL with your team
   - Update any documentation

## 🔧 Production Optimizations

### Build Optimizations
- ✅ TypeScript compilation
- ✅ Vite production build
- ✅ Tree shaking enabled
- ✅ Code splitting

### Security Features
- ✅ Environment variables secured
- ✅ HTTPS enforced
- ✅ CORS configured
- ✅ RLS policies active

### Performance
- ✅ Static asset optimization
- ✅ Bundle size optimization
- ✅ Lazy loading enabled

## 🚨 Important Notes

1. **Free Tier Limitations:**
   - App sleeps after 15 minutes of inactivity
   - First request after sleep takes 30+ seconds
   - Consider upgrading for production use

2. **Environment Variables:**
   - Never commit `.env` files to Git
   - Use Render's environment variable system
   - Keep Supabase keys secure

3. **Database:**
   - Supabase handles database scaling
   - RLS policies are active in production
   - Regular backups recommended

## 📋 Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Render service created
- [ ] Environment variables set
- [ ] Supabase site URL updated
- [ ] Build successful
- [ ] Application accessible
- [ ] Login functionality tested
- [ ] Registration flow tested
- [ ] Admin features working
- [ ] Student features working

## 🆘 Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Check environment variables
   - Verify package.json scripts
   - Review build logs

2. **Runtime Errors:**
   - Check browser console
   - Verify Supabase connection
   - Review environment variables

3. **Authentication Issues:**
   - Verify Supabase site URL
   - Check redirect URLs
   - Review RLS policies

### Support:
- Render Documentation: https://render.com/docs
- Supabase Documentation: https://supabase.com/docs
- Vite Documentation: https://vitejs.dev/guide

## 🎉 Success!

Once deployed, your TechVaults Academy will be live at:
`https://your-app-name.onrender.com`

Share this URL with your team and students!
