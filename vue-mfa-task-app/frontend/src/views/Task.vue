<!-- src/views/Tasks.vue -->
<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";

interface Task {
  _id: string;
  title: string;
  completed?: boolean;
}

const tasks = ref<Task[]>([]);
const newTaskTitle = ref("");

const fetchTasks = async () => {
  const { data } = await axios.get("https://localhost:5000/api/tasks", {
    withCredentials: true,
  });
  tasks.value = data;
};

const addTask = async () => {
  if (!newTaskTitle.value.trim()) return;
  await axios.post("https://localhost:5000/api/tasks", { title: newTaskTitle.value }, {
    withCredentials: true,
  });
  newTaskTitle.value = "";
  fetchTasks();
};

const updateTask = async (task: Task) => {
  await axios.put(`https://localhost:5000/api/tasks/${task._id}`, {
    title: task.title,
    completed: task.completed,
  }, {
    withCredentials: true,
  });
};

const deleteTask = async (id: string) => {
  await axios.delete(`https://localhost:5000/api/tasks/${id}`, {
    withCredentials: true,
  });
  fetchTasks();
};

onMounted(fetchTasks);
</script>

<template>
  <div class="max-w-xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
    <h2 class="text-2xl font-bold mb-4 text-center">📝 My Tasks</h2>

    <div class="flex mb-6">
      <input
        v-model="newTaskTitle"
        @keyup.enter="addTask"
        placeholder="Enter a new task..."
        class="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        @click="addTask"
        class="px-4 py-2 bg-blue-500 text-white font-medium rounded-r-lg hover:bg-blue-600 transition"
      >
        Add
      </button>
    </div>

    <ul class="space-y-3">
      <li
        v-for="task in tasks"
        :key="task._id"
        class="flex items-center justify-between bg-gray-100 p-3 rounded-lg shadow-sm"
      >
        <input
          v-model="task.title"
          @change="updateTask(task)"
          class="flex-1 bg-transparent border-none focus:outline-none font-medium"
        />
        <div class="space-x-2">
          <button
            @click="updateTask(task)"
            class="text-green-600 hover:underline text-sm"
          >
            Save
          </button>
          <button
            @click="deleteTask(task._id)"
            class="text-red-600 hover:underline text-sm"
          >
            Delete
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
input[type="text"] {
  width: 100%;
}
</style>

