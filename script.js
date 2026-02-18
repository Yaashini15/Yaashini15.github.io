const API = "http://localhost:5000/tasks";

let lastDeletedTask = null;
let undoTimer = null;

async function addTask() {
  const title = document.getElementById("taskInput").value;
  const deadline = document.getElementById("deadline").value;
  const priority = document.getElementById("priority").value;

  if (!title || !deadline) {
    alert("Please fill all fields");
    return;
  }

  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, deadline, priority })
  });

  document.getElementById("taskInput").value = "";
  loadTasks();
}

async function loadTasks() {
  const res = await fetch(API);
  const tasks = await res.json();

  const tbody = document.getElementById("taskBody");
  tbody.innerHTML = "";

  const today = new Date().toDateString();
  let completed = 0, pending = 0, overdue = 0;

  tasks.forEach(task => {
    if (task.status === "Completed") completed++;
    else if (task.status === "Overdue") overdue++;
    else pending++;

    const reminder =
      new Date(task.deadline).toDateString() === today &&
      task.status === "Pending"
        ? "<br><small style='color:#b94a48'> Finish today</small>"
        : "";

    const tr = document.createElement("tr");
    tr.className = task.status.toLowerCase();

    tr.innerHTML = `
      <td>${task.title}</td>
      <td>${task.deadline}</td>
      <td>${task.priority}</td>
      <td>${task.status}${reminder}</td>
      <td>
        <button onclick="completeTask('${task.id}')">Done</button>
        <button onclick="deleteTask('${task.id}')">Delete</button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  document.getElementById("summary").innerHTML =
    `Completed: ${completed} |  Pending: ${pending} |  Overdue: ${overdue}`;
}

async function completeTask(id) {
  await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "Completed" })
  });
  loadTasks();
}

let pendingDelete = null;
let deleteTimer = null;

function deleteTask(id) {
  pendingDelete = id;

  const undoBox = document.getElementById("undoBox");
  undoBox.style.display = "block";

  // Delay backend delete
  deleteTimer = setTimeout(async () => {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    pendingDelete = null;
    undoBox.style.display = "none";
    loadTasks();
  }, 5000);
}

function undoDelete() {
  if (!pendingDelete) return;

  clearTimeout(deleteTimer);
  pendingDelete = null;

  document.getElementById("undoBox").style.display = "none";
  loadTasks();
}


loadTasks();
