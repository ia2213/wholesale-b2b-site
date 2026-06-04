const SUPABASE_URL = 'https://xwtqgnjqgzleexwyslcr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3dHFnbmpxZ3psZWV4d3lzbGNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NjMzMTcsImV4cCI6MjA5NjEzOTMxN30.C5o0FAmyE7esHGkfG84lxAE-uE6c0kXjPsAHH2yBBQE';

let _supabaseReady = false;
let _supabaseCallbacks = [];

function onSupabaseReady(cb) {
  if (_supabaseReady) { cb(); return; }
  _supabaseCallbacks.push(cb);
}

const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
script.onload = () => {
  window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  _supabaseReady = true;
  _supabaseCallbacks.forEach(cb => cb());
};
document.head.appendChild(script);
