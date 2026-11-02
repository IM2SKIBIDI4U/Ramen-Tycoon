Its a Ramen Tycoon!!!


https://im2skibidi4u.github.io/Ramen-Tycoon/ 

## Cloud accounts and saves

The game uses Supabase email sign-in and stores each cloud save in a Postgres row owned by that signed-in user. Local browser saves remain enabled as a fallback. Cloud saves are not available until Supabase is configured.

1. Create a Supabase project.
2. In the Supabase SQL Editor, run:

```sql
create table if not exists public.game_saves (
	user_id uuid primary key references auth.users (id) on delete cascade,
	save jsonb not null,
	updated_at timestamptz not null default now()
);

alter table public.game_saves enable row level security;
grant select, insert, update on public.game_saves to authenticated;

drop policy if exists "Users read own game save" on public.game_saves;
create policy "Users read own game save" on public.game_saves
	for select to authenticated
	using ((select auth.uid()) = user_id);

drop policy if exists "Users insert own game save" on public.game_saves;
create policy "Users insert own game save" on public.game_saves
	for insert to authenticated
	with check ((select auth.uid()) = user_id);

drop policy if exists "Users update own game save" on public.game_saves;
create policy "Users update own game save" on public.game_saves
	for update to authenticated
	using ((select auth.uid()) = user_id)
	with check ((select auth.uid()) = user_id);
```

3. Copy the project URL and the public anon/publishable key from the Supabase project API settings into `supabase-config.js`. Never put a `service_role` key in this browser app.
4. In Supabase Authentication URL settings, set the site URL to `https://im2skibidi4u.github.io/Ramen-Tycoon/` and allow that URL as a redirect.
5. Deploy the site, then test signing in with an email link and confirm the status says `Progress synced to your account`. Sign in with the same email on another device and confirm it says `Progress loaded from your account`.

Clerk accounts and saves are not automatically transferred to Supabase. Existing progress attached to a Clerk account must be recovered/exported separately before relying on the new account. No cloud save system can guarantee writes during network failures or a closed browser, so wait for the synced status before leaving the game.
