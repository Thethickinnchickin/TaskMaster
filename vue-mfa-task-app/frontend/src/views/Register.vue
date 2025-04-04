<!-- src/views/Register.vue -->
<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";

const email = ref("");
const password = ref("");
const verificationCode = ref("");
const isVerificationSent = ref(false);
const error = ref("");

const register = async () => {
  try {
    await axios.post("http://localhost:5000/api/auth/register", {
      email: email.value,
      password: password.value,
    });
    isVerificationSent.value = true;
  } catch (err) {
    error.value = "Registration failed";
  }
};

const verifyCode = async () => {
  try {
    await axios.post("http://localhost:5000/api/auth/verify", {
      email: email.value,
      verificationCode: verificationCode.value,
    });
    window.location.href = "/login";
  } catch (err) {
    error.value = "Verification failed";
  }
};
</script>

<template>
  <div>
    <h2>Register</h2>
    <div v-if="!isVerificationSent">
      <input v-model="email" placeholder="Email" />
      <input type="password" v-model="password" placeholder="Password" />
      <button @click="register">Register</button>
    </div>
    <div v-else>
      <input v-model="verificationCode" placeholder="Enter Code" />
      <button @click="verifyCode">Verify</button>
    </div>
    <p v-if="error">{{ error }}</p>
  </div>
</template>
