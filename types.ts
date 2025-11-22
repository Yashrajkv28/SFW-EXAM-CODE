import { Timestamp } from "firebase/firestore";

export interface Profile {
  name: string;
  title: string;
  bio: string;
  profileImageUrl: string;
  githubUrl?: string;
  linkedinUrl?: string;
}

export interface Skill {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  liveUrl: string;
  repoUrl: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: Timestamp;
}
