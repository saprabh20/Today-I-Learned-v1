import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://frdkqcyucnwhvlverxga.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyZGtxY3l1Y253aHZsdmVyeGdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDE3NjAwNDYsImV4cCI6MjAxNzMzNjA0Nn0.vpGrQgR5g201F3C9VvlP-8Bh5FTdENqQwakAg2QVGJU";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;