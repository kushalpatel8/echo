# ECHO - Open-Access Mental Health & Community Support Platform

[![Next.js](https://img.shields.io/badge/Next.js-16+-black?style=flat&logo=next.js)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Enabled-green?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![Upstash Redis](https://img.shields.io/badge/Upstash%20Redis-Ultra--Fast-red?style=flat&logo=redis)](https://upstash.com/)
[![Vercel Blob](https://img.shields.io/badge/Vercel%20Blob-Media%20Storage-black?style=flat&logo=vercel)](https://vercel.com/blob)
[![Gemini AI](https://img.shields.io/badge/Google%20Gemini-3.8--Flash-blue?style=flat&logo=google)](https://deepmind.google/technologies/gemini/)
[![Tavily Search](https://img.shields.io/badge/Tavily-AI%20Grounding-purple?style=flat)](https://tavily.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**Live Demo**: [https://mentalexpert.vercel.app/](https://mentalexpert.vercel.app/)

ECHO is a modern, open-access mental health sanctuary engineered to provide a compassionate, secure space for individuals seeking clinical guidance, peer support, and digital relaxation. ECHO combines high-end emotional wellness tools, multi-layer AI safety moderation, real-time presence tracking, and media streaming at zero cost to users.

---

## 🌟 Key Features

### 💊 Digital Prescriptions on Echo Letterhead & Telehealth Delivery
- **3-Step Doctor Medication Suite**:
  - **Step 1: Select the Patient**: Fast searchable candidate picker supporting both active consultations and platform patients with zero email exposure for clinical privacy.
  - **Step 2: Compose on Echo Letterhead & Digitally Sign**: Comprehensive medication builder (name, dosage, frequency, duration, instructions), one-click clinical presets (*Anxiety Relief*, *Restful Sleep*, *Mood Elevation*), clinical lifestyle advice, live letterhead preview, and cryptographic-style digital signature including doctor qualifications, registration license, and timestamp seal.
  - **Step 3: Deliver Directly to Patient Chat**: Generates an A4 medical PDF via `jspdf` on official Echo letterhead, records the prescription in MongoDB, establishes or updates the patient chat, and dispatches the PDF.
- **Dedicated Same-Origin PDF Streaming (`/api/prescriptions/view`)**:
  - Delivers pristine binary PDF streams (`application/pdf`) with strict role-based authorization (prescribing doctor, recipient patient, chat participant, or admin).
  - Built-in self-healing fallback that re-generates valid PDFs on-the-fly if cached records require recreation.
- **Bi-Directional Prescription Management & Deletion**:
  - **Patient Dashboard (💊 Prescriptions tab)**: View all active medical prescriptions, open official signed PDFs in the browser, jump directly to the doctor consultation chat, or delete records.
  - **Doctor Dashboard (💊 Prescribe Medicine tab)**: Audit full prescription history, view issued PDFs, navigate to patient chats, or delete prescription records.
  - **Chat Message Synchronization**: Deleting a prescription automatically purges the corresponding prescription card from the consultation chat room and invalidates the Redis cache.

### 📋 Role-Based Task Assignment & Privacy Protection
- **Targeted Wellness Task Assignment**: Volunteers and Doctors can select specific patients from their active chats or community directory and assign structured wellness tasks and self-care goals.
- **Absolute Email Obfuscation**: User email addresses are strictly masked and hidden from doctors and volunteers across candidate selectors, assignment forms, and chat rooms to preserve patient confidentiality.

### 🛡️ AI Message Moderation & 3-Strike Safety Policy
- **Multi-Layer Moderation Engine**: Screens helper (volunteer/doctor) messages in real time using:
  1. **Instant Lexical & Semantic Malice Rules (`<1ms`)**: Detects explicit profanity, slurs, fatal disease/cancer wishes, and existential demoralization (e.g., *"your life is a curse"*, *"you are a burden"*, *"teri zindagi ek shraap hai"*).
  2. **Google Gemini 3.8 Flash**: Deep intent and subtext analysis against clinical and emotional safety guidelines.
  3. **Tavily AI Search Grounding**: Verifies hazardous medical claims or ambiguous toxic phrases against live medical consensus.
- **Automated 3-Strike Enforcement**:
  - **1st Strike**: Message blocked + 1st warning issued.
  - **2nd Strike**: Message blocked + 2nd warning issued.
  - **3rd Strike**: Message blocked + Helper account automatically suspended (`isBanned: true`).

### ⚡ Upstash Redis High-Performance Engine
- **Sub-10ms Micro-Caching**: Accelerated response times across volunteer directories, user profiles, community posts, leaderboards, mood history, and daily tasks.
- **Live Presence Heartbeats**: Redis Sorted Sets (`presence:online_users`) power real-time online/offline presence tracking for doctors and peer supporters.
- **Instant Directory Filtering**: Filter peer supporters and doctors by All, 🟢 Online, ⚪ Offline, or ⭐ Saved with live name/bio search.

### 📸 Vercel Blob Storage & Community Media Streamer
- **Private Media Storage**: High-speed, secure uploads for community photos (up to 15MB) and videos (up to 50MB) via Vercel Blob.
- **Byte-Range Streaming (`HTTP 206 Partial Content`)**: Smooth video playback with instant scrubbing, seeking, and responsive buffering.
- **Auto-Purge Cleanup**: Media attachments are automatically deleted from Vercel Blob storage whenever a post is deleted.

### 🌍 International Application Forms
- **Country Code Selector**: Interactive dropdown with country flags, dial codes (`+91`, `+1`, `+44`, etc.), and live search for Volunteer and Doctor application forms (`/apply/volunteer`, `/apply/doctor`).
- **One-Click Sync**: Auto-sync phone numbers to WhatsApp numbers with single-click checkboxes.

### 🩺 Professional Handshake & Peer Support
- **WhatsApp Handshake**: Secure request-and-accept workflow connecting patients with licensed medical practitioners while maintaining strict privacy boundaries.
- **Verified Peer Counseling**: Direct one-on-one messaging with approved peer supporters for everyday mental health guidance.

### 🤖 24/7 AI Companion & Wellness Suite
- **Empathetic AI Friend**: Powered by Google Gemini for active listening, validation, and therapeutic grounding.
- **AI Exercise Trainer**: Tailored workouts, stretching routines, and mindfulness sessions generated via Groq (Llama 3.3).
- **AI Facial Mood Scanner**: In-browser facial emotion detection (Happy, Sad, Depressed, Tired) using `@vladmandic/face-api` via webcam or photo uploads.
- **Spiritual Library & Sensory Games**: Osho discourses, Forest Walk, Cloud Watcher, and Mantra Meditation.

### 🌌 Dynamic Room Themes
- 5 interactive mood aesthetics with fluid glassmorphic styling:
  - 🌌 **Celestial Twilight**
  - 🌲 **Deep Forest Sanctuary**
  - 🌅 **Amber Serenity**
  - 🌊 **Deep Ocean Calm**
  - ✨ **Northern Lights**

---

## 🏗️ Project Structure

```text
echo/
├── app/                        # Next.js App Router
│   ├── api/                    # Backend API Endpoints
│   │   ├── blob/               # Vercel Blob upload & streaming proxy
│   │   ├── chat/               # Chat messages with 3-strike moderation & PDF attachments
│   │   ├── connections/        # WhatsApp professional handshake
│   │   ├── posts/              # Community posts (Redis cached + Blob media)
│   │   ├── prescriptions/      # Prescription management & PDF streaming (`/view`)
│   │   ├── tasks/              # Task assignments & candidate user queries
│   │   ├── users/              # Presence heartbeats & user profiles
│   │   ├── volunteers/         # Approved helpers with live Redis presence
│   │   ├── ai-companion/       # Gemini AI conversational agent
│   │   └── exercise-trainer/   # Groq-powered workout recommendations
│   ├── apply/                  # Application forms (Volunteer, Doctor)
│   ├── chat/                   # Real-time chat interface with PDF prescriptions
│   ├── community/              # Community feed with photo/video playback
│   ├── dashboard/              # Role-based dashboards (User, Doctor, Admin)
│   ├── doctors/                # Clinical directory
│   ├── volunteers/             # Peer supporter directory with online/offline tabs
│   ├── games/                  # Zen sensory experiences
│   └── relaxation/             # Audio discourses & spiritual library
├── components/                 # Reusable React Components
│   ├── DoctorMedicationSection.tsx # 3-step digital prescription builder & history
│   ├── TaskAssignmentSection.tsx   # Privacy-safe patient selector & task assigner
│   ├── PhoneInput.tsx          # Country code selector with search & flags
│   ├── BanAppealBanner.tsx     # Account suspension & appeal modal
│   ├── ThemeToggle.tsx         # Dark/light & aesthetic theme switcher
│   └── mood/                   # AI facial emotion detector
├── lib/                        # Core Utilities & Services
│   ├── prescriptionPdf.ts      # A4 PDF letterhead generator on Echo branding (jsPDF)
│   ├── blob.ts                 # Vercel Blob upload, delete & streaming helpers
│   ├── redis.ts                # Upstash Redis caching & presence engine
│   ├── moderation.ts           # Multi-layer safety engine (Regex + Gemini + Tavily)
│   ├── countries.ts            # Global dial codes and flag dataset
│   ├── mongodb.ts              # Mongoose database connector
│   └── models/                 # Schemas (User, Post, Chat, Prescription, Task, MoodLog)
```

---

## 🛠️ Technology Stack

| Domain | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16+ (App Router)](https://nextjs.org/) |
| **Authentication** | [Clerk](https://clerk.com/) |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) |
| **Caching & Presence** | [Upstash Redis](https://upstash.com/) (`@upstash/redis`) |
| **Media Storage** | [Vercel Blob](https://vercel.com/blob) (`@vercel/blob`) |
| **AI Moderation & Companion** | [Google Gemini 3.8 Flash](https://deepmind.google/technologies/gemini/) (`@google/generative-ai`) |
| **AI Grounding & Verification** | [Tavily Search API](https://tavily.com/) (`@tavily/core`) |
| **AI Exercise Generator** | [Groq](https://groq.com/) (Llama 3.3 70B) |
| **Computer Vision** | [@vladmandic/face-api](https://github.com/vladmandic/face-api) (Facial emotion detection) |
| **PDF & Letterhead Generation** | [jsPDF](https://github.com/parallax/jsPDF) (`jspdf`) |
| **Styling** | Vanilla CSS + Tailored Design Tokens (Glassmorphism) |

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/kushalpatel8/echo.git
cd echo
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database
MONODB_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/?appName=Cluster0

# Upstash Redis (Caching & Real-Time Presence)
UPSTASH_REDIS_REST_URL="https://your-redis-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_upstash_redis_token"
REDIS_URL="rediss://default:your_token@your-redis-instance.upstash.io:6379"

# Vercel Blob Storage (Community Photos & Videos)
BLOB_STORE_ID="store_..."
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# AI APIs
GEMINI_API_KEY=AIzaSy...
TAVILYSEARCH_API_KEY=tvly-dev-...
GROQ_API_KEY=gsk_...
OPENAI_API_KEY=sk-proj-...

# Admin Security
ADMIN_TOKEN=your_secure_admin_secret
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the platform.

---

## 🛡️ Safety & Clinical Privacy

ECHO operates under strict ethical guidelines for mental health and peer support:
- **Zero-Tolerance for Hostility**: AI moderation proactively catches and halts toxic content, slurs, cancer/illness wishes, and demoralizing phrases (*"your life is a curse"*) before delivery.
- **Escalated Accountability**: Helpers who violate guidelines receive automated warnings with immediate suspension upon a 3rd strike.
- **Patient Anonymity & PII Protection**: Patient email addresses and private identifiers are completely masked from doctors, volunteers, and peer counselors during consultations and task assignments.
- **Digitally Signed Medical Records**: Electronic prescriptions generated on Echo letterhead feature verifiable practitioner credentials, license seals, and audit timestamps with full patient/doctor deletion control.
- **Clinical Boundaries**: WhatsApp professional connections adhere to an explicit **Request-Accept-Connect** handshake to ensure patient safety and practitioner boundaries.

---

## 🤝 Contributing

Contributions, feature suggestions, and issues are welcome! Feel free to open a PR or submit an issue on GitHub.

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).
