import { auth } from './login.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
 
export function protectPage() {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "index.html"; // Redirect to login page
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
    protectPage();
});


// Safe sign-out handler
async function handleSignOut() {
  try {
    await signOut(auth);
     window.location.href = "login.html";
     alert(`${user} signed out successfully.`);
  } catch (error) {
    console.error("Sign-out error:", error);
  }
}

const signOutBtn = document.getElementById("signOutUser");
if (signOutBtn) {
  signOutBtn.addEventListener("click", handleSignOut);
}
