# 🚀 Pre-Launch Checklist

Use this checklist before going live to real users.

## ✅ Phase 1: Infrastructure Setup

### Supabase
- [ ] Project created on Supabase
- [ ] Project URL saved
- [ ] Anon key saved
- [ ] Service role key saved (kept secret!)
- [ ] Database connection string saved
- [ ] Edge functions deployed successfully
- [ ] All environment secrets set in Supabase

### Stripe
- [ ] Stripe account created
- [ ] Test mode API keys obtained
- [ ] Live mode API keys obtained (when ready)
- [ ] Products created (5 exam types at €5/month each)
- [ ] Test payment successful
- [ ] Webhook endpoint configured (optional but recommended)

### Hosting (Vercel/Netlify)
- [ ] GitHub repository created and pushed
- [ ] Vercel/Netlify project connected
- [ ] Environment variables configured
- [ ] Build successful
- [ ] Site accessible via URL
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic)

---

## ✅ Phase 2: Application Configuration

### Authentication
- [ ] Site URL configured in Supabase Auth settings
- [ ] Redirect URLs configured
- [ ] Email confirmation enabled/disabled as desired
- [ ] First user account created
- [ ] First user promoted to admin via SQL
- [ ] Admin panel accessible to admin user
- [ ] Email templates reviewed (optional customization)

### Database & Questions
- [ ] Questions imported via Admin Panel
- [ ] Question counts verified in Diagnostics tab
- [ ] All 5 exam types have questions:
  - [ ] Jet Ski (target: 120+ questions)
  - [ ] Small Boat (target: 120+ questions)
  - [ ] Big Boat (target: 120+ questions)
  - [ ] Yacht (target: 120+ questions)
  - [ ] Navigation (target: 120+ questions)
- [ ] Sample exam tested (questions load correctly)

### Payment System
- [ ] Test payment successful using test card
- [ ] Subscription properly granted after payment
- [ ] User can access paid exams after purchase
- [ ] 30-day expiration works correctly
- [ ] Receipt email sent (check spam folder)

---

## ✅ Phase 3: Feature Testing

### User Flow - Non-Logged-In User
- [ ] Homepage loads correctly
- [ ] Navigation works (Home, Pricing, Partners)
- [ ] Language selector works (4 languages)
- [ ] Region selector works
- [ ] Dark mode toggle works
- [ ] Responsive on mobile (iPhone/Android)
- [ ] Can click "Login" button
- [ ] Can navigate to signup

### User Flow - Sign Up
- [ ] Signup form works
- [ ] Email validation works
- [ ] Password requirements enforced
- [ ] Confirmation email sent (if enabled)
- [ ] User redirected after signup
- [ ] User automatically logged in

### User Flow - Login
- [ ] Login form works
- [ ] Correct credentials accepted
- [ ] Wrong credentials rejected with error message
- [ ] "Forgot password" link works (if implemented)
- [ ] User redirected to account page after login

### User Flow - Mock Exams (Free Tier)
- [ ] Can select exam type
- [ ] Can select "Mock Mode"
- [ ] 10 sample questions load
- [ ] Questions display correctly
- [ ] Images load (if applicable)
- [ ] Can select answers
- [ ] Can navigate between questions
- [ ] Timer doesn't run in study mode
- [ ] Timer runs in exam mode
- [ ] Can review answers in study mode
- [ ] Submit exam works
- [ ] Results page displays correctly
- [ ] Can retake exam

### User Flow - Payment & Subscription
- [ ] "Upgrade to Full Exam" button visible
- [ ] Payment page loads
- [ ] Can select multiple exam types
- [ ] Total price calculates correctly (€5 per exam type)
- [ ] Stripe checkout loads
- [ ] Test payment completes successfully
- [ ] Redirected to success page
- [ ] Subscription status updates in account page
- [ ] Expiration date shown (30 days)

