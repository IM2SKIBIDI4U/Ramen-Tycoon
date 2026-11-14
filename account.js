(() => {
    const widget = document.getElementById('clerk-account-widget');
    const status = document.getElementById('account-status');
    if (!widget) return;

    const showError = (error) => {
        console.error('Clerk account page failed:', error);
        if (status) status.textContent = error?.message || 'Sign-in is unavailable. Try again later.';
    };

    if (!window.Clerk || !window.__internal_ClerkUICtor) {
        showError(new Error('Clerk or its UI components could not load. Check the connection and try again.'));
        return;
    }

    const clerk = window.Clerk;
    const fallbackReturnTo = new URL('index.html', window.location.href);
    const requestedReturnTo = new URLSearchParams(window.location.search).get('returnTo');
    let returnToGame = fallbackReturnTo.toString();
    if (requestedReturnTo) {
        try {
            const requested = new URL(requestedReturnTo, window.location.href);
            if (requested.origin === window.location.origin && requested.pathname === fallbackReturnTo.pathname) {
                returnToGame = requested.toString();
            }
        } catch {
            // Ignore invalid return URLs and use the same-origin game page.
        }
    }
    clerk.load({ ui: { ClerkUI: window.__internal_ClerkUICtor } })
        .then(() => {
            if (clerk.user) {
                window.location.replace(returnToGame);
                return;
            }
            if (status) status.remove();
            const mode = new URLSearchParams(window.location.search).get('mode');
            const commonOptions = {
                routing: 'hash',
                forceRedirectUrl: returnToGame,
                fallbackRedirectUrl: returnToGame
            };
            if (mode === 'signup') {
                clerk.mountSignUp(widget, {
                    ...commonOptions,
                    signInUrl: new URL('account.html', window.location.href).toString()
                });
            } else {
                clerk.mountSignIn(widget, {
                    ...commonOptions,
                    signUpUrl: new URL('account.html?mode=signup', window.location.href).toString()
                });
            }
        })
        .catch(showError);
})();