import React, { useState, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import * as THREE from "three";

// --- ALLE 26 ORIGINALE TOOLS & LOGOS ---
const TOOL_LOGOS: Record<string, (s?: number) => React.ReactNode> = {
  instagram: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <defs>
        <radialGradient id="igG" cx="0.2" cy="1" r="1">
          <stop offset="0%" stopColor="#ffd521" />
          <stop offset="50%" stopColor="#f50000" />
          <stop offset="100%" stopColor="#b900b4" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#igG)" />
      <circle cx="12" cy="12" r="5" stroke="#fff" strokeWidth="2" />
      <circle cx="18" cy="6" r="1.4" fill="#fff" />
    </svg>
  ),
  tiktok: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="#000">
      <rect width="24" height="24" rx="5" fill="#010101" />
      <path d="M16.6 5.8c-1.1-.7-1.8-1.9-2-3.2h-3v13.5c0 1.6-1.3 2.9-2.9 2.9S5.8 17.7 5.8 16.1s1.3-2.9 2.9-2.9c.3 0 .6.1.9.2V9.8c-.3 0-.6-.1-.9-.1C5 9.7 2 12.6 2 16.1s3 6.4 6.7 6.4 6.7-2.9 6.7-6.4V9.6c1.4 1 3.1 1.6 4.9 1.6V7.7c-1.4 0-2.6-.7-3.7-1.9z" fill="#00f2fe" />
      <path d="M16 5.2c-1.1-.7-1.8-1.9-2-3.2h-2.2v13.5c0 1.6-1.3 2.9-2.9 2.9s-2.9-1.3-2.9-2.9 1.3-2.9 2.9-2.9c.3 0 .6.1.9.2v-3c-.3 0-.6-.1-.9-.1-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6V9.6c1.4 1 3.1 1.6 4.9 1.6V7.4c-1.3 0-2.6-.6-3.8-2.2z" fill="#ffffff" />
    </svg>
  ),
  youtube: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="5" fill="#282828" />
      <path d="M21.6 7.2c-.2-.9-.9-1.6-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4c-.9.2-1.6.9-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8c.2.9.9 1.6 1.8 1.8 1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8z" fill="#ff0000" />
      <polygon points="10 15 15.2 12 10 9" fill="#ffffff" />
    </svg>
  ),
  google: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="5" fill="#ffffff" />
      <path d="M21.35 11.1h-9.17v2.98h5.27c-.23 1.22-.92 2.25-1.95 2.94v2.45h3.16c1.85-1.7 2.92-4.21 2.92-7.18 0-.42-.04-.83-.1-1.22z" fill="#4285f4" />
      <path d="M12.18 21c2.65 0 4.88-.88 6.51-2.39l-3.16-2.45c-.88.59-2 .94-3.35.94-2.58 0-4.76-1.74-5.54-4.08H3.36v2.53C5.01 18.82 8.35 21 12.18 21z" fill="#34a853" />
      <path d="M6.64 13.02c-.2-.59-.31-1.22-.31-1.87s.11-1.28.31-1.87V6.75H3.36C2.69 8.08 2.31 9.58 2.31 11.15s.38 3.07 1.05 4.4l3.28-2.53z" fill="#fbbc05" />
      <path d="M12.18 5.76c1.44 0 2.74.5 3.76 1.47l2.82-2.82C17.06 2.76 14.83 1.8 12.18 1.8 8.35 1.8 5.01 3.98 3.36 7.28l3.28 2.53c.78-2.34 2.96-4.08 5.54-4.08z" fill="#ea4335" />
    </svg>
  ),
  twitch: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="5" fill="#9146ff" />
      <path d="M4.5 3L3 6.75v12.75h4.5V22.5l3-3h3.75L21 12.75V3H4.5zm14.25 9l-2.25 2.25H12.75l-2.25 2.25V14.25H7.5V5.25h11.25V12z" fill="#ffffff" />
      <rect x="14.25" y="8.25" width="2.25" height="4.5" fill="#9146ff" />
      <rect x="9.75" y="8.25" width="2.25" height="4.5" fill="#9146ff" />
    </svg>
  ),
  snapchat: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="5" fill="#fffc00" />
      <path d="M12 4.5c-2.4 0-4.2 1.8-4.2 4.2 0 .6.2 1.5.3 1.8-.6.2-1.2.6-1.2 1.2 0 .5.4.9.9 1-.1.3-.3.9-.3 1.2 0 1.2 1.2 1.8 2.4 1.8.6 0 1.2-.3 1.8-.3s1.2.3 1.8.3c1.2 0 2.4-.6 2.4-1.8 0-.3-.2-.9-.3-1.2.5-.1.9-.5.9-1 0-.6-.6-1-1.2-1.2.1-.3.3-1.2.3-1.8 0-2.4-1.8-4.2-4.2-4.2z" fill="#000000" />
    </svg>
  ),
  linkedin: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="5" fill="#0a66c2" />
      <path d="M7 10v8H4V10h3zM5.5 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm13.5 10h-3v-4c0-1.1-.9-2-2-2s-2 .9-2 2v4h-3v-8h3v1.2c.8-1 2-1.2 3.1-1.2 2.2 0 3.9 1.7 3.9 3.9v4.1z" fill="#fff" />
    </svg>
  ),
  twitter: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="5" fill="#000000" />
      <path d="M18.2 4H21l-6.5 7.5L22 20h-4.8l-3.8-5-4.4 5H6l7-8.1L6 4h5l3.4 4.5L18.2 4zm-.8 14h1.5L8.6 5.8H7l10.4 12.2z" fill="#fff" />
    </svg>
  ),
  gmail: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="5" fill="#ffffff" />
      <path d="M4 6v12h3V10.5l5 3.8 5-3.8V18h3V6l-8 6-8-6z" fill="#ea4335" />
    </svg>
  ),
  whatsapp: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="5" fill="#25d366" />
      <path d="M17.5 14.3c-.3-.1-1.6-.8-1.9-.9-.2-.1-.4-.1-.6.1-.2.3-.7.9-.9 1.1-.1.2-.3.2-.6.1-.3-.1-1.2-.4-2.2-1.3-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.4.1-.2 0-.3 0-.5-.1-.1-.6-1.4-.8-2-.2-.5-.5-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.1 0 1.2.9 2.4 1 2.6.1.2 1.8 2.7 4.3 3.8 2.5 1.1 2.5.7 3 .7.5 0 1.6-.6 1.8-1.3.2-.6.2-1.2.1-1.3-.1-.1-.3-.2-.6-.3z" fill="#ffffff" />
    </svg>
  ),
  gcalendar: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="5" fill="#ffffff" />
      <rect x="4" y="4" width="16" height="4" fill="#4285f4" />
      <text x="12" y="18" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#4285f4">31</text>
    </svg>
  ),
  gmeet: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="5" fill="#00897b" />
      <rect x="4" y="8" width="10" height="8" rx="2" fill="#ffffff" />
      <polygon points="15 10 20 7 20 17 15 14" fill="#ffffff" />
    </svg>
  ),
  slack: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="5" fill="#4a154b" />
      <path d="M5 14a2 2 0 1 0 2-2H5v2zm1 4a2 2 0 1 0 2 2v-2H6zm3-9a2 2 0 1 0-2 2v2h2V9zm4-3a2 2 0 1 0-2-2v2h2V6zm3 4a2 2 0 1 0-2 2h2v-2zm-1 4a2 2 0 1 0-2-2v2h2zm-3 3a2 2 0 1 0 2-2v-2h-2v2zm-4-3a2 2 0 1 0-2 2h2v-2z" fill="#fff" />
    </svg>
  ),
  discord: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="5" fill="#5865f2" />
      <path d="M19.7 5.7c-.7-.3-1.5-.6-2.3-.7 0 0-.2.2-.4.5-.9-.9-1.9-.9-1.9-.9s-1.1 1-2.2 1c-1.1 0-2.2-1-2.2-1s-1 0-1.9.9c-.2-.3-.4-.5-.4-.5-.8.1-1.6.4-2.3.7-1.5 2.2-1.9 4.3-1.7 6.4 1.1.8 2.2 1.3 3.3 1.6.3-.3.5-.7.7-1-.6-.2-1.2-.5-1.7-.9.1-.1.2-.2.3-.3 1.2.6 2.5.9 3.9.9s2.7-.3 3.9-.9c.1.1.2.2.3.3-.5.4-1.1.7-1.7.9.2.3.4.7.7 1 1.1-.3 2.2-.8 3.3-1.6.3-2.3-.3-4.5-1.7-6.4z" fill="#fff" />
    </svg>
  ),
  telegram: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="5" fill="#229ed9" />
      <path d="M19.5 5.5l-15 6 4.5 1.5 1.5 4.5 2.5-3 4.5 3 2-13z" fill="#fff" />
    </svg>
  ),
  github: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="#ffffff">
      <rect width="24" height="24" rx="5" fill="#181717" />
      <path d="M12 2C6.5 2 2 6.5 2 12c0 4.4 2.9 8.2 6.8 9.5.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.4-3.4-1.4-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.7.4-1.1.7-1.4-2.2-.2-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1 .8-.2 1.7-.3 2.5-.3s1.7.1 2.5.3c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.7.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5C19.1 20.2 22 16.4 22 12c0-5.5-4.5-10-10-10z" />
    </svg>
  ),
  apple: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="#ffffff">
      <rect width="24" height="24" rx="5" fill="#000000" />
      <path d="M15.2 12.9c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.8-3.5.8-.7 0-1.9-.8-3.1-.8-1.6 0-3.1.9-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.6.8 1.1 1.7 2.4 3 2.3 1.2 0 1.6-.7 3.1-.7s1.8.7 3.1.7c1.3 0 2.1-1.1 2.9-2.3.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.7-1-2.7-3.9zM13.7 6.1c.6-.8 1.1-1.9.9-3.1-1 .1-2.1.7-2.7 1.5-.6.7-1.1 1.8-.9 2.9 1.1.1 2.1-.5 2.7-1.3z" />
    </svg>
  ),
  openai: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="5" fill="#10a37f" />
      <path d="M12 4c-1.3 0-2.5.4-3.5 1.1-.9-.5-2-.8-3.1-.6-2.3.3-4 2.2-4 4.5 0 .8.2 1.5.6 2.2-.5.9-.6 2-.3 3 1 2.3 3.5 3.5 5.9 2.7.5.8 1.3 1.4 2.2 1.7 1.2.5 2.6.2 3.6-.7.8.7 1.9 1 3 0.7 2.2-.6 3.6-2.8 3.2-5.1 0-.6-.2-1.3-.5-1.8.6-.8.8-1.9.5-2.9-0.8-2.2-3.1-3.6-5.5-3.1-.5-.8-1.3-1.4-2.2-1.7-.5-.2-1-.3-1.5-.3z" fill="#fff" />
    </svg>
  ),
  figma: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="5" fill="#1e1e1e" />
      <path d="M8 19a3 3 0 1 0 0-6H8v6zm8-9a3 3 0 1 0 0-6h-3v6h3zm-8-3a3 3 0 1 0 0-6H5v6h3zm8 6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-8 3a3 3 0 1 0 3-3H8v3z" fill="#f24e1e" />
    </svg>
  ),
  vercel: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="#ffffff">
      <rect width="24" height="24" rx="5" fill="#000000" />
      <polygon points="12,4 20,18 4,18" />
    </svg>
  ),
  supabase: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="5" fill="#1c1c1c" />
      <path d="M12 2L3 13h8v9l9-11h-8V2z" fill="#3ecf8e" />
    </svg>
  ),
  stripe: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="5" fill="#635bff" />
      <path d="M13.6 9.4c0-.7-.6-1.1-1.6-1.1-1.4 0-3.2.5-4.4 1.1L6.9 6.6C8.3 6 10.3 5.6 12.1 5.6c3.8 0 5.9 1.8 5.9 4.9 0 4.1-5.6 4.3-5.6 6.5 0 .9.7 1.2 1.8 1.2 1.6 0 3.7-.7 5.1-1.4l.6 2.8c-1.5.8-3.9 1.3-5.8 1.3-4 0-6.2-1.9-6.2-4.9 0-4.3 5.7-4.5 5.7-6.6z" fill="#ffffff" />
    </svg>
  ),
  paypal: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="5" fill="#003087" />
      <path d="M15 7.5h-4.2c-.4 0-.8.3-.9.7l-1.8 11.2c-.1.4.2.8.6.8h2.3c.4 0 .8-.3.9-.7l.4-2.5h1.7c3.1 0 5.1-1.5 5.5-4.4.3-1.9-.3-3.2-1.5-4.1-.9-.7-2.1-1-3.0-1z" fill="#0079c1" />
    </svg>
  ),
  analytics: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="5" fill="#f97316" />
      <rect x="5" y="13" width="3" height="6" rx="1" fill="#fff" />
      <rect x="10.5" y="9" width="3" height="10" rx="1" fill="#fff" />
      <rect x="16" y="5" width="3" height="14" rx="1" fill="#fff" />
    </svg>
  ),
  posthog: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="5" fill="#ffd500" />
      <circle cx="9" cy="10" r="1.5" fill="#000" />
      <circle cx="15" cy="10" r="1.5" fill="#000" />
    </svg>
  ),
  clarity: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="5" fill="#0078d4" />
      <circle cx="11" cy="11" r="5" stroke="#fff" strokeWidth="2" fill="none" />
      <line x1="15" y1="15" x2="20" y2="20" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
};

