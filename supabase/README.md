# Supabase Edge Function

The backend lives in:

    src/app/supabase/functions/make-server-d36f8f91/

That directory name is also the deployed function name, which is why the
frontend calls `https://<project>.supabase.co/functions/v1/make-server-d36f8f91/...`
(see `src/app/utils/api.ts`).

Deploy from `src/app/`:

    supabase functions deploy make-server-d36f8f91

## Why this file exists

There used to be three copies of this backend — `supabase/functions/server/`,
`src/app/supabase/functions/server/`, and `src/app/imports/server.ts`. Only the
path above was ever deployed; the other two had drifted months out of date and
were missing fixes, including rate limiting. They were git-tracked and one sat
in the conventional Supabase CLI location, so they read as the source of truth
while changes made to them silently never reached production. They have been
removed. Keep it to one copy.
