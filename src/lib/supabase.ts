import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://exzzsmztucthacabmyte.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4enpzbXp0dWN0aGFjYWJteXRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2ODU4OTcsImV4cCI6MjA5NjI2MTg5N30.AYgzwZvNGbnCs6RVBbbm8Oxbtx1wHnrSk21BTQ2EFyU'
);