export interface PlatformTool {
  id: string;
  name: string;
  url: string;
  angle: number;
}

const ALL_TOOLS: PlatformTool[] = [
  { id: "instagram", name: "Instagram", url: "https://instagram.com", angle: 0.1 },
  { id: "tiktok", name: "TikTok", url: "https://tiktok.com", angle: 0.35 },
  { id: "youtube", name: "YouTube", url: "https://youtube.com", angle: 0.6 },
  { id: "twitch", name: "Twitch", url: "https://twitch.tv", angle: 0.85 },
  { id: "snapchat", name: "Snapchat", url: "https://web.snapchat.com", angle: 1.1 },
  { id: "linkedin", name: "LinkedIn", url: "https://linkedin.com", angle: 1.35 },
  { id: "twitter", name: "X", url: "https://x.com", angle: 1.6 },
  { id: "gmail", name: "Gmail", url: "https://mail.google.com", angle: 1.9 },
  { id: "whatsapp", name: "WhatsApp", url: "https://web.whatsapp.com", angle: 2.15 },
  { id: "gcalendar", name: "Calendar", url: "https://calendar.google.com", angle: 2.4 },
  { id: "gmeet", name: "Meet", url: "https://meet.google.com", angle: 2.65 },
  { id: "slack", name: "Slack", url: "https://slack.com", angle: 2.9 },
  { id: "discord", name: "Discord", url: "https://discord.com", angle: 3.15 },
  { id: "telegram", name: "Telegram", url: "https://web.telegram.org", angle: 3.4 },
  { id: "github", name: "GitHub", url: "https://github.com", angle: 3.7 },
  { id: "apple", name: "Apple Dev", url: "https://developer.apple.com", angle: 3.95 },
  { id: "openai", name: "OpenAI", url: "https://platform.openai.com", angle: 4.2 },
  { id: "figma", name: "Figma", url: "https://figma.com", angle: 4.45 },
  { id: "vercel", name: "Vercel", url: "https://vercel.com", angle: 4.7 },
  { id: "supabase", name: "Supabase", url: "https://supabase.com", angle: 4.95 },
  { id: "stripe", name: "Stripe", url: "https://dashboard.stripe.com", angle: 5.25 },
  { id: "paypal", name: "PayPal", url: "https://paypal.com", angle: 5.5 },
  { id: "analytics", name: "Analytics", url: "https://analytics.google.com", angle: 5.75 },
  { id: "posthog", name: "PostHog", url: "https://posthog.com", angle: 6.0 },
  { id: "clarity", name: "Clarity", url: "https://clarity.microsoft.com", angle: 6.2 }
];

