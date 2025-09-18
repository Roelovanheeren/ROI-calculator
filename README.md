# Barn Gym Advanced ROI Calculator

A sophisticated lead generation and qualification tool that calculates the ROI of corporate wellness programs, captures leads, and generates personalized PDF reports.

## Features

### 🧮 Advanced ROI Calculator
- Real-time calculations based on industry benchmarks
- Tax deduction considerations (25% UK Corporation Tax relief)
- Professional UI with Barn Gym branding
- Mobile responsive design
- Lead scoring algorithm for prospect qualification

### 📊 Professional PDF Reports
- 4-page comprehensive business case reports
- Executive summary with key findings
- Detailed financial breakdown
- Implementation roadmap
- Industry benchmarks and peer comparisons

### 🎯 Lead Capture & CRM Integration
- Strategic email gate after showing initial value
- GoHighLevel CRM integration
- Automatic lead scoring and qualification
- Contact and opportunity creation in CRM

### 📧 Automated Email System
- Professional HTML email templates
- PDF report delivery
- Email nurture sequences based on lead score
- Personalized content for each prospect

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **PDF Generation**: jsPDF
- **Email**: Nodemailer with SMTP/Gmail integration
- **CRM**: GoHighLevel API integration
- **Deployment**: Vercel (recommended)

## Quick Start

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd roi-calculator

# Install dependencies
npm install

# Create environment file
cp env.example .env.local

# Configure environment variables (see Environment Setup below)
```

### 2. Environment Setup

Create a `.env.local` file with the following variables:

```env
# Required
NEXTAUTH_URL=http://localhost:3000
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# Optional (for full functionality)
GHL_API_KEY=your_ghl_api_key
GHL_DEFAULT_USER_ID=your_user_id
GHL_PIPELINE_ID=your_pipeline_id
```

### 3. Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the calculator.

## Environment Variables

### Required Variables

- `EMAIL_USER`: Gmail account for sending reports
- `EMAIL_PASSWORD`: Gmail App Password (not regular password)
- `NEXTAUTH_URL`: Your application URL

### Optional Variables (Enhanced Features)

- `GHL_API_KEY`: GoHighLevel API key for CRM integration
- `GHL_DEFAULT_USER_ID`: Default user ID for lead assignment
- `GHL_PIPELINE_ID`: Pipeline ID for opportunities

### Email Setup Options

#### Option 1: Gmail (Recommended for testing)
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
```

#### Option 2: Custom SMTP
```env
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASSWORD=your-smtp-password
```

## Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub/GitLab**
2. **Connect to Vercel**
3. **Set Environment Variables** in Vercel dashboard
4. **Deploy**

```bash
# Using Vercel CLI
npm i -g vercel
vercel --prod
```

### Environment Variables in Production

Set these in your Vercel dashboard:

- `GHL_API_KEY`
- `EMAIL_USER`
- `EMAIL_PASSWORD`
- `GHL_DEFAULT_USER_ID`
- `GHL_PIPELINE_ID`

## GoHighLevel Integration Setup

### 1. Get API Key
1. Log into your GoHighLevel account
2. Go to Settings → API & Webhooks
3. Create new API key with required permissions

### 2. Configure Pipeline
1. Create a new pipeline for "Corporate Wellness Leads"
2. Copy the Pipeline ID
3. Add to environment variables

### 3. Required Permissions
- Contacts: Create, Read, Update
- Opportunities: Create, Read, Update
- Pipelines: Read

## Email Integration Setup

### Gmail Setup (Easiest)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Add to environment variables**

### Professional Email Setup

For production, consider using:
- **SendGrid** (recommended for high volume)
- **Mailgun** (developer-friendly)
- **AWS SES** (cost-effective)

## Lead Scoring Algorithm

The system automatically scores leads based on:

- **Company Size** (10-40 points)
  - 50-200 employees: 10 points
  - 200-500 employees: 20 points
  - 500-1000 employees: 30 points
  - 1000+ employees: 40 points

- **Timeline** (10-40 points)
  - Immediate: 40 points
  - 3 months: 30 points
  - 6 months: 20 points
  - Just researching: 10 points

- **Current Initiatives** (5-30 points)
  - None: 30 points (highest opportunity)
  - Basic EAP: 20 points
  - Gym Discounts: 15 points
  - Comprehensive: 5 points

- **ROI Potential** (10-20 points)
  - >300% ROI: 20 points
  - >200% ROI: 15 points
  - >100% ROI: 10 points

## ROI Calculation Methodology

### Current Costs Calculation
- **Sick Days**: Employees × Sick Days × (Salary ÷ 260 working days)
- **Turnover**: Employees × Turnover Rate × (75% of salary replacement cost)
- **Healthcare**: Employees × Annual Healthcare Cost per Employee
- **Productivity Loss**: Employees × Salary × 15% (industry estimate)

### Projected Savings (Industry Benchmarks)
- **Absenteeism Reduction**: 25% of current sick day costs
- **Turnover Reduction**: 20% of current turnover costs
- **Healthcare Reduction**: 15% of current healthcare costs
- **Productivity Gain**: 10% improvement on productivity losses

### Investment Calculation
- **Program Cost**: £200 per employee per month
- **Tax Relief**: 25% UK Corporation Tax deduction
- **Net Cost**: 75% of gross program cost

## File Structure

```
roi-calculator/
├── app/
│   ├── api/
│   │   ├── submit-lead/route.ts    # Lead capture API
│   │   ├── generate-pdf/route.ts   # PDF generation
│   │   └── send-email/route.ts     # Email delivery
│   ├── globals.css                 # Global styles
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Main page
├── components/
│   └── ROICalculator.tsx          # Main calculator component
├── public/                        # Static assets
├── package.json                   # Dependencies
├── tailwind.config.js             # Tailwind configuration
├── next.config.js                 # Next.js configuration
└── README.md                      # This file
```

## Customization

### Branding
- Update logo URL in `ROICalculator.tsx`
- Modify colors in `tailwind.config.js`
- Customize email templates in `send-email/route.ts`

### Calculations
- Adjust industry benchmarks in `ROICalculator.tsx`
- Modify pricing in the calculation functions
- Update tax rates for different countries

### Lead Scoring
- Customize scoring algorithm in `calculateLeadScore()` function
- Add new scoring criteria based on your business needs

## Performance Optimizations

- Server-side PDF generation for fast loading
- Optimized images and assets
- Responsive design for all devices
- Progressive enhancement approach

## Security Features

- Environment variable protection
- Input validation and sanitization
- CSRF protection via Next.js
- Rate limiting on API endpoints (configurable)

## Monitoring & Analytics

### Built-in Tracking
- Lead submission tracking
- PDF generation metrics
- Email delivery status
- Conversion funnel analytics

### External Integrations
- Google Analytics (configurable)
- Facebook Pixel (configurable)
- Custom event tracking

## Support

For technical support or customization requests:
- Email: support@barn-gym.com
- Documentation: [Link to docs]
- Issues: [GitHub Issues]

## License

© 2024 Barn Gym. All rights reserved.

---

**Pro Tip**: Start with the basic email integration and add GoHighLevel CRM integration once you have your API key. The calculator works perfectly without it!