### User Flow - Paid Exams
- [ ] Can select purchased exam type
- [ ] Can select "Full Exam Mode"
- [ ] 40 questions load from database
- [ ] Questions are random (different each time)
- [ ] Timer shows 60 minutes
- [ ] Timer counts down
- [ ] All question types work:
  - [ ] Single-choice questions
  - [ ] Multiple-choice questions (checkboxes)
  - [ ] Questions with images
- [ ] Point system works (1, 2, 3 points per question)
- [ ] Max 6 points loss to pass enforced
- [ ] Submit exam works
- [ ] Results saved
- [ ] Can view exam history
- [ ] Can review previous exam answers

### User Flow - Account Page
- [ ] User info displays correctly
- [ ] Active subscriptions shown
- [ ] Expiration dates shown
- [ ] Exam history displayed
- [ ] Language preference saves
- [ ] Dark mode preference saves
- [ ] Can logout
- [ ] After logout, redirected to home

### User Flow - Admin Panel
- [ ] Only accessible to admin users
- [ ] Non-admin users see "Access Denied"
- [ ] **Users Tab**:
  - [ ] All users listed
  - [ ] User details shown (email, name, role, subscriptions)
  - [ ] Can grant licenses
  - [ ] Can revoke licenses
  - [ ] Can make users admin
  - [ ] Changes reflected immediately
- [ ] **Import Questions Tab**:
  - [ ] CSV format instructions visible
  - [ ] Can upload CSV file
  - [ ] Import progress shown
  - [ ] Success/error messages display
  - [ ] Questions imported correctly
- [ ] **Diagnostics Tab**:
  - [ ] Question counts by exam type
  - [ ] Total questions count
  - [ ] Database status
  - [ ] Environment variables status
  - [ ] Error logs (if any)

---

## ✅ Phase 4: Cross-Browser & Device Testing

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Devices
- [ ] iPhone Safari
- [ ] Android Chrome
- [ ] iPad Safari
- [ ] Android Tablet

### Responsive Breakpoints
- [ ] Mobile (320px - 640px)
- [ ] Tablet (641px - 1024px)
- [ ] Desktop (1025px+)
- [ ] Large desktop (1440px+)

### Dark Mode
- [ ] Toggle works on all pages
- [ ] Preference persists after reload
- [ ] All text readable in dark mode
- [ ] All components styled correctly in dark mode
- [ ] Images/SVGs visible in dark mode

---

## ✅ Phase 5: Performance & Security

### Performance
- [ ] Homepage loads in < 3 seconds
- [ ] Exam page loads in < 3 seconds
- [ ] No console errors in browser
- [ ] No console warnings (or minimal)
- [ ] Images optimized
- [ ] Lazy loading works (if implemented)

### Security
- [ ] Service role key NOT exposed in frontend
- [ ] API endpoints require authentication
- [ ] Admin endpoints require admin role
- [ ] SQL injection protected (Supabase handles this)
- [ ] XSS protected (React handles this)
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Environment variables not committed to git
- [ ] .env.local in .gitignore

### SEO (Optional but Recommended)
- [ ] Page titles set
- [ ] Meta descriptions set
- [ ] Open Graph tags added
- [ ] Twitter Card tags added
- [ ] robots.txt created
- [ ] sitemap.xml created (optional)
- [ ] Google Analytics added (optional)

---

## ✅ Phase 6: Legal & Compliance

### Content & Disclaimers
- [ ] Disclaimer visible: "For training purposes only - not official certification"
- [ ] Privacy Policy page created
- [ ] Terms of Service page created
- [ ] Cookie notice (if applicable)
- [ ] GDPR compliance (if targeting EU users):
  - [ ] User data collection disclosed
  - [ ] Users can delete their data
  - [ ] Data processing agreement reviewed

### Stripe Compliance
- [ ] Business details in Stripe account
- [ ] Tax info configured (if required)
- [ ] Bank account for payouts configured
- [ ] Stripe account verified

