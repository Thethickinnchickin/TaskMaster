<template>
    <div>
      <nav>
        <button v-if="onSignIn || onVerification" @click="changePages">Register</button>
        <button v-else="onRegistration || onVerification" @click="changePages">Sign In</button>
        <button  @click="test">Test</button>
      </nav>
      <h2>Email Verification</h2>
      <form v-if="!onVerification && onSignIn" ref="form" @submit.prevent="sendEmail(false)">
        <label>Email</label>
        <input type="email" v-model="email" name="email" required />
        <input type="password" v-model="password" name="user_password" required />
        <button type="submit">Login</button>
      </form>
      <form v-if="!onVerification && onRegistration" ref="form" @submit.prevent="sendEmail(true)">
        <label>Email</label>
        <input type="email" v-model="email" name="user_email" required />
        <input type="password" v-model="password" name="user_password" required />
        <button type="submit">Register</button>
      </form>
      <form v-if="onVerification == true" ref="form" @submit.prevent="verifyEmail">
        <label>Email</label>
        <input type="text" v-model="code" name="code" required />
        <button type="submit">Verify</button>
      </form>
      <p v-if="message">{{ message }}</p>
    </div>
  </template>
  
<script setup lang="ts">
  import { ref } from "vue";
  import emailjs from "@emailjs/browser";
  import CryptoJS from "crypto-js";


  const secretKey = "mySuperSecretKey123!"; 
  const email = ref("");
  const password = ref("");
  let savedEmail = "";
  const message = ref("");
  const onVerification = ref(false);
  const onSignIn = ref(true);
  const onRegistration = ref(false);
  const code = ref("");
  let savedCode = "";

  // Function to generate a random salt
  const generateSalt = (): string => {
    return CryptoJS.lib.WordArray.random(128 / 8).toString(); // 128-bit salt
  };

  //Function to generate a random salt
  const hashedPassword = (password: string)=> {
    const salt = generateSalt(); //generates random salt
    const hashedPassword = CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,  // 256-bit hash size
      iterations: 1000,   // Iterations to make the hashing process slower
    }).toString();

    // Return the salt and hashed password concatenated, separated by a colon
    return salt + ":" + hashedPassword;
  }

  const encryptCode = (code: string) => {
    // Generate a random 128-bit Initialization Vector (IV)
    // This ensures that encrypting the same input multiple times produces different outputs
    const iv = CryptoJS.lib.WordArray.random(16);

    // Perform AES encryption using:
    // - The provided plaintext `code`
    // - The secret key (converted to UTF-8)
    // - The generated IV
    // - CBC mode for encryption
    // - PKCS7 padding to ensure proper data block size
    const encrypted = CryptoJS.AES.encrypt(code, CryptoJS.enc.Utf8.parse(secretKey), {
      iv: iv,                      // Use the generated IV for randomness
      mode: CryptoJS.mode.CBC,     // Use Cipher Block Chaining (CBC) mode
      padding: CryptoJS.pad.Pkcs7, // Use PKCS7 padding to handle block size
    });

    // Convert IV to a hexadecimal string and prepend it to the encrypted text
    // This allows decryption to extract and reuse the IV
    return iv.toString(CryptoJS.enc.Hex) + ":" + encrypted.toString();
  };

  const changePages = () => {
    onSignIn.value = !onSignIn.value;
    onRegistration.value = !onRegistration.value;
  }

  const sendEmail = (forRegistration : boolean) => {
    const verificationCode = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit code
    savedEmail = (email.value).toString();
    savedCode = verificationCode.toString();
    savedCode = encryptCode(savedCode);
    let passwordEnc = '';
    if(forRegistration) {
      passwordEnc = hashedPassword(password.value);
    } else {
      passwordEnc = encryptCode(password.value);
    }
    emailjs
      .send("service_uzcsrq6", "template_pnegxjc", {
        email: "mattreileydeveloper@gmail.com",
        passcode: verificationCode,
      }, "wUcej3QnlU5cqoB0E")
      .then(async() => {
        let url = ''
        console.log(forRegistration)
        if(forRegistration) {
          url = 'register'
        } else {
          url = 'login'
        }
        console.log(url)
        //Calling API to register the user after sending email with code
        const data = { email: savedEmail, password: passwordEnc, verificationCode: savedCode };
        fetch(`http://localhost:5000/api/auth/${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data) // Convert to JSON
        })
        .then(response => response.json())
        .then(data => {
            console.log(data)
            message.value = data.message; // Display server response
        })
        .catch(error => {
            console.error("Error verifying email:", error);
            message.value = "❌ Error verifying email.";
        });
        onVerification.value = true;
        message.value = "✅ Verification email sent!";


      })
      .catch((error) => {
        console.error("❌ Failed to send email:", error);
        message.value = "❌ Error sending email.";
      });
  };

  const verifyEmail = () => {
    const verification = { verificationCode: savedCode, email: email.value }; // Ensure correct key name
    fetch('http://localhost:5000/api/auth/verify-account', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(verification) // Convert to JSON
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
        message.value = data.message; // Display server response
    })
    .catch(error => {
        console.error("Error verifying email:", error);
        message.value = "❌ Error verifying email.";
    });
  };

  const test = () => {
    const verification = { verificationCode: savedCode, email: email.value }; // Ensure correct key name
    fetch('http://localhost:5000/api/auth/testing', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .catch(error => {
        console.error("Error verifying email:", error);
    });
  };
</script>
  