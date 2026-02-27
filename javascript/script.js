// --- ELEMENTOS DO DOM ---
const buttonAddTask = document.querySelector("#add_button");
const inputTask = document.querySelector("#add-task");
const listContainer = document.querySelector("#task_list");
const modal = document.querySelector("#modal-container");
const closeModalButton = document.querySelector("#close-modal-cancel");
// --- EVENTOS ---
window.onload = searchAllTasks;
buttonAddTask.addEventListener("click", addTask);

listContainer.addEventListener("click", function (event) {
    const target = event.target.closest(".square"); 
    const listItem = event.target.closest("li"); //
    
    console.log(listItem);
    if (target) {
        const taskId = listItem.getAttribute("data-task-id");
        deleteTask(listItem, taskId);
    } else if (listItem) {
        const taskId = listItem.getAttribute("data-task-id");
        openModalTaskDetails(taskId);
    }
});

closeModalButton.addEventListener("click", () => {
    modal.classList.remove("active");
});

// --- INTERFACE (UI) ---

function createTaskView(taskTitle, taskId) {
    const listItem = document.createElement("li");
    listItem.setAttribute("data-task-id", taskId);
    listItem.textContent = taskTitle;
    listItem.classList.add("task-animate"); 

    const deleteButton = document.createElement("span");
    deleteButton.className = "square";
    deleteButton.innerHTML = '<img src="imgs/icons8-lixeira 1.svg" alt="lixeira" width="30px">';
    
    listItem.appendChild(deleteButton);
    return listItem; 
}

async function openModalTaskDetails(taskId) {
    console.log(`Abrir modal para tarefa ID: ${taskId}`);

    try {
        const response = await fetch(`http://localhost:8080/todolist/${taskId}`);
        if (response.ok) {
            const task = await response.json();

            document.querySelector("#modal-title").textContent = task.title;
            document.querySelector("#modal-status").textContent = task.status;
            document.querySelector("#modal-description").value = task.description || "Sem descrição.";
            
            const date = new Date(task.createdAt).toLocaleString('pt-BR');
            document.querySelector("#modal-date").textContent = date;

            modal.classList.add("active");
        } else {
            console.error("Erro ao buscar detalhes da tarefa.");
        }
    } catch (error) {
        console.error("Erro na requisição do modal:", error);
    }
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
            listItem.remove();
            console.log(`Tarefa ${taskId} deletada.`);
        } else {
            listItem.classList.remove("task-animateOut");
        }
    } catch (error) {
        console.error("Error deleting task:", error);
        listItem.classList.remove("task-animateOut");
    }
}