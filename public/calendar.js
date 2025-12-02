import { protectPage } from './dashboard.js';

import { auth, db } from './login.js';

import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js';
import {
  collection,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// === GOOGLE CALENDAR SYNC CONFIG: Set your OAuth2 Client ID below ============
// 1. Go to https://console.cloud.google.com/ -> APIs & Services -> Credentials
// 2. Replace the string below with your actual Client ID
const GAPI_CLIENT_ID = "873435382584-vnmu67kilupulj50lrhlhmdog2e9gg47.apps.googleusercontent.com";

// ==============================================================================

const GAPI_DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"
];
const GAPI_SCOPES = "https://www.googleapis.com/auth/calendar.events";

function initializeGAPI() {
  // This function will be called after the gapi script loads (see HTML)
  if (!window.gapi) {
    console.error("Google API not loaded on page.");
    return;
  }
  window.gapi.load('client:auth2', () => {
    window.gapi.client
      .init({
        clientId: GAPI_CLIENT_ID,
        discoveryDocs: GAPI_DISCOVERY_DOCS,
        scope: GAPI_SCOPES,
      })
      .then(() => {
        // Now gapi is initialized and ready to use
        console.log("Google API client initialized.");
      })
      .catch((e) => {
        console.error("Failed to initialize Google API:", e);
      });
  });
}

window.addEventListener('load', initializeGAPI);

document.addEventListener("DOMContentLoaded", () => {
  protectPage();
});

// Firebase Authentication and Firestore Integration

let currentUserId = null;

onAuthStateChanged(auth, user => {
  if (user) {
    currentUserId = user.uid;
    loadTasksFromFirestore();
  } else {
    currentUserId = null;
    // Optionally redirect to login page or show login form
  }
});

const date = new Date();
let currentTaskFilter = "all";
let currentTaskSearch = "";
let year = date.getFullYear();
let month = date.getMonth();
const monthsName = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const prev = document.getElementById("prev");
const next = document.getElementById("next");
const monthUl = document.getElementById("month");
const tabs = document.querySelectorAll(".month-tab");
const days = document.getElementById("days");
const dayEvent = document.getElementById("day-event");
const taskInput = document.getElementById("task-input");
const categorySelect = document.getElementById("category-select");
const submitBtn = document.getElementById("submit-btn");
const currentMonthEl = document.getElementById("current-month");
const dateInput = document.getElementById("start");
let selectedDate = "";
const toDoListObj = {};
dayEvent.textContent = `${date.getDate()} ${monthsName[month]} ${year}`;

// MODULAR FIRESTORE: Use setDoc/doc/collection

const saveToFirestore = async () => {
  if (!currentUserId) return;
  try {
    await setDoc(doc(collection(db, "users"), currentUserId), toDoListObj);
    alert("Your change is saved");
  } catch (error) {
    console.error("Error saving:", error);
    alert(error.message)
  }
};

// MODULAR FIRESTORE: Use getDoc/doc/collection
const loadTasksFromFirestore = async () => {
  if (!currentUserId) return;
  try {
    const docSnap = await getDoc(doc(collection(db, "users"), currentUserId));
    if (docSnap.exists()) {
      Object.assign(toDoListObj, docSnap.data());
      displayCalendar();
      renderTasks();
    }
  } catch (error) {
    console.error("Error loading:", error);
  }
};

