Its a Ramen Tycoon!!!


https://im2skibidi4u.github.io/Ramen-Tycoon/ 

## Cloud accounts and saves

Sign in or create an account on `account.html` using the Clerk-hosted account forms. Game saves are stored automatically in the signed-in Clerk account metadata as you play. Existing browser saves are imported if the account has no saved game yet. Sign in before playing to sync progress across devices, and wait for `Progress synced to your account` before leaving.

This app currently uses a Clerk development instance. If account creation or email verification fails for a school address, check the Clerk Dashboard's development email settings and allowed sign-up restrictions. A development instance may use test email delivery; use a production Clerk instance with a configured email provider for reliable delivery to arbitrary addresses.

Clerk user metadata has a size limit, and the game rejects saves that exceed its 7.5 KB metadata budget. Cloud saves need an internet connection. If sync reports an error, progress changes made in that session are not saved to the account.
