import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://nlmyljfqacdzrhrjauxx.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sbXlsamZxYWNkenJocmphdXh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MjAwMjIsImV4cCI6MjA4MjI5NjAyMn0.2eAYs4CJWKiCaFFjwCyXTAWUK4AR6anrVXNVOAv6vmQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
