Its a Ramen Tycoon!!!


https://im2skibidi4u.github.io/Ramen-Tycoon/ 

## Cloud accounts and saves

Game progress is saved to Supabase under the signed-in account. Existing browser saves are imported only when that account has no cloud save yet; after a successful cloud save, the old active local save is removed. Playing while signed out does not persist new progress, so create an account or sign in before playing.

The public Supabase URL and publishable key are configured in `supabase-config.js`. A publishable key is intended for browser use; access to saves is restricted by row-level security. Never put a `service_role` key in this app.

In the Supabase SQL Editor, run this once to create the save table and per-user policies:

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

In Supabase Authentication URL settings, set the site URL to `https://im2skibidi4u.github.io/Ramen-Tycoon/` and add `https://im2skibidi4u.github.io/Ramen-Tycoon/index.html` to allowed redirect URLs. Authentication happens on `account.html` using email links.

After deploying, create an account, play until the status says `Progress synced to your account`, and sign in with the same email on another device. The account page and cloud database require an internet connection.

Clerk accounts and saves are not automatically transferred to Supabase. Existing progress attached to a Clerk account must be recovered/exported separately before relying on the new account. No cloud save system can guarantee writes during network failures or a closed browser, so wait for the synced status before leaving the game.
