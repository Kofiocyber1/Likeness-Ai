export enum ViewState {
  DASHBOARD = 'DASHBOARD', // "People & Groups"
  SCANNER = 'SCANNER',     // Legacy, can represent the "Scan Yourself" mode
  CHAT = 'CHAT',
  LEGAL = 'LEGAL'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  isAudioPlaying?: boolean;
  hasAudio?: boolean;
  audioBuffer?: AudioBuffer;
  timestamp: Date;
  attachments?: { type: 'image' | 'audio'; url: string; base64?: string }[];
}

export interface DigitalAsset {
  id: string;
  name: string;
  type: 'Image' | 'Code' | 'Voice' | 'Biometric';
  status: 'Protected' | 'Vulnerable' | 'Contracted';
  value: number; // Est. value
  contractedTo?: string;
  thumbnailUrl?: string;
}

export interface ScanResult {
  isAI: boolean;
  confidence: number;
  ipMatches: string[];
  details: string;
  patentScore?: number;
  copyrightScore?: number;
}

export interface FaceGroup {
  id: string;
  name: string;
  count: number;
  coverImage: string;
  type: 'People' | 'Groups';
}
