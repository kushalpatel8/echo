# ECHO - Mental Health & Community Support Platform

ECHO is a modern, premium mental health platform designed to provide a sanctuary for individuals seeking support, relaxation, and community. Built with Next.js 14, Clerk, and MongoDB, it offers a seamless, secure, and beautiful experience for both users and professional supporters.

## 🌟 Key Features

- **Professional Support**: Connect with approved Doctors and certified Volunteers via real-time chat.
- **AI Companion**: A private, empathetic AI friend available 24/7 for immediate venting and support.
- **Relaxation Games**: A collection of interactive tools like Breathing Guides and Memory Match to help de-stress.
- **Mood Tracking**: Log and visualize your emotional journey over time to identify patterns and progress.
- **Role-Based Access**: Specialized dashboards for Users, Volunteers, Doctors, and Administrators.
- **Premium Aesthetics**: A custom-built design system with dynamic glassmorphism, smooth animations, and full dark/light mode support.

## 🏗️ Project Structure

```text
echo/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Authentication routes (Clerk)
│   ├── api/                # Backend API endpoints
│   │   ├── admin/          # Admin management & user roles
│   │   ├── chat/           # Real-time chat & message persistence
│   │   ├── ai-companion/   # OpenAI-powered support logic
│   │   └── mood-tracker/   # Mood logging & analytics
│   ├── dashboard/          # User & Admin dashboards
│   ├── volunteers/         # Support directory & doctor listings
│   ├── chat/               # Real-time chat interface
│   ├── games/              # Relaxation games & breathing guides
│   ├── mood-tracker/       # Emotional intelligence tools
│   ├── apply/              # Volunteer/Doctor application forms
│   └── globals.css         # Global styles & design system tokens
├── components/             # Reusable UI components
│   ├── ui/                 # Atomic design components (cards, buttons)
│   ├── ThemeToggle.tsx     # Dark/Light mode switch
│   └── Navbar.tsx          # Dynamic navigation
├── lib/                    # Core utilities & database logic
│   ├── mongodb.ts          # Mongoose connection & caching
│   └── models/             # MongoDB Schemas (User, Chat, MoodLog, Task)
├── public/                 # Static assets & icons
├── .env                    # Environment configuration
└── next.config.js          # Next.js configuration
```

## 🛠️ Technology Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Authentication**: [Clerk](https://clerk.com/) (Role-based metadata)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Styling**: Vanilla CSS with CSS Variables (Echo Design System)
- **AI**: [OpenAI API](https://openai.com/) (GPT-4o)
- **State Management**: React Hooks & Context API

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
    Create a `.env` file in the root directory and add the following:
    ```env
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
    CLERK_SECRET_KEY=your_secret
    MONODB_URL=your_mongodb_uri
    OPENAI_API_KEY=your_openai_key
    ADMIN_TOKEN=your_admin_secret
    ```

4.  **Run in development mode**:
    ```bash
    npm run dev
    ```

5.  **Open the app**:
    Navigate to `http://localhost:3000` to see ECHO in action.

## 🛡️ License

This project is licensed under the MIT License - see the LICENSE file for details.
