# ECHO - Open-Access Mental Health & Community Support Platform

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat&logo=next.js)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Enabled-green?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**Live Demo**: [https://mentalexpert.vercel.app/](https://mentalexpert.vercel.app/)

ECHO is a modern, premium mental health sanctuary designed to provide a safe space for individuals seeking professional guidance, peer support, and digital relaxation. Transitioned to a fully open-access model, ECHO offers high-end mental health tools, AI-driven analytics, and direct professional connections at no cost.

## 🌟 Key Features

- **Professional Handshake**: Secure WhatsApp connection system where users request access to professional doctors, ensuring privacy and expert vetting.
- **Peer Support**: Connect with a community of verified volunteers for peer-to-peer counseling and task management.
- **AI Companion**: A 24/7 empathetic AI friend powered by Gemini for immediate venting, support, and therapeutic conversation.
- **Zen Relaxation Suite**: 
    - **AI Personal Exercise Trainer**: Personalized physical workout, stretching, and mindfulness suggestions generated using the Groq API based on user age, gender, and profession.
    - **Library**: Extensive collection of spiritual and literary classics including Osho's Hindi and English audio discourses.
    - **Sensory Games**: Interactive experiences like Forest Walk, Cloud Watcher, and Mantra Meditation designed for immediate de-stressing.
- **Intelligent Mood Tracking**: AI-powered analysis of your daily check-ins with critical mood alerts that prompt immediate professional care. Features a built-in **AI Face Analysis** scanner to detect moods (Happy, Sad, Depressed, Tired) locally using your device camera or photo uploads.
- **Premium Aesthetics**: A state-of-the-art design system featuring dynamic glassmorphism, animated gradients, and seamless dark/light mode integration. Supports 5 interactive themes on desktop viewports (🌌 Celestial, 🌲 Forest, 🌅 Sunset, 🌊 Ocean, ✨ Aurora) and 3 on mobile.

## 🏗️ Project Structure

```text
echo/
├── app/                    # Next.js App Router (v14+)
│   ├── api/                # Backend API Layer
│   │   ├── connections/    # WhatsApp handshake & connection logic
│   │   ├── mood-tracker/   # AI-driven emotional analytics
│   │   ├── chat/           # Real-time message persistence
│   │   ├── exercise-trainer/ # AI Exercise Trainer generator
│   │   └── ai-companion/   # Generative AI support logic
│   ├── dashboard/          # Role-specific (User, Doctor, Admin) views
│   ├── doctors/            # Professional clinical directory
│   ├── volunteers/         # Peer support directory
│   ├── relaxation/         # Spiritual library & reading room
│   ├── games/              # Zen sensory experiences
│   └── chat/               # Multi-mode real-time communication
├── components/             # Reusable UI Architecture
│   ├── mood/               # FaceMoodDetector & AI Face Analysis
│   ├── MobileDashboard.tsx # Tailored mobile navigation grid
│   ├── ThemeToggle.tsx     # System-wide aesthetic control
│   └── ui/                 # Atomic design tokens (Cards, Buttons, Grids)
├── lib/                    # Core Business Logic
│   ├── mongodb.ts          # Optimized Mongoose connection
│   └── models/             # Schema definitions (User, ConnectionRequest, Chat)
```

## 🛠️ Technology Stack

- **Framework**: [Next.js 14+](https://nextjs.org/)
- **Authentication**: [Clerk](https://clerk.com/) (Metadata-driven role selection)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Styling**: Vanilla CSS (Custom Design Tokens)
- **AI Integration**: [Google Gemini Pro](https://deepmind.google/technologies/gemini/) (Mood Analysis & AI Companion) & [Groq Llama-3.3-70b-versatile](https://groq.com/) (AI Exercise Trainer)
- **Computer Vision**: [@vladmandic/face-api](https://github.com/vladmandic/face-api) (Local AI Facial Expression Detection)

## 🚀 Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-repo/echo.git
    cd echo
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**:
    Create a `.env` file in the root directory:
    ```env
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
    CLERK_SECRET_KEY=your_secret
    MONODB_URL=your_mongodb_uri
    GEMINI_API_KEY=your_google_ai_key
    GROQ_API_KEY=your_groq_api_key
    ADMIN_TOKEN=your_admin_secret
    ```

4.  **Launch Platform**:
    ```bash
    npm run dev
    ```

## 🛡️ Privacy & Professionalism

ECHO prioritizes medical privacy. Professional WhatsApp connections follow a **Request-Accept-Connect** handshake, ensuring and maintaining a professional boundary between patients and practitioners at all times. This is the best of human health.

## 🌍 About ECHO Community

ECHO is more than just a platform; it is a thriving, open-access community where empathy meets technology. We believe that mental health support should not be a luxury. The ECHO community is built on the pillars of mutual respect, peer-to-peer empowerment, and accessible professional care. Whether you are seeking a quiet space to meditate, a volunteer willing to listen, or professional guidance, you are never alone here.

## 🤝 Contributing

We welcome contributions to make ECHO even better. Feel free to open issues, submit pull requests, or share your feedback to help us build a more supportive mental health platform.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
