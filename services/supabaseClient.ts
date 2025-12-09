import { createClient } from '@supabase/supabase-js';

// URL вашего проекта из настроек Data API (согласно скриншоту)
const SUPABASE_URL = 'https://nnnoqeepxzdfgonljsuk.supabase.co';

// Анонимный ключ (public key). 
// В Vite переменные окружения обязательно должны начинаться с VITE_ и вызываться через import.meta.env
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Создаем клиент. 
// Если ключа нет (например, не создан файл .env), возвращаем null, чтобы сайт не падал с ошибкой.
export const supabase = (SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;