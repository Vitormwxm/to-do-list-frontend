// --- ELEMENTOS DO DOM ---
const buttonAddTask = document.querySelector("#add_button");
const inputTask = document.querySelector("#add-task");
const listContainer = document.querySelector("#task_list");

// --- EVENTOS ---
window.onload = searchAllTasks;
buttonAddTask.addEventListener("click", addTask);

listContainer.addEventListener("click", function (event) {
    const target = event.target.closest(".square");
    if (target) {
        const listItem = target.parentElement;
        const taskId = listItem.getAttribute("data-task-id");
        deleteTask(listItem, taskId);
    }
});

// --- INTERFACE (UI) ---

function createTaskView(taskTitle, taskId) {
    const listItem = document.createElement("li");
    listItem.setAttribute("data-task-id", taskId);
    listItem.textContent = taskTitle;
    listItem.classList.add("task-animate"); // Aqui você pode trocar para animateIn se quiser

    const deleteButton = document.createElement("span");
    deleteButton.className = "square";
    deleteButton.innerHTML = '<img src="imgs/icons8-lixeira 1.svg" alt="lixeira" width="30px">';
    
    listItem.appendChild(deleteButton);
    return listItem; // Retorna o elemento pronto para ser usado
}

// --- SERVIÇOS (API) ---

async function searchAllTasks() {
    try {
        const response = await fetch("http://localhost:8080/todolist");
        if (response.ok) {
            const tasks = await response.json();
            const taksData = tasks.content;

            listContainer.innerHTML = "";
            taksData.forEach((task) => {
                const taskElement = createTaskView(task.title, task.id);
                listContainer.appendChild(taskElement);
            });
        }
    } catch (error) {
        console.error("Error fetching tasks:", error);
    }
}

async function addTask() {
    let taskTitle = inputTask.value;
    if (!taskTitle) return;

    const dateTime = new Date().toISOString();
    const taskPayload = {
        title: taskTitle,
        createdAt: dateTime,
        description: "",
        status: "PENDING",
        priority: "1",
        dueDate: null,
        updatedAt: dateTime,
    };

    try {
        const response = await fetch("http://localhost:8080/todolist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(taskPayload),
        });

        if (response.ok) {
            const data = await response.json();
            const newTaskElement = createTaskView(data.title, data.id);
            listContainer.appendChild(newTaskElement);
            inputTask.value = "";
        }
    } catch (error) {
        console.error("Error adding task:", error);
    }
}

async function deleteTask(listItem, taskId) {
    listItem.classList.add("task-animateOut");
    
    const animationEnd = new Promise((resolve) => {
        listItem.addEventListener("animationend", resolve, { once: true });
    });

    try {
        await animationEnd;
        const response = await fetch(`http://localhost:8080/todolist/${taskId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
            listItem.remove(); // Melhor que searchAllTasks() para manter a animação fluida
            console.log(`Tarefa ${taskId} deletada.`);
        } else {
            listItem.classList.remove("task-animateOut");
        }
    } catch (error) {
        console.error("Error deleting task:", error);
        listItem.classList.remove("task-animateOut");
    }
}