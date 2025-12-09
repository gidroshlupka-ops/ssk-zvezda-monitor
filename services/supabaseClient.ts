import { createClient } from '@supabase/supabase-js';

// Access environment variables. 
// In a real CRA/Vite app these are typically import.meta.env or process.env
// For this environment, we assume they are injected or hardcoded if needed for demo.

const SUPABASE_URL = 'https://nnnoqeepxzdfgonljsuk.supabase.co';
// WARNING: In a real production app, ensure Anon Key is restricted by RLS (Row Level Security)
// Since this is a demo/diploma, we use it directly. 
// User needs to provide their key here or in env vars.
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || ''; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);