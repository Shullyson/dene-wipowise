# Dennemeyer (Lunch AI) Exercise

A modern, interactive AI chatbot UI for WIPO patent drafting, built with React, TypeScript, Tailwind CSS, and Express.js. This project demonstrates full-stack integration with Azure Functions and Blob Storage for scalable feedback collection and AI-powered Q&A.

## Features
- **Conversational AI Chatbot**: Ask questions about patent drafting, portfolio management, and more.
- **Speech Recognition & Synthesis**: Voice input and output for hands-free interaction.
- **Feedback System**: Like/dislike responses and submit feedback, stored securely in Azure Blob Storage.
- **Dark/Light Theme Toggle**: Seamless theme switching for user comfort.
- **Reference Links**: AI answers can include references for further reading.

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Azure Functions, Azure Blob Storage
- **Other**: Vite, PostCSS, ESLint

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- Azure account (for Function and Blob Storage)

### Installation
1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd be-chatbot-ui
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Create a `.env` file in the root directory.
   - Add your Azure Function URL and Key:
     ```env
     AZURE_FUNCTION_URL=<your-azure-function-url>
     AZURE_FUNCTION_KEY=<your-azure-function-key>
     ```

### Running Locally
1. Start the backend server:
   ```bash
   node server.js
   ```
2. Start the frontend:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:8501](http://localhost:8501) in your browser.

## Project Structure
- `src/` — Frontend source code
- `server.js` — Express backend (API proxy, feedback storage)
- `public/` or `dist/` — Static assets
- `components/` — Reusable UI components
- `context/` — Theme context provider
- `pages/chat/` — Main chat page

## Feedback & Contributions
Feedback is stored in Azure Blob Storage for analysis and improvement.