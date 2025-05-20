import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://synkugwstrlwtcxckylk.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5bmt1Z3dzdHJsd3RjeGNreWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MjIxNzQsImV4cCI6MjA2MzI5ODE3NH0.wRoBAjiiagSUJBFRzXvSdejUHwMRgTChrSyMV_Toq_o";

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
