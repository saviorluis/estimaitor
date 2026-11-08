# EstimAItor - AI Commercial Cleaning Estimator for Construction Projects

An AI-powered web application for estimating commercial post-construction cleanup projects. This tool helps cleaning companies quickly generate accurate estimates based on project type, square footage, and other factors.

## Features

- **Project Type Selection**: Different rates for restaurants, medical facilities, offices, retail spaces, industrial spaces, educational facilities, hotels, and jewelry stores
- **Cleaning Type Options**: Rough Clean (80% of the base rate), Final Clean (120%), Rough & Final Clean (140%), or Rough, Final & Touchup (160%)
- **VCT Flooring Calculation**: Additional costs for vinyl composition tile flooring
- **Travel Cost Estimation**: Charges a $100 travel fee for the first hour. One-way trips of 40 miles or less stay in that first-hour bucket
- **Staffing Recommendations**: Suggests the optimal number of cleaners based on project size
- **Time Estimation**: Calculates estimated completion time based on project parameters
- **Adjustable Staffing**: Allows adjustment of cleaner count to see impact on project duration
- **Urgency Pricing**: Scale from 1-10. Level 1 is the normal price. Level 10 adds 40%
- **Profit Markup**: Optional 20% markup on the pre-tax subtotal
- **Overnight Stay Calculation**: Includes per diem and hotel costs for multi-day projects
- **Pressure Washing**: Calculate costs for pressure washing concrete, driveways, and exterior surfaces
- **Window Cleaning**: Estimate costs for standard, large, and high-access windows
- **Display Case Cleaning**: Special pricing for jewelry store display cases with detailed cleaning
- **Professional Quote Generation**: Create and download professional quotes in PDF or Word format
- **AI-Powered Recommendations**: Get project-specific cleaning recommendations, equipment suggestions, and efficiency tips
- **Mobile-Friendly Design**: Use the app on any device with a responsive, modern UI
- **Data Persistence**: Estimates are saved automatically for future reference
- **Nearby Projects Showcase**: View completed projects in your area with an interactive map
- **Contact Form**: Easy way for potential clients to reach out for quotes or questions

## Pricing Information

Final Cleaning starts from a base rate of $0.18 per square foot. A project-type multiplier is applied to that base, then the cleaning-type multiplier below. These are the multipliers the estimator charges.

Project-type multipliers include office and retail at 1.0, fast food at 1.2, industrial and grocery at 1.3, hotel at 1.35, restaurant at 1.5, and medical at 1.6. The full table is `PROJECT_TYPE_MULTIPLIERS` in `src/lib/constants.ts`.

### Cleaning Type Multipliers

- Rough Clean: 0.80× the base rate
- Final Clean: 1.20× the base rate, including touchup
- Rough & Final Clean: 1.40× the base rate
- Rough, Final & Touchup: 1.60× the base rate

An office Final Clean is $0.18 × 1.0 × 1.20 per square foot before travel, fees, markup, and tax.

### Additional Costs

- **VCT Flooring**: Priced on its own area, from $2.20 per square foot under 1,000 sq ft down to $1.50 per square foot above 5,000 sq ft. That area is removed from the building clean instead of being added on top.
- **Travel**: $100 for the first hour. One-way trips of 40 miles or less use that flat fee.
- **Scheduling and invoicing**: $99 each.
- **Mobilization**: $150 up to 2,500 sq ft, $250 through 10,000 sq ft, and $400 above that. Listed complex project types use $500.
- **Urgency**: Level 1 is 1.00×. Level 10 is 1.40×.
- **Markup**: Optional 20% on the pre-tax subtotal.
- **Sales tax**: The company tax state. The default is North Carolina at 7%.
- **Overnight stay**: $90 per diem per person per day, and $180 per hotel room per night, with two people per room.
- **Pressure Washing**: Soft wash $0.18/sq ft with a $235 minimum, roof wash $0.50/sq ft, driveway $0.20/sq ft, deck $1.00/sq ft, and a $1,800 daily rate. An exterior chimney wash is $95.
- **Window Cleaning**:
  - Standard windows: $18 each
  - Large windows: 1.6× the standard rate
  - High-access windows: 2.2× the standard rate
  - Standalone window jobs bill one side at half the window labor, and Poor condition adds 15% to that window labor. The window-labor minimum is $150.