const displayCalendar = () => {
  let daysEl = "";
  const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
  const lastDayOfLastMonth = new Date(year, month, 0).getDay();
  const yearEl = document.getElementById("year");

  for (let i = 0; i <= lastDayOfLastMonth; i++) {
    daysEl += `<div class="empty"></div>`;
  }

  for (let day = 1; day <= lastDateOfMonth; day++) {
    const isToday =
      year === new Date().getFullYear() &&
      month === new Date().getMonth() &&
      day === new Date().getDate();

    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    
    let dayClass = "day";
    if (isToday) dayClass += " active";

    let dots = "";
    if (toDoListObj[dateStr]) {
      ["work", "personal", "ministry"].forEach(category => {
        if (toDoListObj[dateStr][category].length > 0) {
          dots += `<span id="dot-${dateStr}-${category}" class="dot ${category}s" draggable="true" data-category="${category}" data-date="${dateStr}"></span>`;
        }
      });
    }
    
    daysEl += `<div class="${dayClass}">${day}${dots}</div>`;
  }
  days.innerHTML = daysEl;
  currentMonthEl.textContent = monthsName[month].toUpperCase();
  yearEl.textContent = year;

  tabs.forEach(tab => {
    tab.classList.remove("active");
    if (tab.textContent === monthsName[month]) {
      tab.classList.add("active");
    }
  });

  enableDragAndDrop();
};
const formatDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

dateInput.min = formatDate(new Date());

const enableDragAndDrop = () => {
  document.querySelectorAll(".dot").forEach(dot => {
    dot.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", JSON.stringify({
        id: e.target.id,
        category: e.target.dataset.category,
        fromDate: e.target.dataset.date
      }));
    });
    dot.addEventListener("mouseenter", (e) => {    
      function truncateText(text, maxLength) {
        return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
      }

      let taskTitle = toDoListObj[e.target.dataset.date][e.target.dataset.category][0].listObj;
      e.target.textContent = truncateText(taskTitle, 4);
      e.target.classList.add("task");
      e.target.classList.remove("dot");
    })    
    dot.addEventListener("mouseleave", (e) => {
      e.target.textContent = "";
      e.target.classList.add("dot");
    });

  });
  document.querySelectorAll(".day").forEach(dayEl => {
    dayEl.addEventListener("dragover", (e) => e.preventDefault());
    dayEl.addEventListener("dragenter", () => {
      dayEl.classList.add("highlight");
    });
    dayEl.addEventListener("dragleave", () => {
      dayEl.classList.remove("highlight");
    })
    dayEl.addEventListener("drop", (e) => {
      e.preventDefault();
      
      const dropDay = dayEl.textContent.trim();
      const dropDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dropDay).padStart(2, '0')}`;

      const { id, category, fromDate } = JSON.parse(e.dataTransfer.getData("text/plain"));

      const taskList = toDoListObj[fromDate]?.[category];
      if (!taskList) return;
      const taskIndex = taskList.findIndex(task => id.includes(task.dateObj));
      
      if (taskIndex !== -1) {
        const [movedTask] = taskList.splice(taskIndex, 1);
        if (!toDoListObj[dropDate]) {
          toDoListObj[dropDate] = { work: [], personal: [], ministry: [] };
        }
        toDoListObj[dropDate][category].push(movedTask);
        saveToFirestore();
        renderTasks();
        displayCalendar();
      }
    });
  });
};

const findDay = (e) => {
  if (e.target.classList?.contains("day")) {
    document.querySelectorAll(".day").forEach(d => d.classList.remove("active"));
    e.target.classList.add("active");

    const date = e.target.childNodes[0].nodeValue.trim();
    selectedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`;
    dayEvent.textContent = `${date} ${monthsName[month]} ${year}`;

    if (!toDoListObj[selectedDate]) {
      toDoListObj[selectedDate] = { work: [], personal: [], ministry: [] };
    }

    const today = new Date(year, month, date);
    dateInput.value = formatDate(today);

    renderTasks();
  }
};

