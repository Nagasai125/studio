# LegalBee Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │   Ask Question  │  │ Analyze Document│  │  Analyze Text   │                │
│  │      Tab        │  │      Tab        │  │      Tab        │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                        Next.js App (page.tsx)                              │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐ │ │
│  │  │                     React Hook Form + Zod                              │ │ │
│  │  │   ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐         │ │ │
│  │  │   │ legalQuestion   │ │   fileUpload    │ │  textAnalysis   │         │ │ │
│  │  │   │     Form        │ │      Form       │ │      Form       │         │ │ │
│  │  │   └─────────────────┘ └─────────────────┘ └─────────────────┘         │ │ │
│  │  └─────────────────────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 PRESENTATION LAYER                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                          UI Components                                      │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐ │ │
│  │  │                        Radix UI + Tailwind                             │ │ │
│  │  │   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐     │ │ │
│  │  │   │    Card     │ │   Button    │ │    Input    │ │   Textarea  │     │ │ │
│  │  │   └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘     │ │ │
│  │  │   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐     │ │ │
│  │  │   │    Tabs     │ │    Alert    │ │   Skeleton  │ │   Toaster   │     │ │ │
│  │  │   └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘     │ │ │
│  │  └─────────────────────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                         Animation Layer                                     │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐ │ │
│  │  │                        Framer Motion                                   │ │ │
│  │  │   ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐         │ │ │
│  │  │   │   Page Enters   │ │  Result Cards   │ │  Loading States │         │ │ │
│  │  │   │   Animation     │ │   Animation     │ │   Animation     │         │ │ │
│  │  │   └─────────────────┘ └─────────────────┘ └─────────────────┘         │ │ │
│  │  └─────────────────────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 BUSINESS LOGIC LAYER                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                           AI Flows (Genkit)                                │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐ │ │
│  │  │                      Flow Orchestration                                │ │ │
│  │  │   ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐         │ │ │
│  │  │   │  summarize-     │ │  extract-lease- │ │  analyze-text   │         │ │ │
│  │  │   │  legal-         │ │  clauses        │ │                 │         │ │ │
│  │  │   │  information    │ │                 │ │                 │         │ │ │
│  │  │   └─────────────────┘ └─────────────────┘ └─────────────────┘         │ │ │
│  │  │   ┌─────────────────┐ ┌─────────────────┐                             │ │ │
│  │  │   │  extract-       │ │  answer-        │                             │ │ │
│  │  │   │  document-text  │ │  document-      │                             │ │ │
│  │  │   │                 │ │  question       │                             │ │ │
│  │  │   └─────────────────┘ └─────────────────┘                             │ │ │
│  │  └─────────────────────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                      Data Processing Layer                                  │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐ │ │
│  │  │                      File Processing                                   │ │ │
│  │  │   ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐         │ │ │
│  │  │   │   PDF Parser    │ │   DOC Parser    │ │  Image Parser   │         │ │ │
│  │  │   │   (.pdf)        │ │   (.doc/.docx)  │ │ (.png/.jpg)     │         │ │ │
│  │  │   └─────────────────┘ └─────────────────┘ └─────────────────┘         │ │ │
│  │  │   ┌─────────────────┐                                                 │ │ │
│  │  │   │  Text Extractor │                                                 │ │ │
│  │  │   │  (Base64/DataURI│                                                 │ │ │
│  │  │   │   Processing)   │                                                 │ │ │
│  │  │   └─────────────────┘                                                 │ │ │
│  │  └─────────────────────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 AI INTEGRATION LAYER                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                         Genkit Framework                                    │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐ │ │
│  │  │                      AI Model Integration                              │ │ │
│  │  │   ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐         │ │ │
│  │  │   │   Model Config  │ │  Prompt Engine  │ │  Response Parser│         │ │ │
│  │  │   │ (genkit.ts)     │ │                 │ │                 │         │ │ │
│  │  │   └─────────────────┘ └─────────────────┘ └─────────────────┘         │ │ │
│  │  │   ┌─────────────────┐ ┌─────────────────┐                             │ │ │
│  │  │   │   Flow Manager  │ │  Error Handler  │                             │ │ │
│  │  │   │                 │ │                 │                             │ │ │
│  │  │   └─────────────────┘ └─────────────────┘                             │ │ │
│  │  └─────────────────────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 EXTERNAL SERVICES                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                         Google AI (Gemini)                                 │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐ │ │
│  │  │                      Gemini 2.0 Flash Model                           │ │ │
│  │  │   ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐         │ │ │
│  │  │   │   Text Analysis │ │  Document OCR   │ │  Legal Research │         │ │ │
│  │  │   │   Processing    │ │   Processing    │ │   Processing    │         │ │ │
│  │  │   └─────────────────┘ └─────────────────┘ └─────────────────┘         │ │ │
│  │  │   ┌─────────────────┐ ┌─────────────────┐                             │ │ │
│  │  │   │   Summarization │ │  Q&A Processing │                             │ │ │
│  │  │   │   Engine        │ │                 │                             │ │ │
│  │  │   └─────────────────┘ └─────────────────┘                             │ │ │
│  │  └─────────────────────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 DEPLOYMENT LAYER                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                            Netlify Platform                                │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐ │ │
│  │  │                       Deployment Pipeline                              │ │ │
│  │  │   ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐         │ │ │
│  │  │   │   GitHub Repo   │ │  Netlify Build  │ │   CDN Hosting   │         │ │ │
│  │  │   │   Integration   │ │   Pipeline      │ │                 │         │ │ │
│  │  │   └─────────────────┘ └─────────────────┘ └─────────────────┘         │ │ │
│  │  │   ┌─────────────────┐ ┌─────────────────┐                             │ │ │
│  │  │   │ Serverless      │ │  Environment    │                             │ │ │
│  │  │   │ Functions       │ │  Variables      │                             │ │ │
│  │  │   └─────────────────┘ └─────────────────┘                             │ │ │
│  │  └─────────────────────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