- **Display Case Cleaning**: $30 per display case

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/saviorluis/estimaitor.git
cd estimaitor
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. (Optional) Set up email
   To send janitorial contracts by email, create a `.env.local` file with a Resend API key:

```
RESEND_API_KEY=your_resend_api_key_here
```

4. Start the development server

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Using the AI Recommendations

After calculating an estimate, you can get AI-powered recommendations specific to your project by clicking the "Get AI Recommendations" button. The AI will provide:

1. Special cleaning considerations for your project type and cleaning level
2. Recommended equipment and supplies specific to the cleaning type
3. Potential challenges and how to address them
4. Tips to improve efficiency, especially considering the urgency level
5. Safety considerations
6. Overnight stay recommendations (if applicable)
7. Strategies for meeting urgent deadlines (for high urgency projects)

## Quote Generation

The application allows you to generate professional quotes that can be:

1. Viewed directly in the browser
2. Downloaded as PDF documents
3. Downloaded as Word documents compatible with Google Docs
4. Printed for client meetings

Quotes include:

- Company and client information
- Project details and scope of work
- Itemized pricing
- Terms and conditions
- Signature areas for approval

## Nearby Projects

The Nearby Projects feature allows you to:

1. View completed cleaning projects in your geographic area
2. See project details including type, address, and completion date
3. Browse through project photos
4. Filter projects by type or distance
5. Contact for references or similar services

This feature helps potential clients see your company's experience with similar projects in their area.

## Contact Form

The integrated contact form allows potential clients to:

1. Submit inquiries directly through the application
2. Specify project details for more accurate responses
3. Request quotes for specific cleaning needs
4. Schedule consultations or site visits
5. Receive prompt responses to their inquiries

The form includes validation and sends notifications to your team when new inquiries are received.

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- React Hook Form
- PDF generation
- Geolocation API
- Form validation

## License

MIT

## Deployment Options

### 1. Deploy to Vercel (Recommended)

The easiest way to deploy your EstimAItor application is using Vercel, which is built by the creators of Next.js.

1. Create a Vercel account at [vercel.com](https://vercel.com) if you don't have one
2. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. From your project directory, run:
   ```bash
   vercel login
   vercel
   ```
4. Follow the prompts to deploy your application
5. Once deployed, Vercel will provide you with a URL (e.g., https://estimaitor.vercel.app)
6. You can access this URL from any device, including your phone

### 2. Deploy to Netlify

Another great option for hosting your application:

1. Create a Netlify account at [netlify.com](https://netlify.com)
2. Install the Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```
3. Build your application:
   ```bash
   npm run build
   ```
4. Deploy using Netlify:
   ```bash
   netlify login
   netlify deploy
   ```
5. Follow the prompts and specify the `.next` directory as your publish directory
6. Once deployed, Netlify will provide you with a URL to access your application

### 3. Deploy to a Custom Domain

If you want to use your own domain name:

1. Purchase a domain from a provider like Namecheap, GoDaddy, or Google Domains
2. When deploying with Vercel or Netlify, you can add your custom domain in their dashboard
3. Follow the provider's instructions to configure DNS settings

### 4. Local Network Deployment

To access the app from other devices on your local network:

1. Run the application with:
   ```bash
   npm run dev -- -H 0.0.0.0
   ```
2. Find your computer's local IP address:
   - On Mac: System Preferences > Network
   - On Windows: Run `ipconfig` in Command Prompt
3. Access the application from other devices using `http://YOUR_LOCAL_IP:3000`

### 5. Progressive Web App (PWA)

To make the app installable on mobile devices:

1. Add PWA capabilities to your Next.js app by following the guide at [https://github.com/shadowwalker/next-pwa](https://github.com/shadowwalker/next-pwa)
2. This will allow users to "install" the app on their home screen

## Accessing Your Deployed Application

Once deployed, you can:

1. Bookmark the URL on your phone and laptop for quick access
2. Create a home screen shortcut on your phone
3. Share the link with team members who need to create estimates

For any deployment issues, refer to the [Next.js deployment documentation](https://nextjs.org/docs/deployment).
# Trigger deployment Thu Sep 11 18:47:28 EDT 2025
# Fix Git author for Vercel deployment Thu Sep 11 18:48:26 EDT 2025
