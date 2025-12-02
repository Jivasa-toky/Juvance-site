import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
    import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, onAuthStateChanged ,signOut} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
    import {getFirestore, doc, setDoc ,getDoc} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js"; 
/*import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";*/

// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDsdKAFvg1aJUYXvUgzOnzVVn2meWD4Rcc',
  authDomain: 'juvance-cave.firebaseapp.com',
  projectId: 'juvance-cave',
  storageBucket: 'juvance-cave.appspot.com',
  messagingSenderId: '873435382584',
  appId: '1:873435382584:web:b52be0521a7b07d4ddf7cd',
};

// Initialize Firebases
    
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    
/*const ai = getAI(app, { backend: new GoogleAIBackend() });

// Create a `GenerativeModel` instance with a model that supports your use case

const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });

// Wrap in an async function so you can use await

async function run() {  
// Provide a prompt that contains text  

const prompt = "Write a story about a magic backpack."  

// To generate text output, call generateContent with the text input  

const result = await model.generateContent(prompt);  

const response = result.response;  

const text = response.text();  

console.log(text);

}

run();*/
 const provider = new GoogleAuthProvider();
const db = getFirestore(app);
    

//console.log("login.js script loaded");
document.addEventListener("DOMContentLoaded", () => {
    //console.log("DOMContentLoaded fired");
    const validateBtn = document.getElementById("validate-user");
   // console.log("validateBtn:", validateBtn);
   // console.log("validateBtn found?", !!validateBtn);
    if (!validateBtn) throw new Error("validate-user button not found!");
    validateBtn.addEventListener("click", () => {
    
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    const user = userCredential.user;
    console.log(`${email} signed in:`, user);

    // Redirect to Firebase Hosting website
    window.location.href="dashboard.html";
  })
  .catch((error) => {
    console.error("Error:", error.message);
      console.log(error.message)
    alert("Invalid username or password.");
      window.location.href= "login.html";
  });
});
}); 
export { auth , db , app};

export async function setBackgroundImage(city) {
 
  // This will just set a background image based on condition
  try {
    const response = await fetch(`/api/unsplash?city=${encodeURIComponent(city)}`);

        if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
        }

          const data = await response.json();
  console.log(data.user.links);
 //   const res = await fetch(`https://source.unsplash.com/1600x900/?${keyword}`);
    if (data.urls.full) {
      document.getElementById("hero").style.backgroundImage = `url(${data.urls.full})`;
      document.getElementById("photographerName").textContent = `${data.user.username}`;
      document.getElementById("photographerName").href=`${data.user.links.html}?utm_source=juvance-cave&utm_medium="referral"`;
    }
  } catch (error) {
    console.error("Failed to fetch background image:", error.message || error);
  }
};

document.addEventListener("DOMContentLoaded", () => {
   setBackgroundImage() 
})


