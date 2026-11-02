(() => {
    const form = document.getElementById('account-form');
    const emailInput = document.getElementById('account-email');
    const submitButton = document.getElementById('account-submit');
    const status = document.getElementById('account-status');
    const heading = document.getElementById('account-heading');
    const description = document.getElementById('account-description');
    const modeButtons = [...document.querySelectorAll('[data-mode]')];
    let mode = new URLSearchParams(window.location.search).get('mode') === 'signup' ? 'signup' : 'signin';

    const setStatus = (message, isError = false) => {
        status.textContent = message;
        status.classList.toggle('error', isError);
    };

    const setMode = (nextMode) => {
        mode = nextMode;
        const signingUp = mode === 'signup';
        heading.textContent = signingUp ? 'Open your restaurant.' : 'Welcome back.';
        description.textContent = signingUp
            ? 'Create an account to keep your progress with you.'
            : 'Sign in to sync your restaurant across devices.';
        submitButton.textContent = signingUp ? 'Create account with email' : 'Send sign-in link';
        modeButtons.forEach((button) => {
            const selected = button.dataset.mode === mode;
            button.classList.toggle('active', selected);
            button.setAttribute('aria-selected', String(selected));
        });
        setStatus('');
    };

    modeButtons.forEach((button) => button.addEventListener('click', () => setMode(button.dataset.mode)));
    setMode(mode);

    const config = window.RAMEN_SUPABASE_CONFIG;
    if (!window.supabase?.createClient || !config?.url || !config?.anonKey) {
        setStatus('Account service is not configured.', true);
        form.querySelectorAll('input, button').forEach((control) => { control.disabled = true; });
        return;
    }

    const supabaseClient = window.supabase.createClient(config.url, config.anonKey);
    const returnToGame = () => window.location.replace(new URL('index.html', window.location.href));
    supabaseClient.auth.onAuthStateChange((_event, session) => {
        if (session?.user) returnToGame();
    });
    supabaseClient.auth.getSession().then(({ data, error }) => {
        if (error) setStatus(error.message, true);
        else if (data.session?.user) returnToGame();
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        submitButton.disabled = true;
        setStatus(mode === 'signup' ? 'Creating your account…' : 'Sending your sign-in link…');
        try {
            const { error } = await supabaseClient.auth.signInWithOtp({
                email: emailInput.value.trim(),
                options: {
                    emailRedirectTo: new URL('index.html', window.location.href).href,
                    shouldCreateUser: mode === 'signup'
                }
            });
            if (error) throw error;
            setStatus('Check your email for a secure link to continue.');
        } catch (error) {
            console.error('Account sign-in failed:', error);
            setStatus(error.message || 'Could not send the email link. Please try again.', true);
        } finally {
            submitButton.disabled = false;
        }
    });
})();