import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Preste muita atenção nesta linha abaixo, o 'export' precisa estar aqui:
export const supabase = createClient(supabaseUrl, supabaseAnonKey)