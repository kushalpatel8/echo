import type { Document } from 'mongoose';
import type React from 'react';

// ==========================================
// Location & Internationalization Interfaces
// ==========================================

export interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
  placeholder?: string;
}

// ==========================================
// User & Auth Interfaces
// ==========================================

export type UserRole = 'user' | 'volunteer' | 'doctor' | 'admin';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface VolunteerProfile {
  phoneNo: string | number;
  whyVolunteer: string;
  degree?: string;
  experience?: string;
  whatsappNumber?: string | number;
  rating: number;
  totalRatings: number;
}

export interface DoctorProfile {
  phoneNo: string | number;
  whyDoctor: string;
  degree: string;
  licenseNumber?: string;
  college?: string;
  experience: string;
  whatsappNumber?: string | number;
  rating?: number;
  totalRatings?: number;
}

export interface IUser extends Document {
  clerkId: string;
  email: string;
  name: string;
  imageUrl: string;
  role: UserRole;
  isBanned: boolean;
  banCount?: number;
  warningCount?: number;
  applicationStatus?: ApplicationStatus;
  savedVolunteer?: string;
  volunteerProfile?: VolunteerProfile;
  doctorProfile?: DoctorProfile;
  lastSeen?: Date;
  isOnline?: boolean;
  createdAt: Date;
}

// ==========================================
// Community & Interaction Interfaces (Models)
// ==========================================

export interface IPost extends Document {
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'none';
  createdAt: Date;
}

export interface IMessage {
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
}

