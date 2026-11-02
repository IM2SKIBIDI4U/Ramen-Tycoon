(() => {
    const widget = document.getElementById('clerk-account-widget');
    const status = document.getElementById('account-status');
    if (!widget) return;

    const showError = (error) => {
        console.error('Clerk account page failed:', error);
        if (status) status.textContent = error?.message || 'Sign-in is unavailable. Try again later.';
    };

    if (!window.Clerk || !window.__internal_ClerkUICtor) {
        showError(new Error('Clerk could not load. Check the connection and try again.'));
        return;
    }

    const clerk = window.Clerk;
    clerk.load({ ui: { ClerkUI: window.__internal_ClerkUICtor } })
        .then(() => {
            if (clerk.user) {
                window.location.replace(new URL('index.html', window.location.href));
                return;
            }
            if (status) status.remove();
            const mode = new URLSearchParams(window.location.search).get('mode');
            const options = {
                routing: 'hash',
                signInUrl: 'account.html',
                signUpUrl: 'account.html?mode=signup',
                afterSignInUrl: 'index.html',
                afterSignUpUrl: 'index.html'
            };
            if (mode === 'signup') clerk.mountSignUp(widget, options);
            else clerk.mountSignIn(widget, options);
        })
        .catch(showError);
})();