---

## ✅ Phase 7: Content Review

### Translations
- [ ] English translations complete
- [ ] Bulgarian translations complete
- [ ] Spanish translations complete
- [ ] Greek translations complete
- [ ] No "undefined" or missing translation keys
- [ ] All UI elements translated

### Question Quality
- [ ] Questions reviewed for accuracy
- [ ] No duplicate questions
- [ ] Correct answers verified
- [ ] Images load correctly
- [ ] Points (difficulty) assigned correctly
- [ ] All 5 exam types balanced (similar # questions)

---

## ✅ Phase 8: Monitoring & Support

### Error Tracking
- [ ] Supabase function logs reviewed
- [ ] No critical errors in logs
- [ ] Error handling in place for:
  - [ ] Payment failures
  - [ ] Question loading failures
  - [ ] Authentication errors
  - [ ] Network timeouts

### User Support
- [ ] Contact email configured
- [ ] Support page created (optional)
- [ ] FAQ page created (optional)
- [ ] Help documentation prepared

### Analytics (Optional)
- [ ] Google Analytics installed
- [ ] Conversion tracking set up
- [ ] User flow tracking configured
- [ ] Payment success tracking

---

## ✅ Phase 9: Go Live Decision

### Business Readiness
- [ ] Pricing strategy confirmed (€5/month per exam)
- [ ] Subscription model confirmed (30 days)
- [ ] Refund policy determined
- [ ] Customer support plan in place
- [ ] Marketing materials prepared

### Switch to Production Stripe
- [ ] Stripe account activated for live payments
- [ ] Live API keys obtained
- [ ] Environment variables updated with live keys:
  ```bash
  supabase secrets set STRIPE_SECRET_KEY=sk_live_...
  ```
  - Frontend (Vercel/Netlify):
  ```
  VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
  ```
- [ ] Test live payment with real card
- [ ] Webhook endpoint updated to use live keys
- [ ] Products recreated in live mode (or activated)

### Final Checks
- [ ] All features tested in production environment
- [ ] No test data in production database
- [ ] Test users removed or cleaned up
- [ ] Backups configured (Supabase handles this)
- [ ] Domain name pointing to app
- [ ] SSL certificate valid
- [ ] Email deliverability tested

---

## 🎉 Launch!

- [ ] Announce to initial users (beta testers, friends, family)
- [ ] Monitor for first 24 hours
- [ ] Check payment confirmations
- [ ] Respond to user feedback
- [ ] Fix any critical bugs immediately

### Post-Launch Monitoring (First Week)
- [ ] Daily check of error logs
- [ ] Daily check of payment success rate
- [ ] User feedback collection
- [ ] Performance monitoring
- [ ] Conversion rate tracking

---

## 📞 Emergency Contacts & Resources

**If something goes wrong:**

1. **Supabase issues**: Check status at https://status.supabase.com
2. **Stripe issues**: Check status at https://status.stripe.com
3. **Vercel issues**: Check status at https://www.vercel-status.com

**Rollback procedures:**
- Vercel: Redeploy previous version via dashboard
- Edge Functions: `supabase functions deploy server` (deploys current code)
- Database: Restore from Supabase backup (Settings → Database → Backups)

---

## 📊 Success Metrics to Track

- [ ] User signups per day
- [ ] Mock exam completions
- [ ] Payment conversion rate (signups → purchases)
- [ ] Average questions per exam type
- [ ] User retention (30-day)
- [ ] Payment success rate
- [ ] Average exam score
- [ ] Most popular exam type

---

**Good luck with your launch! 🚀⚓🛥️**

Remember: It's okay if everything isn't perfect on day 1. The most important thing is that core functionality works:
1. Users can sign up
2. Users can take mock exams
3. Users can pay
4. Users can take paid exams
5. No critical security issues

Everything else can be improved iteratively! 🎯
