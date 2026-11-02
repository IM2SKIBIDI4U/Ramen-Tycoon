(() => {
    const widget = document.getElementById('clerk-account-widget');
    const status = document.getElementById('account-status');
    if (!widget) return;

    const showError = (error) => {
        console.error('Clerk account page failed:', error);
        if (status) status.textContent = error?.message || 'Sign-in is unavailable. Try again later.';
    };

    if (!window.Clerk) {
        showError(new Error('Clerk could not load. Check the connection and try again.'));
        return;
    }

    const clerk = window.Clerk;
    clerk.load()
        .then(() => {
            if (clerk.user) {
                window.location.replace(new URL('index.html', window.location.href));
                return;
            }
            if (status) status.remove();
            const mode = new URLSearchParams(window.location.search).get('mode');
            const returnToGame = new URL('index.html', window.location.href).toString();
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