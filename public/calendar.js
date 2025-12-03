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

          dots += `<span id="dot-${dateStr}-${category}" class="dot ${category}" draggable="true" data-category="${category}" data-date="${dateStr}"></span>`;

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

      console.log(toDoListObj[e.target.dataset.date][e.target.dataset.category][0].listObj)

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



  displayCalendar();

});


