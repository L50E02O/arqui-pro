import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const bucketUrl = import.meta.env.VITE_BUCKET_URL;

// Supabase ÚNICAMENTE debe ser usado para subir las imagenes a supabase Storage
// NO USAR NINGUN ENTPOINT DEL SCHEMA PUBLIC!!!!
export const supabase = createClient(supabaseUrl, supabaseAnonKey);