### Frontend Architecture
```
App Router (Next.js 15)
├── layout.tsx (Root Layout)
│   ├── Global CSS
│   ├── Font Configuration
│   └── Toaster Provider
│
└── page.tsx (Main Application)
    ├── State Management
    │   ├── Form States (React Hook Form)
    │   ├── Loading States
    │   └── Result States
    │
    ├── UI Components
    │   ├── Tabs System
    │   │   ├── Ask Question Tab
    │   │   ├── Analyze Document Tab
    │   │   └── Analyze Text Tab
    │   │
    │   ├── Form Components
    │   │   ├── Legal Question Form
    │   │   ├── File Upload Form
    │   │   ├── Text Analysis Form
    │   │   └── Follow-up Question Form
    │   │
    │   └── Result Components
    │       ├── Summary Cards
    │       ├── Analysis Results
    │       ├── Loading Skeletons
    │       └── Error States
    │
    └── Animation Layer (Framer Motion)
        ├── Page Transitions
        ├── Result Animations
        └── Loading Animations
```

### Backend Architecture
```
AI Processing Layer (Genkit)
├── genkit.ts (Configuration)
│   ├── Google AI Plugin
│   └── Gemini 2.0 Flash Model
│
└── AI Flows
    ├── summarize-legal-information.ts
    │   ├── Input: Legal question
    │   ├── Processing: Legal research + summarization
    │   └── Output: Summary + resources + disclaimer
    │
    ├── extract-lease-clauses.ts
    │   ├── Input: Document data URI
    │   ├── Processing: OCR + clause extraction
    │   └── Output: Structured lease data
    │
    ├── analyze-text.ts
    │   ├── Input: Text content
    │   ├── Processing: Legal analysis
    │   └── Output: Analysis + disclaimer
    │
    ├── extract-document-text.ts
    │   ├── Input: Document data URI
    │   ├── Processing: OCR + text extraction
    │   └── Output: Raw text content
    │
    └── answer-document-question.ts
        ├── Input: Document text + question
        ├── Processing: Q&A processing
        └── Output: Answer + disclaimer
```

## Data Flow Architecture

### User Interaction Flow
```
1. User Input
   ├── Legal Question → Form Validation → AI Flow
   ├── Document Upload → File Processing → AI Flow
   └── Text Analysis → Content Validation → AI Flow

2. Processing Pipeline
   ├── Input Validation (Zod Schema)
   ├── Data Transformation
   ├── AI Processing (Genkit → Gemini)
   └── Response Formatting

3. Result Display
   ├── Loading States (Skeleton UI)
   ├── Success States (Formatted Results)
   └── Error States (User-friendly Messages)
```

### File Processing Flow
```
File Upload → FileReader API → Base64 Encoding → Data URI → Genkit Flow → Gemini OCR → Text Extraction → UI Display
```

### AI Processing Flow
```
User Input → Schema Validation → Flow Execution → Gemini API → Response Processing → UI Update
```

## Security & Performance

### Security Measures
- Input validation with Zod schemas
- File size limits (5MB for Netlify)
- Content filtering for spam/inappropriate content
- Secure API key management via environment variables
- No sensitive data storage

### Performance Optimizations
- Next.js 15 with Turbopack for fast development
- Framer Motion for smooth animations
- Skeleton loading states for better UX
- Parallel processing for document analysis
- Optimized bundle size with selective imports

## Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **Forms**: React Hook Form with Zod validation

### Backend
- **AI Framework**: Google Genkit
- **AI Model**: Gemini 2.0 Flash
- **Runtime**: Node.js serverless functions
- **Deployment**: Netlify with continuous deployment

### Development Tools
- **Type Checking**: TypeScript
- **Linting**: ESLint
- **Build Tool**: Turbopack
- **Package Manager**: npm

## Environment Configuration

### Required Environment Variables
```
GOOGLE_GENAI_API_KEY=your_google_ai_api_key
```

### Development Scripts
```
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run linting
npm run typecheck   # Run type checking
npm run genkit:dev  # Start Genkit development server
```

## Deployment Architecture

### Netlify Configuration
- **Build Command**: `npm run build`
- **Publish Directory**: `.next`
- **Functions**: Serverless functions for AI processing
- **Environment**: Production environment variables
- **Domain**: Custom domain with SSL
- **CDN**: Global content delivery network

### CI/CD Pipeline
```
GitHub Push → Netlify Build → TypeScript Check → Next.js Build → Deploy → CDN Update
```

This architecture provides a scalable, maintainable, and user-friendly legal information platform with modern web technologies and AI integration.