export interface AgentPersona {
  id: string;
  name: string;
  role: string;
  departmentId: string;
  avatarColor: string;
  angle: number;
  mindset: string;
  specialty: string;
  authorizedTools: string[];
}

export interface DepartmentNode {
  id: string;
  name: string;
  subTitle: string;
  symbol: string;
  color: string;
  angle: number;
}

const DEPARTMENTS: Record<string, DepartmentNode> = {
  tech: { id: "tech", name: "Fulfillment & Technik", subTitle: "Entwicklung & Bots", symbol: "⚙️", color: "#f59e0b", angle: 1.57 },
  vertrieb: { id: "vertrieb", name: "Vertrieb & Outreach", subTitle: "Sales & Pipeline", symbol: "🎯", color: "#84cc16", angle: 3.14 },
  marketing: { id: "marketing", name: "Marketing & Growth", subTitle: "Content & Viralität", symbol: "📢", color: "#38bdf8", angle: 4.71 },
  finance: { id: "finance", name: "Finanzen & Audit", subTitle: "Cashflow & Legal", symbol: "€", color: "#cbd5e1", angle: 0.0 }
};

const INITIAL_AGENTS: AgentPersona[] = [
  { id: "a1", name: "Leon", role: "Lead-Entwickler", departmentId: "tech", avatarColor: "#f59e0b", angle: 1.35, mindset: "Pragmatisch, baut Code.", specialty: "Full-Stack", authorizedTools: ["github", "vercel", "supabase"] },
  { id: "a2", name: "Paula", role: "QA-Testerin", departmentId: "tech", avatarColor: "#fbbf24", angle: 1.50, mindset: "Skeptisch, sucht Bugs.", specialty: "Bug-Tracking", authorizedTools: ["github", "posthog"] },
  { id: "a3", name: "Sebastian", role: "Architekt", departmentId: "tech", avatarColor: "#d97706", angle: 1.65, mindset: "Plant APIs.", specialty: "Datenbank", authorizedTools: ["github", "apple", "supabase"] },
  { id: "a4", name: "Julian", role: "Automation Bot", departmentId: "tech", avatarColor: "#eab308", angle: 1.80, mindset: "Browser-Aktionen.", specialty: "Playwright", authorizedTools: ["github", "gmail", "whatsapp"] },

  { id: "a5", name: "Aurelius", role: "Vertriebs-Lead", departmentId: "vertrieb", avatarColor: "#84cc16", angle: 2.92, mindset: "B2B Abschlüsse.", specialty: "Pitch", authorizedTools: ["gmail", "linkedin", "whatsapp", "gcalendar"] },
  { id: "a6", name: "Sarah", role: "Einwandbehandlung", departmentId: "vertrieb", avatarColor: "#65a30d", angle: 3.14, mindset: "Aus Kundensicht.", specialty: "Psychologie", authorizedTools: ["gmail", "whatsapp", "gmeet"] },
  { id: "a7", name: "Marco", role: "Closing Lead", departmentId: "vertrieb", avatarColor: "#4d7c0f", angle: 3.36, mindset: "Direkt & sicher.", specialty: "Closer", authorizedTools: ["stripe", "gmail", "whatsapp"] },

  { id: "a8", name: "Jonas", role: "Creative Director", departmentId: "marketing", avatarColor: "#38bdf8", angle: 4.45, mindset: "Starke Hooks.", specialty: "Social Master", authorizedTools: ["instagram", "tiktok", "youtube", "figma"] },
  { id: "a9", name: "Mia", role: "Data-Analystin", departmentId: "marketing", avatarColor: "#0284c7", angle: 4.62, mindset: "Zahlenbasiert.", specialty: "CTR & Views", authorizedTools: ["instagram", "tiktok", "analytics"] },
  { id: "a10", name: "Elena", role: "Community Lead", departmentId: "marketing", avatarColor: "#06b6d4", angle: 4.80, mindset: "Kundenbindung.", specialty: "DMs", authorizedTools: ["instagram", "twitch", "snapchat", "discord"] },
  { id: "a11", name: "David", role: "Copywriter", departmentId: "marketing", avatarColor: "#0ea5e9", angle: 4.98, mindset: "Texte im Kopf.", specialty: "Captions", authorizedTools: ["instagram", "youtube", "twitter"] },

  { id: "a12", name: "Gideon", role: "CFO & Controller", departmentId: "finance", avatarColor: "#94a3b8", angle: 6.05, mindset: "Kostenkontrolle.", specialty: "Budget", authorizedTools: ["stripe", "paypal"] },
  { id: "a13", name: "Nadia", role: "Risiko-Auditorin", departmentId: "finance", avatarColor: "#cbd5e1", angle: 6.22, mindset: "Compliance.", specialty: "Audit", authorizedTools: ["stripe", "clarity"] },
  { id: "a14", name: "Victor", role: "Unit Economics", departmentId: "finance", avatarColor: "#64748b", angle: 0.15, mindset: "Margen.", specialty: "ROI", authorizedTools: ["stripe", "analytics"] }
];

