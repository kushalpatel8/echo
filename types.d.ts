import type { Document } from 'mongoose';

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
// Community & Interaction Interfaces
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
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: Date;
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
  onStart?: () => void;
  onStop?: () => void;
  hasSpeechSupport?: boolean;
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
  name: string;
  duration: number;
  instruction: string;
}

export interface SoundscapeOption {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  audioUrl: string;
}

export interface Helper {
  clerkId: string;
  name: string;
  imageUrl: string;
  role: 'volunteer' | 'doctor';
  volunteerProfile?: VolunteerProfile;
  doctorProfile?: DoctorProfile;
  lastSeen?: string;
  isOnline?: boolean;
}

export interface RoleDetail {
  role: string;
  title: string;
  icon: any;
  color: string;
  description: string;
  keyResponsibilities: string[];
  eligibility: string[];
  permissions: string[];
}
