# Talkeasy AI Language Companion

![Talkeasy Dashboard](./public/talkeasy-dashboard.png)

Talkeasy is a modern, AI-powered web application designed to be your personal language learning partner. Built with Next.js, Genkit, and ShadCN UI, it offers a suite of interactive tools to help users practice and improve their skills in various languages.

## ✨ Features

Talkeasy provides a rich, multi-faceted learning experience through a variety of specialized tools:

-   **🎮 Personalized Learning Game:** An interactive, gamified journey with levels and tasks tailored to your learning style.
-   **🗣️ Pronunciation Feedback:** Get real-time AI analysis and scoring on your spoken pronunciation.
-   **🤖 AI Conversational Chatbot:** Practice your listening and speaking skills in realistic, AI-driven conversations.
-   **📚 Cultural Story Time:** Learn language and culture simultaneously through engaging, AI-generated folktales with audio narration.
-   **🗺️ Learn by Exploring:** A unique map-based feature where you can click on locations to get a real-world language mini-lesson.
-   **✍️ Grammar & Vocabulary Assistant:** Get instant feedback on your writing or speech to correct grammar and improve vocabulary.
-   **🔤 Alphabet Tracing:** Learn new alphabets by tracing characters and receiving AI feedback on your accuracy.
-   **📄 Document Translator:** Upload a PDF or paste text to receive a concise summary translated into your target language.
-   **...and many more!** Including a visual translator, scenario-based phrasebook, and a personalized study plan generator.

## 🛠️ Tech Stack

This project is built with a modern, powerful tech stack:

-   **Framework:** [Next.js](https://nextjs.org/) (App Router)
-   **AI/Generative:** [Google Genkit](https://firebase.google.com/docs/genkit)
-   **UI:** [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/), [ShadCN UI](https://ui.shadcn.com/)
-   **Forms:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

## 🚀 Getting Started

Follow these steps to get a local copy of the project up and running.

### Prerequisites

-   Node.js (v18 or later)
-   npm, pnpm, or yarn

### 1. Set Up Environment Variables

First, you'll need to provide your own API keys for the various Google services used in this application.

1.  Make a copy of the `.env.example` file and rename it to `.env`.
    ```bash
    cp .env.example .env
    ```
2.  Open the `.env` file and add your API keys. You can obtain these keys from the [Google Cloud Console](https://console.cloud.google.com/).

    ```env
    # For Google AI Studio / Gemini Models
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

    # For Google Maps Platform (used in the "Explore" feature)
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_GOOGLE_MAPS_API_KEY"

    # For YouTube Data API (used in the "Study Plan" feature)
    YOUTUBE_API_KEY="YOUR_YOUTUBE_API_KEY"
    ```

### 2. Install Dependencies

Navigate to the project directory and install the necessary packages.

```bash
npm install
```

### 3. Run the Development Server

You can now start the development server.

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result. You can start editing the page by modifying `src/app/page.tsx`.

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
