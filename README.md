# ECHO - Open-Access Mental Health & Community Support Platform

ECHO is a modern, premium mental health sanctuary designed to provide a safe space for individuals seeking professional guidance, peer support, and digital relaxation. Transitioned to a fully open-access model, ECHO offers high-end mental health tools, AI-driven analytics, and direct professional connections at no cost.

## 🌟 Key Features

- **Professional Handshake**: Secure WhatsApp connection system where users request access to professional doctors, ensuring privacy and expert vetting.
- **Peer Support**: Connect with a community of verified volunteers for peer-to-peer counseling and task management.
- **AI Companion**: A 24/7 empathetic AI friend powered by Gemini for immediate venting, support, and therapeutic conversation.
- **Zen Relaxation Suite**: 
    - **Library**: Extensive collection of spiritual and literary classics including Osho's Hindi and English audio discourses.
    - **Sensory Games**: Interactive experiences like Forest Walk, Cloud Watcher, and Mantra Meditation designed for immediate de-stressing.
- **Intelligent Mood Tracking**: AI-powered analysis of your daily check-ins with critical mood alerts that prompt immediate professional care.
- **Premium Aesthetics**: A state-of-the-art design system featuring dynamic glassmorphism, animated gradients, and seamless dark/light mode integration.

## 🏗️ Project Structure

```text
echo/
├── app/                    # Next.js App Router (v14+)
│   ├── api/                # Backend API Layer
│   │   ├── connections/    # WhatsApp handshake & connection logic
│   │   ├── mood-tracker/   # AI-driven emotional analytics
│   │   ├── chat/           # Real-time message persistence
│   │   └── ai-companion/   # Generative AI support logic
│   ├── dashboard/          # Role-specific (User, Doctor, Admin) views
│   ├── doctors/            # Professional clinical directory
│   ├── volunteers/         # Peer support directory
│   ├── relaxation/         # Spiritual library & reading room
│   ├── games/              # Zen sensory experiences
│   └── chat/               # Multi-mode real-time communication
├── components/             # Reusable UI Architecture
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
- **AI Integration**: [Google Gemini Pro](https://deepmind.google/technologies/gemini/) (Mood Analysis & AI Companion)

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
    ADMIN_TOKEN=your_admin_secret
    ```

4.  **Launch Platform**:
    ```bash
    npm run dev
    ```

## 🛡️ Privacy & Professionalism

ECHO prioritizes medical privacy. Professional WhatsApp connections follow a **Request-Accept-Connect** handshake, ensuring and maintaining a professional boundary between patients and practitioners at all times.
