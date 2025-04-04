<!-- src/views/Tasks.vue -->
<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";

interface Task {
  _id: string;
  title: string;
}

const tasks = ref<Task[]>([]);

const fetchTasks = async () => {
  const { data } = await axios.get("http://localhost:5000/api/tasks");
  tasks.value = data;
};

const addTask = async () => {
  await axios.post("http://localhost:5000/api/tasks", { title: "New Task" });
  fetchTasks();
};

const deleteTask = async (id: string) => {
  await axios.delete(`http://localhost:5000/api/tasks/${id}`);
  fetchTasks();
};

onMounted(fetchTasks);
</script>

<template>
  <div>
    <h2>Tasks</h2>
    <button @click="addTask">Add Task</button>
    <ul>
      <li v-for="task in tasks" :key="task._id">
        {{ task.title }} <button @click="deleteTask(task._id)">Delete</button>
      </li>
    </ul>
  </div>
</template>
