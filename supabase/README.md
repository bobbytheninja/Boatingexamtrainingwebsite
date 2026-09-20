# Supabase Edge Function

The backend lives here:

    supabase/functions/make-server-d36f8f91/

Deploy from the repository root:

    npx supabase functions deploy make-server-d36f8f91

The folder name is also the deployed function name, which is why the frontend
calls `https://<project>.supabase.co/functions/v1/make-server-d36f8f91/...`
(see `src/app/utils/api.ts`). Renaming the folder renames the endpoint, so it
has to change in both places at once.

## Layout

This is the conventional location: the Supabase CLI looks for
`supabase/functions/<name>/` relative to wherever you run it, so running it
from the repository root — where you would naturally be — now just works.

It used to live at `src/app/supabase/`, which meant the CLI found an empty
`supabase/` folder at the root and failed with "Entrypoint path does not
exist". There were also three copies of the backend at one point
(`supabase/functions/server/`, `src/app/supabase/functions/server/` and
`src/app/imports/server.ts`); only one was ever deployed, while the others sat
months out of date and missing fixes. Keep it to one copy, in one place.

## Environment

Set in the Supabase dashboard under Edge Functions → Secrets, not in this repo:

| Variable | Used for |
| --- | --- |
| `RESEND_API_KEY` | Welcome, password-reset and payment emails |
| `STRIPE_SECRET_KEY` | Creating checkout sessions |
| `STRIPE_WEBHOOK_SECRET` | Verifying webhook signatures |
| `ADMIN_IMPORT_KEY` | Question import and granting admin access |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are also read, but the platform
injects those automatically — they do not need setting by hand.
