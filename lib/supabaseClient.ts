import { createClient } from '@supabase/supabase-js';

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ckuxpwpknsrschojtvrf.supabase.co";
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrdXhwd3BrbnNyc2Nob2p0dnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NDAwOTAsImV4cCI6MjEwNDUxNjA5MH0.PVfQGQqxsSiYHLEYVVvuRToxBarRcuKZYDG89jPaD_o";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);