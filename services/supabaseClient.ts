import { createClient } from '@supabase/supabase-js';

// ВАШ URL из настроек Supabase (согласно вашему ID nnnoqeepxzdfgonljsuk)
const SUPABASE_URL = 'https://nnnoqeepxzdfgonljsuk.supabase.co';

// ВАЖНО: Вставьте ваш ключ (anon public) внутрь кавычек ниже вместо пустой строки.
// Пример: const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const SUPABASE_KEY = 'sb_publishable_SjF1LvHA7_BieV8NmTBOnA_UM78sDx7'; 

// Если ключ не вставлен в кавычки выше, пробуем взять из файла .env
const FINAL_KEY = SUPABASE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!FINAL_KEY) {
  console.error("CRITICAL ERROR: Supabase Key is missing! Please paste it in services/supabaseClient.ts");
}

export const supabase = FINAL_KEY 
  ? createClient(SUPABASE_URL, FINAL_KEY) 
  : null;