export interface IChat extends Document {
  participants: string[]; // clerkIds
  participantNames: string[];
  userId?: string;
  userName?: string;
  helperId?: string;
  helperName?: string;
  helperRole?: 'doctor' | 'volunteer';
  doctorId?: string;
  volunteerId?: string;
  messages: IMessage[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ConnectionStatus = 'pending' | 'accepted' | 'rejected';
export type WhatsappStatus = 'none' | 'pending' | 'accepted' | 'rejected';

export interface IConnectionRequest extends Document {
  userId: string;
  doctorId: string;
  status: ConnectionStatus;
  whatsappStatus: WhatsappStatus;
  userName: string;
  userImage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITask extends Document {
  title: string;
  description: string;
  assignerId: string;
  assignerName: string;
  assigneeId: string;
  assigneeName?: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: Date;
}

export interface AssigneeCandidate {
  clerkId: string;
  name: string;
  imageUrl?: string;
  isOnline?: boolean;
  isDirect?: boolean;
  relationship: string;
}

export interface ISuggestion extends Document {
  text: string;
  role: string;
  userId?: string;
  name?: string;
  email?: string;
  createdAt: Date;
}

export interface IMoodLog extends Document {
  userId: string;
  answers: Record<string, number | string>;
  detectedMood: string;
  moodScore: number;
  createdAt: Date;
}

export interface IAppealMessage {
  senderId: string;
  senderName: string;
  isAdmin: boolean;
  content: string;
  timestamp: Date;
}

export interface IAppeal extends Document {
  userId: string;
  userName: string;
  userRole: string;
  userEmail: string;
  messages: IAppealMessage[];
  status: 'pending' | 'resolved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// Client-side Chat & Companion Interfaces
// ==========================================

export interface ChatMessage {
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

export interface Chat {
  _id: string;
  participants: string[];
  participantNames: string[];
  userId?: string;
  userName?: string;
  helperId?: string;
  helperName?: string;
  helperRole?: 'doctor' | 'volunteer';
  doctorId?: string;
  volunteerId?: string;
  messages: ChatMessage[];
  isActive: boolean;
  otherIsOnline?: boolean;
  otherLastSeen?: string;
}

export interface CompanionMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ==========================================
// Helpers & Connections (UI & Client-side)
// ==========================================

export interface HelperVolunteerProfile {
  rating: number;
  totalRatings: number;
  experience?: string;
  phoneNo?: string | number;
  whyVolunteer?: string;
  degree?: string;
  whatsappNumber?: string | number;
}

export interface HelperDoctorProfile {
  degree: string;
  whatsappNumber?: number | string;
  phoneNo?: string | number;
  whyDoctor?: string;
  licenseNumber?: string;
  college?: string;
  experience?: string;
  rating?: number;
  totalRatings?: number;
}

export interface Helper {
  clerkId: string;
  name: string;
  imageUrl: string;
  role: 'volunteer' | 'doctor';
  volunteerProfile?: HelperVolunteerProfile;
  doctorProfile?: HelperDoctorProfile;
  lastSeen?: string;
  isOnline?: boolean;
}

export interface ConnectionRequest {
  _id: string;
  doctorId: string;
  userName: string;
  userImage: string;
  status: ConnectionStatus;
  whatsappStatus: WhatsappStatus;
}

// ==========================================
// Leaderboard & Mood Tracking Interfaces
// ==========================================

export interface LeaderboardDoctorProfile {
  rating: number;
  totalRatings: number;
  degree: string;
}

export interface LeaderboardVolunteerProfile {
  rating: number;
  totalRatings: number;
}

export interface LeaderboardUser {
  _id: string;
  clerkId: string;
  name: string;
  imageUrl: string;
  role: 'doctor' | 'volunteer';
  doctorProfile?: LeaderboardDoctorProfile;
  volunteerProfile?: LeaderboardVolunteerProfile;
}

export interface MoodLog {
  _id: string;
  detectedMood: string;
  moodScore: number;
  createdAt: string;
}

// ==========================================
// Games, Relaxation & Books
// ==========================================

export type GameID = 'breathing' | 'memory' | 'bubble-pop' | 'stargazer' | 'wordflow' | 'gratitude' | null;

export interface GameConfig {
  id: GameID;
  title: string;
  description: string;
  icon: string;
  color: string;
  delay: string;
}

export interface BookItem {
  title: string;
  author?: string;
  desc: string;
  icon: string;
  url: string;
  category: string;
}

export type QuoteCategory = 'Self-Compassion' | 'Resilience' | 'Mindfulness' | 'Inner Peace';

export interface QuoteItem {
  text: string;
  author: string;
  category: QuoteCategory;
}

export type SoundscapeType = 'rain' | 'ocean' | 'breeze' | 'bowl' | 'drone' | null;

export interface SoundscapeOption {
  id: SoundscapeType;
  label: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
}

// ==========================================
// Roles Overview & Application Interfaces
// ==========================================

export interface RoleFeature {
  title: string;
  desc: string;
  icon: React.ReactNode;
}

export interface RoleDetail {
  id: UserRole | string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  emoji: string;
  color: string;
  gradient: string;
  description: string;
  whoIsItFor: string;
  verificationLevel: string;
  verificationIcon: React.ReactNode;
  features: RoleFeature[];
  responsibilities: string[];
}

// ==========================================
// AI & Moderation Interfaces
// ==========================================

export interface ModerationResult {
  isHarmful: boolean;
  reason?: string;
  category?: 'abuse' | 'medical_hazard' | 'self_harm' | 'harassment' | 'slur' | 'toxic' | 'malice' | 'demoralization' | 'safe';
  source?: 'regex' | 'gemini' | 'tavily' | 'tavily_gemini';
}

// ==========================================
// Voice & Audio Interfaces
// ==========================================

export interface VoiceSettings {
  selectedVoiceURI: string;
  rate: number;
  pitch: number;
  autoSpeak: boolean;
}

export interface VoiceHeaderControlsProps {
  voices: SpeechSynthesisVoice[];
  settings: VoiceSettings;
  updateSettings: (newSettings: Partial<VoiceSettings>) => void;
  speak: (text: string, id?: string | number) => void;
  stopSpeaking: () => void;
  speakingId: string | number | null;
  hasSynthesisSupport: boolean;
}

export interface VoiceMessageButtonProps {
  text: string;
  messageId?: string | number;
  id?: string | number;
  speak: (text: string, id?: string | number) => void;
  stopSpeaking: () => void;
  speakingId: string | number | null;
  hasSynthesisSupport: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export interface VoiceInputButtonProps {
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
  hasSpeechSupport: boolean;
  onTranscript?: (text: string) => void;
  startListening?: () => void;
  stopListening?: () => void;
  hasRecognitionSupport?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// ==========================================
// UI & Component Interfaces
// ==========================================

export interface PhoneInputProps {
  label?: string;
  required?: boolean;
  value?: string;
  onChange: (value: string, meta: { countryCode: string; nationalNumber: string; country: Country }) => void;
  defaultCountryCode?: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
  helperText?: string;
  error?: string;
}

export interface BreathStage {
  label: string;
  duration: number; // in seconds
  scale: number; // visual scale of orb
  color: string; // gradient color
  instruction: string;
}

export interface BanAppealBannerProps {
  dbUser: any;
}

export interface BubbleLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullscreen?: boolean;
}

export interface FaceMoodDetectorProps {
  onMoodDetected: (mood: string, confidence: number) => void;
  onClose: () => void;
}

export interface SignOutProps {
  children?: React.ReactNode;
  redirectUrl?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface TabletDashboardProps {
  userName?: string;
  tasksPending?: number;
  tasksCompleted?: number;
  moodChecks?: number;
  latestMood?: {
    label: string;
    score: number;
    emoji: string;
    color: string;
  } | null;
}

// ==========================================
// Database & Infrastructure Interfaces
// ==========================================

export interface SignOutProps {
  children?: React.ReactNode;
  redirectUrl?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface TabletDashboardProps {
  userName?: string;
  tasksPending?: number;
  tasksCompleted?: number;
  moodChecks?: number;
  latestMood?: {
    label: string;
    score: number;
    emoji: string;
    color: string;
  } | null;
}

// ==========================================
// Database & Infrastructure Interfaces
// ==========================================

export interface MongooseCache {
  conn: typeof import('mongoose') | null;
  promise: Promise<typeof import('mongoose')> | null;
}

// ==========================================
// Mood Theme Interfaces
// ==========================================

export type MoodThemeKey = 'celestial' | 'forest' | 'sunset' | 'ocean' | 'aurora';
export type RoomTheme = MoodThemeKey;
export type DashTheme = MoodThemeKey;
export type ThemeKey = MoodThemeKey;
export type LibraryTheme = MoodThemeKey;

export interface MoodTheme {
  name: string;
  primary: string;
  secondary: string;
  glow: string;
  bgGrad: string;
}

export type ThemeConfig = MoodTheme;

export interface AmbientSelectorProps {
  activeTheme: MoodThemeKey;
  setActiveTheme: (k: MoodThemeKey) => void;
  themes?: Record<MoodThemeKey, MoodTheme>;
}


