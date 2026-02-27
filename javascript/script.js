let buttonAddTask = document.querySelector("#add_button");
let inputTask = document.querySelector("#add-task");
// let buttonDeleteTask = document.querySelector(".square");
const listContainer = document.querySelector("#task_list");

buttonAddTask.addEventListener("click", addTask);
listContainer.addEventListener("click", function (event) {
    const target = event.target.closest(".square");
  
    if (target) {
        
        const listItem = target.parentElement;
        console.log(listItem);
        const taskId = listItem.getAttribute("data-task-id");
       
        deleteTask(listItem, taskId);
    }
});

window.onload = function () {
    searchAllTasks();
}; 

async function addTask() {
    let taskTitle = inputTask.value;
    if (taskTitle) {
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
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(taskPayload),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Sucesso:", data);

                const newTaskElement = createTaskView(data.title, data.id);

                const taskList = document.querySelector("#task_list");
                taskList.appendChild(newTaskElement);

                // searchAllTasks();
                inputTask.value = "";
            }
        } catch (error) {
            console.error("Error adding task:", error);
        }
    }
}

async function searchAllTasks() {
    try {
        const response = await fetch("http://localhost:8080/todolist");
        if (response.ok) {
            const tasks = await response.json();

            const taksData = tasks.content;

            const list = document.querySelector("#task_list");
            list.innerHTML = "";

            taksData.forEach((task) => {
                console.log(task.id)
                createTaskView(task.title, task.id);
            });
        }
    } catch (error) {
        console.error("Error fetching tasks:", error);
    }
}

function createTaskView(taskTitle, taskId) {
    const list = document.querySelector("#task_list");
    const listItem = document.createElement("li");

    listItem.setAttribute("data-task-id", taskId);
    listItem.textContent = taskTitle;
    listItem.classList.add("task-animate");
    const deleteButton = document.createElement("span");

    deleteButton.className = "square";
    deleteButton.innerHTML = '<img src="imgs/icons8-lixeira 1.svg" alt="lixeira" width="30px">';
    
    listItem.appendChild(deleteButton);
    list.appendChild(listItem);
}

async function deleteTask(listItem,taskId) {
    listItem.classList.add("task-animateOut");
    
    const animationEnd = new Promise((resolve) => {
        listItem.addEventListener("animationend", resolve, { once: true });
    });

    try {
        await animationEnd;

        const response = await fetch(
            `http://localhost:8080/todolist/${taskId}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );

        if (response.ok) {
            console.log(`Tarefa ${taskId} deletada com sucesso!`);
            // searchAllTasks();
        } else {
            console.error("Erro ao deletar a tarefa no servidor.");
        }

    } catch (error) {
        console.error("Error deleting task:", error);
    }
}
