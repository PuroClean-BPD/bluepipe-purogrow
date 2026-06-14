// External Supabase client for reading audit_runs (read-only).
// This is a different project from the Lovable Cloud backend used for auth.
import { createClient } from "@supabase/supabase-js";

const EXTERNAL_SUPABASE_URL = "https://clikjnwgfiipvapjezhb.supabase.co";
const EXTERNAL_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsaWtqbndnZmlpcHZhcGplemhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyOTU4MDAsImV4cCI6MjA5Njg3MTgwMH0.dHtjdIPQswGhBkwI1ZwLUroTfPz95OFmu3zBHL771JA";

export const externalSupabase = createClient(
  EXTERNAL_SUPABASE_URL,
  EXTERNAL_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export interface AuditRun {
  id: string;
  created_at: string;
  processed_at: string | null;
  client_slug: string;
  status: string | null;
  report_narrative: string | null;
  screaming_frog: {
    totalHtmlPages?: number;
    summary?: {
      broken?: number;
      redirects?: number;
      missingTitle?: number;
      shortTitle?: number;
      longTitle?: number;
      duplicateTitle?: number;
      missingMeta?: number;
      shortMeta?: number;
      longMeta?: number;
      duplicateMeta?: number;
      missingH1?: number;
      multipleH1?: number;
      nonIndexable?: number;
      thinContent?: number;
    };
    issues?: {
      broken?: Array<{ url: string; status?: number }>;
      redirects?: Array<{ url: string; status?: number }>;
      missingTitle?: Array<string | { url: string }>;
      longTitle?: Array<{ url: string; title?: string; length?: number }>;
      shortTitle?: Array<{ url: string; title?: string; length?: number }>;
      duplicateTitle?: Array<{ url: string; title?: string }>;
      missingMeta?: Array<string | { url: string }>;
      longMeta?: Array<{ url: string; meta?: string; length?: number }>;
      shortMeta?: Array<{ url: string; meta?: string; length?: number }>;
      duplicateMeta?: Array<{ url: string; meta?: string }>;
      missingH1?: Array<string | { url: string }>;
      multipleH1?: Array<{ url: string; h1?: string; h1_2?: string }>;
      nonIndexable?: Array<{ url: string; reason?: string }>;
      thinContent?: Array<{ url: string; wordCount?: number }>;
    };
  } | null;
  leadsnap: {
    gbp?: {
      name?: string;
      address?: string;
      phone?: string;
      reviewCount?: number;
      avgRating?: number;
      ranking?: number;
      mainCategory?: string;
    };
    grid?: {
      totalPoints?: number;
      top3?: number;
      top10?: number;
      beyond10?: number;
      avgRank?: number;
      top3Pct?: number;
      top10Pct?: number;
    };
  } | null;
  pagespeed: {
    performance?: number;
    accessibility?: number;
    bestPractices?: number;
    seo?: number;
    fcp?: number | string;
    lcp?: number | string;
    tbt?: number | string;
    cls?: number | string;
    speedIndex?: number | string;
  } | null;
  domain_metrics: {
    organicTraffic?: number;
    organicKeywords?: number;
    domainRank?: number;
  } | null;
  top_keywords: Array<{ keyword: string; position: number; searchVolume: number }> | null;
  top_competitors: Array<{ domain: string; commonKeywords: number; organicTraffic: number }> | null;
}