function getTasksForDate(selectedDate, category) {
  let tasks = [];

  // Original tasks for the selected date
  if (toDoListObj[selectedDate] && toDoListObj[selectedDate][category]) {
    tasks = tasks.concat(toDoListObj[selectedDate][category]);
  }

  // Check all dates for recurring tasks (avoid duplicates)
  Object.keys(toDoListObj).forEach(dateStr => {
    toDoListObj[dateStr][category].forEach(task => {
      if (task.recurrence && task.recurrence !== "none") {
        const taskDate = new Date(task.dateObj);
        const selDate = new Date(selectedDate);

        // Daily recurrence
        if (task.recurrence === "daily" && selDate >= taskDate) {
          if (dateStr !== selectedDate) {
            tasks.push({ ...task, isRecurring: true });
          }
        }
        // Weekly recurrence
        if (task.recurrence === "weekly" && selDate >= taskDate && selDate.getDay() === taskDate.getDay()) {
          if (dateStr !== selectedDate) {
            tasks.push({ ...task, isRecurring: true });
          }
        }
        // Monthly recurrence
        if (task.recurrence === "monthly" && selDate >= taskDate && selDate.getDate() === taskDate.getDate()) {
          if (dateStr !== selectedDate) {
            tasks.push({ ...task, isRecurring: true });
          }
        }
      }
    });
  });

  return tasks;
}

// Patch listResult to save recurrence
const listResult = (e) => {
  e.preventDefault();

  const prioritySelect = document.getElementById("priority-select");
  const recurrenceSelect = document.getElementById("recurrence-select");
  const priority = prioritySelect.value;
  const recurrence = recurrenceSelect.value || "none";

  if (!taskInput.value || !categorySelect.value || !prioritySelect.value) {
    alert("Please fill all the fields");
    return;
  }
  
  const category = categorySelect.value;
  const task = taskInput.value;
  const taskDate = dateInput.value;

  if (!toDoListObj[selectedDate]) {
    toDoListObj[selectedDate] = { work: [], personal: [], ministry: [] };
  }
  
  toDoListObj[selectedDate][category].push({
    listObj: task,
    dateObj: taskDate,
    priority: priority,
    completed: false,
    recurrence: recurrence // <-- Save recurrence here
  });

  taskInput.value = "";
  dateInput.value = "";
  categorySelect.value = "";
  recurrenceSelect.value = "";

  saveToFirestore();
  renderTasks();
  displayCalendar();
};

// Use getTasksForDate in renderTasks
const renderTasks = () => {
  ["work", "personal", "ministry"].forEach(category => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const ul = document.getElementById(category);
    ul.innerHTML = "";

    // Use tasks for this date, including recurring
    const tasks = getTasksForDate(selectedDate, category)
      .slice()
      .sort((a, b) =>
        priorityOrder[(a.priority || "low")] - priorityOrder[(b.priority || "low")]
      );

    const filteredTasks = tasks.filter(task => {
      if (currentTaskFilter === "completed" && !task.completed) return false;
      if (currentTaskFilter === "incomplete" && task.completed) return false;
      if (currentTaskSearch && !task.listObj.toLowerCase().includes(currentTaskSearch)) return false;
      return true;
    });

    if (filteredTasks.length === 0) {
      const noListLi = document.createElement("li");
      noListLi.className = "no-list";
      noListLi.textContent = "📝 No to do list, add one";
      ul.appendChild(noListLi);
    } else {
      filteredTasks.forEach((task, index) => {
        function escapeHTML(str) {
          return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
        }
        let displayText = escapeHTML(task.listObj);
        if (currentTaskSearch && displayText.toLowerCase().includes(currentTaskSearch)) {
          const re = new RegExp(`(${currentTaskSearch})`, "ig");
          displayText = displayText.replace(re, '<mark>$1</mark>');
        }
        let priority = task.priority || "low";
        const li = document.createElement("li");
        li.innerHTML = `
          <div class="list${task.completed ? " completed" : ""}">
            <input type="checkbox" ${task.completed ? 'checked' : ''}> ${displayText}
            <span class="priority ${priority}">${priority.toUpperCase()}</span>
            ${task.recurrence && task.recurrence !== "none" ? '<span class="recurring-icon" title="Recurring Task">🔁</span>' : ''}
            <button class="delete-btn"><i class="fa-solid fa-trash-can"></i></button>
          </div>
        `;
        const checkbox = li.querySelector("input[type='checkbox']");
        checkbox.addEventListener("change", () => {
          task.completed = checkbox.checked;
          saveToFirestore();
          renderTasks();
          displayCalendar();
        });
        li.querySelector(".delete-btn").addEventListener("click", () => {
          if (confirm("Do you want to delete this task?")) {
            // Remove by index only if NOT recurring; recurring tasks removal needs more logic
            if (!task.isRecurring) {
              toDoListObj[selectedDate][category].splice(index, 1);
              saveToFirestore();
              renderTasks();
              displayCalendar();
            } else {
              alert("Recurring tasks must be deleted from their original date.");
            }
          }
        });
        ul.appendChild(li);
      });
    }

    if (tasks.length > 0) {
      const completedCount = tasks.filter(t => t.completed).length;
      const statsDiv = document.createElement("div");
      statsDiv.className = "task-stats";
      statsDiv.textContent = `Completed: ${completedCount} / ${tasks.length}`;
      ul.appendChild(statsDiv);
    }
  });
};

