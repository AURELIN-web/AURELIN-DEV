import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://nmubxfrsutvjbkgsxbna.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tdWJ4ZnJzdXR2amJrZ3N4Ym5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNTY4OTAsImV4cCI6MjEwMzczMjg5MH0.jbBUt59mStYIo6CfROODTFLHQ65BVe1A_DWju5RuDDM";

export const createClient = () =>
  createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
