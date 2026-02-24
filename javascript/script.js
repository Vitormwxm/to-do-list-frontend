let buttonAddTask = document.querySelector("#add_button");
let inputTask = document.querySelector("#add-task");

buttonAddTask.addEventListener("click", addTask);

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

                searchAllTasks(data.title);
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

            const list = document.querySelector("#task-list");
            list.innerHTML = "";

            taksData.forEach((task) => {
                createTaskView(task.title);
            });
        }
    } catch (error) {
        console.error("Error fetching tasks:", error);
    }
}

function createTaskView(taskTitle) {
    const list = document.querySelector("#task-list");
    const listItem = document.createElement("li");
    listItem.textContent = taskTitle;
    list.appendChild(listItem);
}
