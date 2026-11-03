Its a Ramen Tycoon!!!


https://im2skibidi4u.github.io/Ramen-Tycoon/ 

## Accounts and game saves

Sign in or create an account on `account.html` using Clerk. The game continues to save progress locally in `RamenUltimateData`, and when signed in it also links that save to the Clerk account. Signing in on another device downloads the account's latest save into that device's local storage. While signed out, progress remains local until you sign in again.

If both the current device and account have saves, the newer save timestamp wins. When the account has no save yet, signing in uploads the current device's save. Local progress is still saved if account sync fails, and the game displays a sync error rather than discarding it. Clerk account metadata has a size limit, so cloud sync may fail if the save exceeds the available metadata budget; the browser-local save remains available.

This app currently uses a Clerk development instance. If account creation or email verification fails for a school address, check the Clerk Dashboard's development email settings and allowed sign-up restrictions. A development instance may use test email delivery; use a production Clerk instance with a configured email provider for reliable sign-in.
