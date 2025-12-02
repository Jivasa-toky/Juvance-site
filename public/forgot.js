    import { sendPasswordResetEmail} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js"; 
import { auth} from './login.js';


 // If imported and available 
const form = document.getElementById('forgotPasswordForm');
 const emailInput = document.getElementById('resetEmail'); const messageElement = document.getElementById('message');

form.addEventListener('submit', (e) => { 

e.preventDefault();
 // Stop the form from submitting normally 
const email = emailInput.value; 
 messageElement.textContent = "Sending email..."; 
messageElement.style.color = "blue"; 

 sendPasswordResetEmail(auth, email) .then(() => { 
 messageElement.textContent = "Success! Check your email for a password reset link."; 
messageElement.style.color = "green"; emailInput.value = ''; 
// Clear the input 
}) 
.catch((error) => { 
const errorCode = error.code; 
const errorMessage = error.message; console.error("Password Reset Error:", errorCode, errorMessage); 
// Provide user-friendly feedback based on error code 
if (errorCode === 'auth/user-not-found') { 
messageElement.textContent = "If this email is registered, a password reset link has been sent."; 
// NOTE: Firebase intentionally gives a vague message for security, 
// to prevent attackers from discovering which emails are registered. 
} else if (errorCode === 'auth/invalid-email') { 
messageElement.textContent = "Please enter a valid email address."; 
} else { 
messageElement.textContent = "An error occurred. Please try again later."; 
}
 messageElement.style.color = "red"; 
}); 
});