// public/signup.js
// HTTP-function approach: POSTs JSON to your deployed Cloud Function URL.
// Ensure login.js exports `app` as a named export: `export { auth, db, app };`

import { app } from './login.js';

if (!app) {
  console.error('Firebase app not found. Ensure login.js exports a named `app`.');
  throw new Error('Firebase app not found.');
}

// TODO: replace this with your function's actual HTTPS trigger URL.
// Example: 'https://us-central1-juvance-cave.cloudfunctions.net/helloJuvanceCave'
const FUNCTION_URL = 'https://us-central1-juvance-cave.cloudfunctions.net/helloJuvanceCave';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('inviteSignupForm');
  const messageArea = document.getElementById('messageArea');

  if (!form) {
    console.error('inviteSignupForm element not found. Make sure the form has id="inviteSignupForm".');
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('signupEmail')?.value.trim() || '';
    const password = document.getElementById('signupPassword')?.value || '';

    if (messageArea) {
      messageArea.textContent = '';
    }

    if (!email || !password) {
      if (messageArea) {
        messageArea.textContent = 'Please provide both email and password.';
        messageArea.style.color = 'red';
      }
      return;
    }

    try {
      if (messageArea) {
        messageArea.textContent = 'Processing...';
        messageArea.style.color = 'blue';
      }

      const resp = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        // If your function sets/reads cookies, add credentials: 'include'
      });

      // Try parse JSON; fallback to text
      let body;
      const text = await resp.text().catch(() => '');
      try {
        body = text ? JSON.parse(text) : null;
      } catch {
        body = text;
      }

      if (!resp.ok) {
        const msg = (body && body.error) ? body.error : (typeof body === 'string' && body) || `HTTP ${resp.status}`;
        if (messageArea) {
          messageArea.textContent = `Signup Failed: ${msg}`;
          messageArea.style.color = 'red';
        }
        console.error('Function HTTP error', resp.status, body);
        return;
      }

      // Success
      if (messageArea) {
        messageArea.textContent = `Success! Account created for ${email}.`;
        messageArea.style.color = 'green';
      }
      console.log('Function result:', body);

      // Optionally redirect to login
      // window.location.href = '/login.html';
    } catch (err) {
      console.error('Network error calling function:', err);
      if (messageArea) {
        messageArea.textContent = `Signup Failed: ${err.message || err}`;
        messageArea.style.color = 'red';
      }
    }
  });
});