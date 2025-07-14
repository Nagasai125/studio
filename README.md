# LegalEase 🏛️

**Your AI assistant for clear, easy-to-understand general legal information.**

LegalEase is a modern web application that helps users understand basic legal concepts and analyze documents using AI. Built with Next.js and powered by Google's Gemini AI, it provides accessible legal information in plain English.

## 🌟 Features

### 📝 Ask Legal Questions
- Get clear explanations of legal concepts in simple language
- Quick topic buttons for common legal questions:
  - Tenant and renter rights
  - Small claims court procedures
  - Residential lease agreements
  - Traffic violations
- AI-powered responses with official resource links

### 📄 Document Analysis
- Upload legal documents (PDF, DOC, images)
- Extract and analyze key clauses from lease agreements
- Get summaries of important document information
- Ask follow-up questions about uploaded documents

### 🔍 Text Analysis
- Paste contract clauses or legal text for analysis
- Get plain-English explanations of complex legal language
- Understand your rights and obligations

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI**: Tailwind CSS, Radix UI components, Framer Motion
- **AI**: Google Gemini 2.0 Flash via Genkit
- **Forms**: React Hook Form with Zod validation
- **Hosting**: Netlify with serverless functions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Google AI API key ([Get one here](https://aistudio.google.com/app/apikey))

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Nagasai125/studio.git
   cd studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```bash
   GOOGLE_GENAI_API_KEY=your_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:9002](http://localhost:9002)

### Available Scripts

- `npm run dev` - Start development server (with Turbopack)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks
- `npm run genkit:dev` - Start Genkit development server
- `npm run genkit:watch` - Start Genkit with watch mode

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_GENAI_API_KEY` | Google AI API key for Gemini | Yes |

### Deployment

This app is configured for deployment on **Netlify** with full serverless function support.

1. Connect your GitHub repository to Netlify
2. Add the `GOOGLE_GENAI_API_KEY` environment variable in Netlify dashboard
3. Deploy automatically triggers on every push to `master`

## ⚖️ Legal Disclaimer

**Important**: This application provides general legal information only and is not a substitute for professional legal advice. Always consult with a qualified attorney for specific legal matters.

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js app router
│   ├── page.tsx        # Main application page
│   ├── layout.tsx      # Root layout
│   └── globals.css     # Global styles
├── ai/                 # AI flows and configuration
│   ├── genkit.ts       # Genkit AI setup
│   └── flows/          # AI flow definitions
├── components/         # Reusable UI components
│   └── ui/            # Shadcn/ui components
├── hooks/             # Custom React hooks
└── lib/               # Utility functions
```

## 🎨 Features Overview

- **Responsive Design**: Works seamlessly on desktop and mobile
- **Accessibility**: Built with screen readers and keyboard navigation in mind
- **Type Safety**: Full TypeScript implementation
- **Modern UI**: Clean, professional interface with smooth animations
- **Error Handling**: Comprehensive error states and user feedback
- **Performance**: Optimized for fast loading and smooth interactions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built by [Nagasai125](https://github.com/Nagasai125)

---

**Need help?** Open an issue or check the documentation for more details.