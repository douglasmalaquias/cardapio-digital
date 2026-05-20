import { createClient } from '@supabase/supabase-js';

// Substitua PELAS SUAS CHAVES REAIS abaixo
const supabaseUrl = 'https://odrlpybmrkpczxgojmaj.supabase.co';
const supabaseAnonKey =eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kcmxweWJtcmtwY3p4Z29qbWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNjUxMTcsImV4cCI6MjA5NDc0MTExN30.gcEdo3Kx6qYJh3YmFp8u-bSGBqSEgypXFkxgikDVSLc

export const supabase = createClient(supabaseUrl, supabaseAnonKey);