window.RAMEN_FIREBASE_CONFIG = {
    apiKey: 'YOUR_FIREBASE_API_KEY',
    authDomain: 'YOUR_FIREBASE_PROJECT_ID.firebaseapp.com',
    projectId: 'YOUR_FIREBASE_PROJECT_ID',
    appId: 'YOUR_FIREBASE_APP_ID'
};

const config = window.RAMEN_FIREBASE_CONFIG;
const configured = Object.values(config).every((value) => value && !value.startsWith('YOUR_'));

if (!window.firebase || !configured) {
    window.RAMEN_FIREBASE_ERROR = configured
        ? 'Firebase SDK could not load.'
        : 'Add your Firebase web app settings to firebase-config.js.';
} else {
    if (!firebase.apps.length) firebase.initializeApp(config);
    const db = firebase.firestore();
    db.settings({ ignoreUndefinedProperties: true });
    window.RAMEN_FIREBASE = {
        auth: firebase.auth(),
        db,
        serverTimestamp: () => firebase.firestore.FieldValue.serverTimestamp()
    };
}