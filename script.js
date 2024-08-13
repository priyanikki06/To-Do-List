$(document).ready(function() {
    let currentEditLi = null;

    // Initialize flatpickr date picker
    const datePicker = flatpickr("#datePicker", {
        dateFormat: "Y-m-d",
        positionElement: $("#datePickerIcon")[0], // Position calendar relative to the calendar icon
        onChange: function(selectedDates, dateStr, instance) {
            $("#datePicker").val(dateStr);
        }
    });

    // Initialize flatpickr date picker for edit modal
    const editDatePicker = flatpickr("#editDatePicker", {
        dateFormat: "Y-m-d",
        onChange: function(selectedDates, dateStr, instance) {
            $("#editDatePicker").val(dateStr);
        }
    });

    // Open date picker when calendar icon is clicked
    $("#datePickerIcon").click(function() {
        datePicker.open();
    });

    // Add Task Button
    $("#addTaskButton").click(function() {
        const taskText = $("#taskInput").val().trim();
        const dueDate = $("#datePicker").val();
        if (taskText === "") {
            alert("You must write something!");
            return;
        }

        const task = {
            text: taskText,
            dueDate: dueDate,
            completed: false,
            important: false
        };

        // Add task to the list
        addTaskToList(task);

        // Save tasks to local storage
        saveTasksToLocalStorage();

        $("#taskInput").val("");
        $("#datePicker").val("");
    });

    // Save Edit Button
    $("#saveEditButton").click(function() {
        const newTaskText = $("#editTaskInput").val().trim();
        const newDueDate = $("#editDatePicker").val().trim();

        if (newTaskText !== "") {
            currentEditLi.find(".task-text").text(newTaskText);
        }

        if (newDueDate !== "") {
            currentEditLi.find(".end-date").text(newDueDate);
        }

        // Save tasks to local storage
        saveTasksToLocalStorage();

        // Update due date colors after saving changes
        updateDueDateColors();

        $("#editModal").css("display", "none");
    });

    // Delete Task Button
    $("#taskList").on("click", ".delete-icon", function() {
        const li = $(this).closest("li");
        li.remove();

        // Save tasks to local storage
        saveTasksToLocalStorage();
    });

    // Complete Task Button
    $("#taskList").on("click", ".complete-icon", function() {
        const li = $(this).closest("li");
        li.toggleClass("completed");

        // Save tasks to local storage
        saveTasksToLocalStorage();
    });

    // Mark Important Button
    $("#taskList").on("click", ".important-icon", function() {
        const li = $(this).closest("li");
        const icon = $(this).find("i");
        li.toggleClass("important");

        // Toggle the golden class on the icon button
        $(this).toggleClass("golden");

        if (li.hasClass("important")) {
            // Move the task to the top
            $("#taskList").prepend(li);
        } else {
            sortTasksByImportance();
        }

        // Save tasks to local storage
        saveTasksToLocalStorage();
    });

    // Function to save tasks to local storage
    function saveTasksToLocalStorage() {
        const tasks = [];
        $("#taskList li").each(function() {
            const text = $(this).find(".task-text").text();
            const dueDate = $(this).find(".end-date").text();
            const completed = $(this).hasClass("completed");
            const important = $(this).hasClass("important");

            tasks.push({ text, dueDate, completed, important });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Function to load tasks from local storage
    function loadTasksFromLocalStorage() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => {
            addTaskToList(task);
        });
        updateDueDateColors();
    }

    // Function to add a task to the list
    function addTaskToList(task) {
        const li = $("<li></li>");
        const taskTextSpan = $("<span></span>").addClass("task-text").text(task.text);
        const endDateSpan = $("<span></span>").addClass("end-date").text(task.dueDate);
        li.append(taskTextSpan);
        li.append(endDateSpan);

        const editBtn = $("<button></button>").addClass("icon-btn edit-icon").attr("title", "Edit task").html('<i class="fas fa-edit"></i>');
        const completeBtn = $("<button></button>").addClass("icon-btn complete-icon").attr("title", "Mark as complete").html('<i class="fas fa-check"></i>');
        const deleteBtn = $("<button></button>").addClass("icon-btn delete-icon").attr("title", "Delete task").html('<i class="fas fa-trash-alt"></i>');
        const notificationBtn = $("<button></button>").addClass("icon-btn notification-icon").attr("title", "Set reminder").html('<i class="fas fa-bell"></i>');
        const importantBtn = $("<button></button>").addClass("icon-btn important-icon").attr("title", "Mark important").html('<i class="fas fa-exclamation-circle"></i>');

        const buttonContainer = $("<div></div>").addClass("task-actions").append(editBtn, completeBtn, deleteBtn, notificationBtn, importantBtn);
        li.append(buttonContainer);

        if (task.completed) {
            li.addClass("completed");
        }

        if (task.important) {
            li.addClass("important");
            importantBtn.addClass("golden");
        }

        $("#taskList").append(li);
    }

    // Load tasks from local storage when the document is ready
    loadTasksFromLocalStorage();

    // Edit Task Button
    $("#taskList").on("click", ".edit-icon", function() {
        const li = $(this).closest("li");
        const taskText = li.find(".task-text").text();
        const dueDate = li.find(".end-date").text();

        currentEditLi = li;
        $("#editTaskInput").val(taskText); // Set the current task text in the edit task input field
        $("#editDatePicker").val(dueDate); // Set the due date in the date input field
        $("#editModal").css("display", "block");
    });

    // Close Edit Modal
    $(".close-btn").click(function() {
        $("#editModal").css("display", "none");
    });

    // Function to update due date colors
    function updateDueDateColors() {
        const now = new Date();
        const oneDayLater = new Date(now.getTime() + (1 * 24 * 60 * 60 * 1000));
        const twoDaysLater = new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000));

        $(".end-date").each(function() {
            const dueDate = new Date($(this).text());

            if (dueDate < now) {
                $(this).removeClass("orange").addClass("red");
            } else if (dueDate < oneDayLater) {
                $(this).removeClass("orange").addClass("red");
            } else if (dueDate < twoDaysLater) {
                $(this).removeClass("red").addClass("orange");
            } else {
                $(this).removeClass("red orange");
            }
        });
    }

    // Initialize SortableJS for task list
    const taskList = document.getElementById('taskList');
    const sortable = Sortable.create(taskList, {
        animation: 150,
        onEnd: function(evt) {
            // Save tasks to local storage
            saveTasksToLocalStorage();
        }
    });

    //---------------------------------
    // Reminder Functionality

    // Add Event Listener for Notification Button
    $("#taskList").on("click", ".notification-icon", function() {
        const li = $(this).closest("li");
        const taskText = li.find(".task-text").text();

        // Show reminder options
        showReminderOptions(taskText);
    });

    // Function to Show Reminder Options
    function showReminderOptions(taskText) {
        // Display the reminder modal
        $("#reminderModal").addClass("visible");

        // Store the task text in a data attribute for later use
        $("#reminderModal").data("taskText", taskText);
    }

    // Event listener for reminder options buttons (inside the modal)
    $("#reminderModal").on("click", ".reminder-option", function() {
        const reminderTime = $(this).data("time");
        const taskText = $("#reminderModal").data("taskText");
        setTimeout(() => showReminder(taskText), reminderTime * 1000); // Convert seconds to milliseconds
        $("#reminderModal").removeClass("visible"); // Hide reminder modal after selection
    });

    // Dismiss Reminder Button Click Handler
    $("#dismissReminder").click(function() {
        $("#reminderCard").removeClass("visible");
    });


    // Function to parse reminder time
    function parseReminderTime(time) {
        return parseInt(time) * 1000; // Convert seconds to milliseconds
    }

    // Function to Show Reminder Card
    function showReminder(taskText) {
        $("#reminderText").text(`Reminder for: ${taskText}`);
        $("#reminderCard").addClass("visible");

        // Hide reminder card after a delay (if needed)
        setTimeout(() => {
            $("#reminderCard").removeClass("visible");
        }, 5000); // Adjust delay as needed
    }

});
