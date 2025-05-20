import { createClient } from "@supabase/supabase-js";

// Database connection details
const supabaseUrl = "https://synkugwstrlwtcxckylk.supabase.co";
const supabaseKey = "tvc5qpguyh5fum7ATB";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: "public",
  },
  auth: {
    persistSession: true,
  },
  global: {
    headers: {
      "x-application-name": "builder-video-admin",
    },
  },
});

// PostgreSQL direct connection config (when needed)
export const pgConfig = {
  host: "aws-0-us-west-1.pooler.supabase.com",
  port: 5432,
  database: "postgres",
  user: "postgres.synkugwstrlwtcxckylk",
  password: "tvc5qpguyh5fum7ATB",
};