const RAD_DEPT = 3.6;
const RAD_TOOLS = 6.2;
const RAD_AGENTS = 8.6;

// --- BILLBOARD 3D KERN (DREHT SICH IM KREIS MIT GLEICHEM SCHARFEN G-LOGO) ---
function BillboardHologramCore() {
  const { camera } = useThree();
  const badgeRef = useRef<THREE.Group>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const pointsRef = useRef<THREE.Points>(null!);

  const particleCount = 600;
  const particles = useMemo(() => {
    const coords = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 1.1 + Math.random() * 0.4;
      coords[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      coords[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.8;
      coords[i * 3 + 2] = r * Math.cos(phi);
    }
    return coords;
  }, []);

  useFrame((state, delta) => {
    if (ringRef.current) ringRef.current.rotation.z -= delta * 0.3;
    if (pointsRef.current) pointsRef.current.rotation.y += delta * 0.4;
    if (badgeRef.current) {
      // Billboard-Effekt: Das Zentrum dreht sich exakt zur Kamera, damit G & JARVIS immer klar lesbar sind
      badgeRef.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <group position={[0, 0.2, 0]}>
      {/* Rotierender Ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.35, 1.5, 64]} />
        <meshBasicMaterial color="#ea580c" transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>

      {/* Partikel */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={particleCount} array={particles} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.06} color="#fb923c" transparent opacity={0.85} />
      </points>

      {/* 3D Billboard Logo in der Mitte */}
      <group ref={badgeRef} position={[0, 0, 0]}>
        <Html center zIndexRange={[1, 30]}>
          <div style={{
            width: "95px", height: "95px", borderRadius: "24px",
            background: "linear-gradient(145deg, #141c2d, #070a12)",
            border: "2.5px solid rgba(234, 88, 12, 0.9)",
            boxShadow: "0 0 40px rgba(234, 88, 12, 0.6), inset 0 0 15px rgba(234, 88, 12, 0.4)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            cursor: "pointer", userSelect: "none"
          }}>
            <span style={{ fontSize: "30px", fontWeight: "900", color: "#ffffff", letterSpacing: "1px", textShadow: "0 0 14px #ea580c, 0 0 25px #f97316" }}>G</span>
            <span style={{ fontSize: "10px", fontWeight: "900", color: "#fb923c", letterSpacing: "2.5px", textShadow: "0 0 10px #ea580c" }}>JARVIS</span>
          </div>
        </Html>
      </group>
    </group>
  );
}

export default function App() {
  const [agents, setAgents] = useState<AgentPersona[]>(() => {
    const s = localStorage.getItem("jarvis_v3_agents");
    return s ? JSON.parse(s) : INITIAL_AGENTS;
  });

  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("qwen2.5-coder:14b");
  const [ollamaOnline, setOllamaOnline] = useState<boolean>(false);

  const [hoveredEntity, setHoveredEntity] = useState<{ type: "agent" | "tool" | "dept"; id: string } | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  const [sysProfile, setSysProfile] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<string>(() => localStorage.getItem("jarvis_user_profile") || "");

  const [missionInput, setMissionInput] = useState<string>(""); // 100% LEER!
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [logs, setLogs] = useState<Array<{ sender: string; role: string; color: string; text: string }>>([]);
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    localStorage.setItem("jarvis_v3_agents", JSON.stringify(agents));
  }, [agents]);

  useEffect(() => {
    localStorage.setItem("jarvis_user_profile", userProfile);
  }, [userProfile]);

  useEffect(() => {
    const u = () => setCurrentTime(new Date().toLocaleTimeString("de-DE"));
    u();
    const t = setInterval(u, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const bridge = (window as any).jarvisBridge;
    if (bridge && bridge.getSystemProfile) {
      bridge.getSystemProfile().then((p: any) => setSysProfile(p));
    }

    fetch("http://127.0.0.1:11434/api/tags")
      .then((r) => r.json())
      .then((d) => {
        const m = (d.models || []).map((x: any) => x.name);
        setAvailableModels(m);
        setOllamaOnline(true);
        if (m.includes("qwen2.5-coder:14b")) setSelectedModel("qwen2.5-coder:14b");
        else if (m.length > 0) setSelectedModel(m[0]);
      })
      .catch(() => setOllamaOnline(false));
  }, []);

  const openExternal = (url: string) => {
    const bridge = (window as any).jarvisBridge;
    if (bridge && bridge.openInDefaultBrowser) {
      bridge.openInDefaultBrowser(url);
    } else {
      window.open(url, "_blank");
    }
  };

  const executeCommand = async () => {
    if (!missionInput.trim() || isExecuting) return;
    setIsExecuting(true);
    const cmd = missionInput.trim();
    setLogs([]);

    const addLog = (sender: string, role: string, color: string, text: string) => {
      setLogs((prev) => [...prev, { sender, role, color, text }]);
    };

    try {
      addLog("JARVIS", "Master-Kopf", "#ea580c", `Befehl: "${cmd}". Starte Ausführung.`);

      const jarvisRes = await fetch("http://127.0.0.1:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          prompt: `Du bist JARVIS. System: ${sysProfile?.hostname || "PC"}. Befehl: "${cmd}". Weise die Aufgabe zu.`,
          stream: false
        })
      });
      const jarvisData = await jarvisRes.json();
      addLog("JARVIS", "Master-Kopf", "#ea580c", jarvisData.response);

      const isMarketing = cmd.toLowerCase().includes("insta") || cmd.toLowerCase().includes("social") || cmd.toLowerCase().includes("post");
      const activeAgent = isMarketing ? agents.find(a => a.id === "a8")! : agents.find(a => a.id === "a1")!;

      setSelectedAgentId(activeAgent.id);
      addLog(activeAgent.name, activeAgent.role, activeAgent.avatarColor, `Führe Aufgabe aus...`);

      const workerRes = await fetch("http://127.0.0.1:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          prompt: `Du bist ${activeAgent.name}, ${activeAgent.role}. Befehl: "${cmd}". Liefere das Resultat.`,
          stream: false
        })
      });
      const workerData = await workerRes.json();
      addLog(activeAgent.name, activeAgent.role, activeAgent.avatarColor, workerData.response);
    } catch (e: any) {
      addLog("JARVIS", "Error", "#ef4444", "Fehler: " + e.message);
    } finally {
      setIsExecuting(false);
    }
  };

  // REINE ABDUNKEL-LOGIK (DIMMING)
  const isDimmed = (type: string, id: string) => {
    if (!hoveredEntity) return false;
    if (hoveredEntity.type === type && hoveredEntity.id === id) return false;
    if (hoveredEntity.type === "tool") {
      const toolId = hoveredEntity.id;
      if (type === "agent") {
        const ag = agents.find(a => a.id === id);
        return !ag?.authorizedTools.includes(toolId);
      }
      return true;
    }
    if (hoveredEntity.type === "agent") {
      const ag = agents.find(a => a.id === hoveredEntity.id);
      if (type === "tool") return !ag?.authorizedTools.includes(id);
      if (type === "dept") return ag?.departmentId !== id;
      return true;
    }
    if (hoveredEntity.type === "dept") {
      if (type === "agent") {
        const ag = agents.find(a => a.id === id);
        return ag?.departmentId !== hoveredEntity.id;
      }
      return true;
    }
    return false;
  };

  const isLineHighlighted = (agentId: string, toolId?: string) => {
    if (!hoveredEntity) return false;
    if (hoveredEntity.type === "agent" && hoveredEntity.id === agentId) return true;
    if (hoveredEntity.type === "tool" && toolId && hoveredEntity.id === toolId) return true;
    if (hoveredEntity.type === "dept") {
      const ag = agents.find(a => a.id === agentId);
      return ag?.departmentId === hoveredEntity.id;
    }
    return false;
  };

  const selectedAgent = selectedAgentId ? agents.find((a) => a.id === selectedAgentId) : null;

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden", background: "#05070d", color: "#f8fafc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>

      {/* HEADER */}
      <header style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "54px", zIndex: 60,
        display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 28px",
        background: "rgba(5, 7, 13, 0.88)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontSize: "16px", fontWeight: "900", letterSpacing: "1px", color: "#ffffff" }}>JARVIS</span>
            <span style={{ fontSize: "9px", color: "#ea580c", fontWeight: "800", letterSpacing: "1.5px" }}>2.0 MASTER</span>
          </div>

          <div style={{ display: "flex", gap: "16px", fontSize: "11px", letterSpacing: "1px", color: "#94a3b8" }}>
            <span><strong style={{ color: "#ffffff" }}>4</strong> BEREICHE</span>
            <span><strong style={{ color: "#ffffff" }}>{agents.length}</strong> AGENTEN</span>
            <span><strong style={{ color: "#ffffff" }}>{ALL_TOOLS.length}</strong> TOOLS</span>
            {sysProfile && <span style={{ color: "#38bdf8" }}>PC: <strong>{sysProfile.hostname}</strong></span>}
          </div>
        </div>

        {/* EINGABEFELD: 100% LEER! */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            value={missionInput}
            onChange={(e) => setMissionInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && executeCommand()}
            disabled={isExecuting}
            placeholder=""
            style={{ width: "420px", background: "#0a0f1a", border: "1px solid rgba(255,255,255,0.15)", color: "#ffffff", padding: "7px 14px", borderRadius: "8px", fontSize: "12px", outline: "none" }}
          />
          <button
            onClick={executeCommand}
            disabled={isExecuting}
            style={{ background: isExecuting ? "#334155" : "#ea580c", color: "#fff", border: "none", padding: "7px 18px", borderRadius: "8px", fontWeight: "bold", fontSize: "11px", cursor: "pointer" }}
          >
            {isExecuting ? "Läuft..." : "▶ Ausführen"}
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "11px" }}>
          <button
            onClick={() => setShowSettingsModal(true)}
            style={{ background: "#1e293b", border: "1px solid #38bdf8", color: "#38bdf8", padding: "5px 12px", borderRadius: "6px", fontSize: "10px", fontWeight: "bold", cursor: "pointer" }}
          >
            ⚙️ Konten & DB
          </button>
          <span style={{ color: ollamaOnline ? "#22c55e" : "#ef4444", fontWeight: "bold", fontSize: "10px" }}>● {ollamaOnline ? "ONLINE" : "OFFLINE"}</span>
          <span style={{ fontFamily: "monospace", color: "#64748b" }}>{currentTime}</span>
        </div>
      </header>

      {/* 3D VIEWPORT */}
      <div style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, zIndex: 1 }}>
        <Canvas camera={{ position: [0, 18, 12], fov: 42 }}>
          <ambientLight intensity={0.9} />
          <pointLight position={[0, 6, 0]} intensity={2.4} color="#ea580c" />
          <OrbitControls enableDamping dampingFactor={0.06} minDistance={4} maxDistance={35} />

          <group rotation={[-Math.PI / 2, 0, 0]}>
            <mesh><ringGeometry args={[RAD_DEPT - 0.02, RAD_DEPT + 0.02, 128]} /><meshBasicMaterial color="#1e293b" transparent opacity={0.35} /></mesh>
            <mesh><ringGeometry args={[RAD_TOOLS - 0.02, RAD_TOOLS + 0.02, 128]} /><meshBasicMaterial color="#1e293b" transparent opacity={0.35} /></mesh>
            <mesh><ringGeometry args={[RAD_AGENTS - 0.02, RAD_AGENTS + 0.02, 128]} /><meshBasicMaterial color="#1e293b" transparent opacity={0.35} /></mesh>
          </group>

          {/* DREHBARER 3D HOLOGRAPHISCHER KERN */}
          <BillboardHologramCore />

          {/* 1. LASER: JARVIS -> DEPT */}
          {Object.values(DEPARTMENTS).map((d) => {
            const dx = RAD_DEPT * Math.cos(d.angle);
            const dz = RAD_DEPT * Math.sin(d.angle);
            const isHovered = hoveredEntity?.type === "dept" && hoveredEntity.id === d.id;
            const dimmed = hoveredEntity && !isHovered;

            return (
              <group key={"dept-laser-" + d.id}>
                <Line points={[[0, 0.2, 0], [dx, 0.2, dz]]} color={d.color} lineWidth={isHovered ? 2.8 : 1.2} transparent opacity={dimmed ? 0.08 : 0.6} />
                <mesh position={[dx, 0.15, dz]}><cylinderGeometry args={[0.55, 0.55, 0.2, 24]} /><meshStandardMaterial color="#090d16" emissive={d.color} emissiveIntensity={0.6} /></mesh>
                <Html position={[dx, 0.35, dz]} center distanceFactor={14} zIndexRange={[1, 30]}>
                  <div
                    onMouseEnter={() => setHoveredEntity({ type: "dept", id: d.id })}
                    onMouseLeave={() => setHoveredEntity(null)}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer",
                      opacity: isDimmed("dept", d.id) ? 0.12 : 1, transition: "0.2s all"
                    }}
                  >
                    <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#080c16", border: `2px solid ${d.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", boxShadow: `0 0 16px ${d.color}66` }}>
                      {d.symbol}
                    </div>
                    <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", background: "rgba(5, 7, 13, 0.95)", padding: "3px 8px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.12)" }}>
                      <span style={{ fontSize: "10px", fontWeight: "900", color: "#ffffff", whiteSpace: "nowrap" }}>{d.name}</span>
                      <span style={{ fontSize: "8px", color: d.color, fontWeight: "700" }}>{d.subTitle}</span>
                    </div>
                  </div>
                </Html>
              </group>
            );
          })}

          {/* 2. LASER: DEPT -> AGENT */}
          {agents.map((a) => {
            const dept = DEPARTMENTS[a.departmentId];
            const dx = RAD_DEPT * Math.cos(dept.angle);
            const dz = RAD_DEPT * Math.sin(dept.angle);
            const ax = RAD_AGENTS * Math.cos(a.angle);
            const az = RAD_AGENTS * Math.sin(a.angle);
            const isHighlighted = isLineHighlighted(a.id);
            const dimmed = hoveredEntity && !isHighlighted;

            return (
              <group key={"agent-laser-" + a.id}>
                <Line points={[[dx, 0.2, dz], [ax, 0.2, az]]} color={dept.color} lineWidth={isHighlighted ? 2.8 : 1.0} transparent opacity={dimmed ? 0.08 : 0.45} />
                <mesh position={[ax, 0.2, az]}><cylinderGeometry args={[0.42, 0.42, 0.2, 24]} /><meshStandardMaterial color="#0f172a" emissive={a.avatarColor} emissiveIntensity={0.5} /></mesh>
                <Html position={[ax, 0.45, az]} center distanceFactor={14} zIndexRange={[1, 30]}>
                  <div
                    onClick={() => setSelectedAgentId(selectedAgentId === a.id ? null : a.id)}
                    onMouseEnter={() => setHoveredEntity({ type: "agent", id: a.id })}
                    onMouseLeave={() => setHoveredEntity(null)}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer",
                      opacity: isDimmed("agent", a.id) ? 0.12 : 1, transition: "0.2s all"
                    }}
                  >
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#0c1322", border: `2px solid ${selectedAgentId === a.id ? "#ffffff" : a.avatarColor}`, display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "13px", fontWeight: "900", boxShadow: `0 0 12px ${a.avatarColor}66` }}>
                      {a.name[0]}
                    </div>
                    <div style={{ marginTop: "4px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", background: "rgba(5, 7, 13, 0.95)", padding: "2px 6px", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <span style={{ fontSize: "10px", fontWeight: "800", color: "#ffffff", whiteSpace: "nowrap" }}>{a.name}</span>
                      <span style={{ fontSize: "8px", color: "#94a3b8" }}>{a.role}</span>
                    </div>
                  </div>
                </Html>
              </group>
            );
          })}

          {/* 3. LASER: AGENT -> TOOLS */}
          {agents.map((a) => {
            const ax = RAD_AGENTS * Math.cos(a.angle);
            const az = RAD_AGENTS * Math.sin(a.angle);

            return a.authorizedTools.map((tId) => {
              const tool = ALL_TOOLS.find(p => p.id === tId);
              if (!tool) return null;
              const tx = RAD_TOOLS * Math.cos(tool.angle);
              const tz = RAD_TOOLS * Math.sin(tool.angle);
              const isHighlighted = isLineHighlighted(a.id, tool.id);
              const dimmed = hoveredEntity && !isHighlighted;

              return (
                <Line
                  key={`tool-link-${a.id}-${tool.id}`}
                  points={[[ax, 0.2, az], [tx, 0.15, tz]]}
                  color={tool.color}
                  lineWidth={isHighlighted ? 2.6 : 0.75}
                  transparent
                  opacity={dimmed ? 0.05 : isHighlighted ? 0.9 : 0.22}
                />
              );
            });
          })}

          {/* TOOLS MIT ECHTEN SVG LOGOS */}
          {ALL_TOOLS.map((t) => {
            const tx = RAD_TOOLS * Math.cos(t.angle);
            const tz = RAD_TOOLS * Math.sin(t.angle);
            const isHovered = hoveredEntity?.type === "tool" && hoveredEntity.id === t.id;

            return (
              <group key={"tool-node-" + t.id} position={[tx, 0.1, tz]}>
                <Html center distanceFactor={14} zIndexRange={[1, 30]}>
                  <div
                    onClick={() => openExternal(t.url)}
                    onMouseEnter={() => setHoveredEntity({ type: "tool", id: t.id })}
                    onMouseLeave={() => setHoveredEntity(null)}
                    title={t.name}
                    style={{
                      width: "32px", height: "32px", borderRadius: "50%",
                      background: "#090d16", border: "1.5px solid rgba(255,255,255,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                      opacity: isDimmed("tool", t.id) ? 0.12 : 1, transition: "0.2s all",
                      overflow: "hidden", boxShadow: "0 0 10px rgba(0,0,0,0.5)",
                      transform: isHovered ? "scale(1.3)" : "scale(1)"
                    }}
                  >
                    {TOOL_LOGOS[t.id] ? TOOL_LOGOS[t.id](20) : <span style={{ fontSize: "9px", fontWeight: "bold" }}>{t.name[0]}</span>}
                  </div>
                </Html>
              </group>
            );
          })}
        </Canvas>
      </div>

      {/* RECHTES PROTOKOLL */}
      <aside style={{
        position: "absolute", top: "70px", bottom: "24px", right: "24px", width: "420px", zIndex: 50,
        background: "rgba(9, 13, 22, 0.95)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "14px", padding: "18px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 20px 50px rgba(0,0,0,0.7)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "10px" }}>
          <span style={{ fontSize: "12px", fontWeight: "900", letterSpacing: "1px", color: "#ffffff" }}>AGENTEN PROTOKOLL</span>
          {logs.length > 0 && (
            <button onClick={() => setLogs([])} style={{ background: "transparent", border: "none", color: "#64748b", fontSize: "10px", cursor: "pointer" }}>Leeren</button>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
          {logs.length === 0 ? null : (
            logs.map((l, i) => (
              <div key={i} style={{ background: "#05070d", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "900", color: l.color }}>{l.sender} <span style={{ fontSize: "9px", color: "#64748b", fontWeight: "normal" }}>({l.role})</span></span>
                </div>
                <div style={{ fontSize: "11px", color: "#cbd5e1", lineHeight: "1.45", whiteSpace: "pre-wrap" }}>{l.text}</div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* MODAL FÜR KONTEN & DB */}
      {showSettingsModal && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "720px", maxHeight: "88vh", background: "#090d16", border: "1px solid #334155", borderRadius: "14px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "0 20px 60px #000", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "900" }}>Master-Konten & Lokale Datenbank</h2>
              <button onClick={() => setShowSettingsModal(false)} style={{ background: "#1e293b", border: "none", color: "#fff", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: "bold", color: "#38bdf8" }}>Persönlicher Gedächtnis-Kontext:</span>
              <textarea
                value={userProfile}
                onChange={(e) => setUserProfile(e.target.value)}
                placeholder=""
                rows={4}
                style={{ width: "100%", background: "#020617", border: "1px solid #334155", color: "#fff", padding: "10px", borderRadius: "8px", fontSize: "11px", fontFamily: "monospace", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "11px", fontWeight: "bold", color: "#38bdf8" }}>Verfügbare Tools & Plattformen (Klick öffnet Standard-Browser):</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                {ALL_TOOLS.map((p) => (
                  <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#020617", border: "1px solid #1e293b", borderRadius: "6px", padding: "6px 10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "18px", height: "18px" }}>{TOOL_LOGOS[p.id] ? TOOL_LOGOS[p.id](16) : null}</div>
                      <span style={{ fontSize: "11px", fontWeight: "bold" }}>{p.name}</span>
                    </div>
                    <button
                      onClick={() => openExternal(p.url)}
                      style={{ background: "#1e293b", border: "1px solid #38bdf8", color: "#38bdf8", padding: "3px 6px", borderRadius: "4px", fontSize: "9px", fontWeight: "bold", cursor: "pointer" }}
                    >
                      🔗
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowSettingsModal(false)}
              style={{ background: "#22c55e", border: "none", color: "#fff", padding: "10px", borderRadius: "6px", fontWeight: "bold", fontSize: "11px", cursor: "pointer" }}
            >
              Speichern & Schließen
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
