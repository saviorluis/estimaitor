# EstimAItor - Commercial Post-Construction Cleanup Estimator

An AI-powered web application for estimating commercial post-construction cleanup projects. This tool helps cleaning companies quickly generate accurate estimates based on project type, square footage, and other factors.

## Features

- **Project Type Selection**: Different rates for restaurants, medical facilities, offices, retail spaces, industrial spaces, and educational facilities
- **Cleaning Type Options**: Choose between Rough Clean (basic), Final Clean (standard), or Powder Puff Clean (detailed)
- **VCT Flooring Calculation**: Additional costs for vinyl composition tile flooring
- **Travel Cost Estimation**: Calculates travel costs based on distance and current gas prices
- **Staffing Recommendations**: Suggests the optimal number of cleaners based on project size
- **Time Estimation**: Calculates estimated completion time based on project parameters
- **Adjustable Staffing**: Allows adjustment of cleaner count to see impact on project duration
- **Urgency Pricing**: Scale from 1-10 with surcharges up to 30% for urgent projects
- **Profit Markup**: Option to apply a 1.5x markup (50% profit margin) to the total cost
- **Overnight Stay Calculation**: Includes per diem and hotel costs for multi-day projects
- **AI-Powered Recommendations**: Get project-specific cleaning recommendations, equipment suggestions, and efficiency tips

## Pricing Information

The estimator uses average commercial cleaning rates for the East Coast region (VA, NC, SC, GA) with different rates per square foot based on the type of facility:

- Restaurants: $0.45/sq ft
- Medical Facilities: $0.50/sq ft
- Office Spaces: $0.35/sq ft
- Retail Spaces: $0.40/sq ft
- Industrial Spaces: $0.30/sq ft
- Educational Facilities: $0.38/sq ft

### Cleaning Type Multipliers

- Rough Clean: 80% of standard rate (basic cleaning)
- Final Clean: Standard rate (thorough cleaning)
- Powder Puff Clean: 130% of standard rate (detailed, premium cleaning)

### Additional Costs

- **VCT Flooring**: Adds $0.15/sq ft to the base rate
- **Urgency Surcharge**: Up to 30% based on urgency level (1-10 scale)
- **Markup**: Optional 50% markup (1.5x multiplier) on the total cost
- **Per Diem**: $75 per person per day for overnight stays
- **Hotel**: $150 per room per night (assumes 2 people per room) with a 50% markup

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn
- OpenAI API key (for AI recommendations)

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/estimaitor.git
cd estimaitor
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Set up environment variables
   Create a `.env.local` file in the root directory with your OpenAI API key:

```
OPENAI_API_KEY=your_openai_api_key_here
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

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- React Hook Form
- OpenAI API

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