document.getElementById("task-filters").addEventListener("click", function(e) {
  if (e.target.tagName === "BUTTON") {
    currentTaskFilter = e.target.getAttribute("data-filter");
    renderTasks();
  }
});

document.getElementById("task-search").addEventListener("input", function(e) {
  currentTaskSearch = e.target.value.trim().toLowerCase();
  renderTasks();
});

// Google Calendar SYNC Button Handler
document.getElementById("google-sync-btn").addEventListener("click", async () => {
  if (!window.gapi || !window.gapi.auth2) {
    alert("Google API not loaded. Please refresh and try again.");
    return;
  }
  let GoogleAuth;
  try {
    GoogleAuth = window.gapi.auth2.getAuthInstance();
    if (!GoogleAuth) {
      await window.gapi.client.init({
        clientId: GAPI_CLIENT_ID,
        discoveryDocs: GAPI_DISCOVERY_DOCS,
        scope: GAPI_SCOPES,
      });
      GoogleAuth = window.gapi.auth2.getAuthInstance();
    }
    await GoogleAuth.signIn();
  } catch (e) {
    alert("Failed to authenticate with Google: " + (e.error || e.details || e.toString()));
    return;
  }
  let added = 0;
  for (const date in toDoListObj) {
    for (const category of ["work", "personal", "ministry"]) {
      if (!toDoListObj[date][category]) continue;
      for (const task of toDoListObj[date][category]) {
        try {
          await window.gapi.client.calendar.events.insert({
            calendarId: "primary",
            resource: {
              summary: task.listObj,
              description: `Priority: ${task.priority}\nCategory: ${category}`,
              start: { date: date },
              end: { date: date },
              // Recurrence feature (optional):
              // recurrence: task.recurrence && task.recurrence !== "none" ? [convertRecurrenceToRRule(task, date)] : undefined
            },
          });
          added++;
        } catch (error) {
          console.error(`Failed to sync task: ${task.listObj} on ${date}`, error);
        }
      }
    }
  }
  alert(added > 0 ? `Synced ${added} tasks to your Google Calendar!` : "No tasks to sync.");
});

// Navigation
prev.addEventListener("click", () => {
  year--;
  displayCalendar();
});
next.addEventListener("click", () => {
  year++;
  displayCalendar();
});
tabs.forEach(tab => {
  tab.addEventListener("click", function (e) {
    tabs.forEach(t => t.classList.remove("active"));
    this.classList.add("active");
    month = monthsName.indexOf(e.target.textContent);
    displayCalendar();
  });
});

// Event Listeners
days.addEventListener("click", findDay);
submitBtn.addEventListener("click", listResult);
window.addEventListener("load", () => {
  document.getElementById("spinner").style.display = "none";
  displayCalendar();
});

// If you later want to support recurrence, implement RFC 5545 RRULE here
// function convertRecurrenceToRRule(task, date) { ... }