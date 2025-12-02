// Updated gallery.js — saves uploaded images (compressed) to Firestore and supports deletion.
// IMPORTANT: Replace firebaseConfig below with your project's config object.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: 'AIzaSyDsdKAFvg1aJUYXvUgzOnzVVn2meWD4Rcc',
  authDomain: 'juvance-cave.firebaseapp.com',
  projectId: 'juvance-cave',
  storageBucket: 'juvance-cave.appspot.com',
  messagingSenderId: '873435382584',
  appId: '1:873435382584:web:b52be0521a7b07d4ddf7cd',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const input = document.getElementById("photo");
const upload = document.getElementById("upload-btn");
const preview = document.getElementById('preview');
const category = document.getElementById("category");
const travelBtn = document.getElementById("travel-btn");
const natureBtn = document.getElementById('nature-btn');
const eventBtn = document.getElementById("event-btn");
const travel = document.getElementById("travel");
const nature = document.getElementById('nature');
const event = document.getElementById("event");
const close = document.getElementById("close-modal");
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modal-img");
const allBtn = document.getElementById("all");

onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("You must be signed in to access this page.");
    window.location.href = "/login.html";
  } else {
    console.log("Signed in as:", user.uid);
  }
});

function compressImageFile(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      return reject(new Error("File is not an image"));
    }

    const img = new Image();
    img.onerror = (err) => reject(err);
    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      const mime = "image/jpeg";
      const dataUrl = canvas.toDataURL(mime, quality);
      const base64String = dataUrl.split(",")[1] || "";
      const sizeInBytes = Math.round((base64String.length * 3) / 4);

      resolve({
        dataUrl,
        width,
        height,
        size: sizeInBytes,
        contentType: mime
      });
    };

    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
    img.onloadend = () => {
      URL.revokeObjectURL(objectUrl);
    };
  });
}

upload.addEventListener('click', async (e) => {
  e.preventDefault();

  if (category.value === "" || !input.files || input.files.length === 0) {
    alert("Please fill the category and select at least one image.");
    return;
  }

  const files = Array.from(input.files);
  for (const file of files) {
    try {
      console.log('Preparing file:', file.name, file.size, file.type);

      const compressed = await compressImageFile(file, 1200, 0.8);

      if (compressed.size > 900000) {
        const cont = confirm(
          `The compressed image "${file.name}" is still large (${Math.round(compressed.size/1024)} KB). ` +
          "Saving it to Firestore might fail due to document size limits. Continue anyway?"
        );
        if (!cont) {
          console.log("User skipped upload for", file.name);
          continue;
        }
      }

      const docData = {
        filename: file.name,
        category: category.value,
        contentType: compressed.contentType,
        data: compressed.dataUrl,
        width: compressed.width,
        height: compressed.height,
        size: compressed.size,
        createdAt: serverTimestamp()
      };

      const galleryCollection = collection(db, "gallery");
      const docRef = await addDoc(galleryCollection, docData);
      console.log("Saved image to Firestore with id:", docRef.id);

      const divEl = document.getElementById(category.value) || preview;
      const div = document.createElement('div');
      div.classList.add("photo");
      div.setAttribute("data-id", docRef.id);

      const img = document.createElement('img');
      img.src = compressed.dataUrl;

      const i = document.createElement('i');
      i.classList.add("fa-solid", "fa-trash");

      div.appendChild(img);
      div.appendChild(i);
      divEl.appendChild(div);
    } catch (err) {
      console.error("Error processing file", file.name, err);
      alert(`Failed to upload ${file.name}: ${err.message}`);
    }
  }

  input.value = "";
});

travelBtn.addEventListener('click', () => {
  nature.classList.add("hide");
  event.classList.add("hide");
  allBtn.classList.remove("active");
  natureBtn.classList.remove("active");
  eventBtn.classList.remove("active");
  travel.classList.remove("hide");
  travelBtn.classList.add("active")
});

natureBtn.addEventListener('click', () => {
  travel.classList.add("hide");
  event.classList.add("hide");
  allBtn.classList.remove("active");
  travelBtn.classList.remove("active");
  eventBtn.classList.remove("active");
  nature.classList.remove("hide");
  natureBtn.classList.add("active");
});

eventBtn.addEventListener('click', () => {
  nature.classList.add("hide");
  travel.classList.add("hide");
  allBtn.classList.remove("active");
  natureBtn.classList.remove("active");
  travelBtn.classList.remove("active");
  event.classList.remove("hide");
  eventBtn.classList.add("active")
});

if (allBtn) {
  allBtn.addEventListener('click', () => {
    nature.classList.remove("hide");
    travel.classList.remove("hide");
    event.classList.remove("hide");
    natureBtn.classList.remove("active");
    travelBtn.classList.remove("active");
    eventBtn.classList.remove("active");
    allBtn.classList.add("active")
  });
}

close.addEventListener('click', () => {
  modal.style.display = "none";
});

document.addEventListener('click', async (e) => {
  if (e.target.tagName === "IMG") {
    const imgSrc = e.target.src;
    modal.style.display = "flex";
    modalImg.src = imgSrc;
    return;
  }

  if (e.target.className && e.target.className.includes("fa-trash")) {
    const conf = confirm("Do you want to delete this photo? This will remove it from Firestore.");
    if (conf) {
      const photoDiv = e.target.parentElement;
      const docId = photoDiv.getAttribute("data-id");

      try {
        await deleteDoc(doc(db, "gallery", docId));
        photoDiv.remove();
        console.log("Deleted photo with ID:", docId);
      } catch (err) {
        console.error("Failed to delete photo:", err);
        alert("Error deleting photo.");
      }
    }
  }
});

async function loadGalleryImages() {
  try {
    const galleryCollection = collection(db, "gallery");
    const snapshot = await getDocs(galleryCollection);

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const divEl = document.getElementById(data.category) || preview;
      const div = document.createElement('div');
      div.classList.add("photo");
      div.setAttribute("data-id", docSnap.id);

      const img = document.createElement('img');
      img.src = data.data;

      const i = document.createElement('i');
      i.classList.add("fa-solid", "fa-trash");

      div.appendChild(img);
      div.appendChild(i);
      divEl.appendChild(div);
    });
  } catch (error) {
    console.error("Failed to load gallery images:", error);
  }
}

window.addEventListener("DOMContentLoaded", loadGalleryImages);
