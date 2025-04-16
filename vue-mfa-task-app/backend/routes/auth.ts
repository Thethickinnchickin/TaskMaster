import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import CryptoJS from "crypto-js";
import { authenticateUser } from "../middleware/auth";

const router = express.Router();
const secretKey = "mySuperSecretKey123!"; 

//Function to compare the input password with the stored passwor
const comparePasswords = (inputPassword: string, storedPassword: string):boolean => {
  //Split the stored password into salt and hashed password
  const [salt, storedHashedPassword] = storedPassword.split(":");

  //Hash the input password with the same salt and the same number of iterations
  const hashedInputPassword = CryptoJS.PBKDF2(inputPassword, salt, {
    keySize: 256 / 32,
    iterations: 1000,
  }).toString();

  //Return true if the hashed match
  return hashedInputPassword === storedHashedPassword;
}

//Decryptes string code using CryptoJS and AES
//returns the encrypted code as a string
const decryptCode = (encryptedCode: string) => {
  // Split the encrypted string to separate IV and ciphertext
  const parts = encryptedCode.split(":");
  
  // Ensure the format is correct (IV and encrypted text must be present)
  if (parts.length !== 2) {
    throw new Error("Invalid encrypted format. Expected format: IV:Ciphertext");
  }

  // Extract the IV (Initialization Vector) from the first part
  // The IV is stored as a hexadecimal string and needs to be parsed
  const iv = CryptoJS.enc.Hex.parse(parts[0]);

  // Extract the encrypted data (ciphertext) from the second part
  const encryptedText = parts[1];

  // Decrypt the ciphertext using AES decryption
  const decrypted = CryptoJS.AES.decrypt(encryptedText, CryptoJS.enc.Utf8.parse(secretKey), {
    iv: iv,                      // Use the extracted IV for proper decryption
    mode: CryptoJS.mode.CBC,     // Ensure decryption is done in CBC mode (same as encryption)
    padding: CryptoJS.pad.Pkcs7, // Apply PKCS7 padding to correctly process the data
  });

  // Convert the decrypted binary data to a UTF-8 string and return it
  return decrypted.toString(CryptoJS.enc.Utf8);
};

//Compares the cryptic code and sees if the values are the same
//returns true if values equal and false if they do no
const compareCrypts = (encryptedValue1: string, encryptedValue2: string) => {
  return decryptCode(encryptedValue1) === decryptCode(encryptedValue2);
};

// REGISTER
//route to register the user with the verification code decoded into the database
router.post("/register", async (req, res) => {
  //extracting data sent from the request body
  const { email, password, verificationCode } = req.body;
  //check to see if the data collected is complete
  if(email && password && verificationCode) {
    try {
      //creating a new user from the client data and then saving into the database
      const user = new User({ email, password, verificationCode });
      await user.save();
  
      res.status(201).json({ 
        message: "User registered. Verification email sent!"
        ,isVerified: false });
    } catch (error) {
      //returned if their is an error in creation of the user
      res.status(400).json({ message: "Registration failed"
        ,isVerified: false
       });
    }
  } else {
    //returned if data sent by client is incomplete
    res.status(400).json({ message: "Registration failed. Incomplete data" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  //Retreives the email password and verification Code from body of request
  const { email, password, verificationCode } = req.body;
  //Checks to see if values from body are present to complete login
  if(email && password && verificationCode) {
    try {
      //Finds user through email
      const user = await User.findOne({email});
      //If user does not exist then it will send a 400 HTTP response 
      if(!user) {
        res.status(400).json({message: "Invalid credentials"});
        return;
      }
      //Set the verification code for the user model and save it to Data base
      user.verificationCode = verificationCode;
      await user.save();
      //If user is still verified then they will get a token 
      if(user.isVerified) {
        //Checking if passwords match through decryption
        if(comparePasswords(decryptCode(password), user.password)) {
          const token = jwt.sign(
            { userId: user._id, email: user.email },
            "process.env.JWT_SECRET" as string,
            { expiresIn: "2h" }
          );
      
          // Send it as a secure cookie
          res.cookie("authToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 2 * 60 * 60 * 1000 // 2 hours
          });
      
          // Also send in response if you want client to store it manually
          res.status(200).json({
            message: "✅ Login successful",
            ok: true,
            isVerified: true
          });

        } else {
          res.status(400).json({message: "Invalid credentials"});
          return;
        }
      } else {
        //Compares the given password to the hashed password in the database to see if they are a match
        if(comparePasswords(decryptCode(password), user.password)) {
          res.status(200).json({ 
            message: "Login Almost Complete verification sent. Check email inbox",
            isVerified: false
           });
        } else {
          res.status(400).json({message: "Invalid credentials"});
          return;
        }

      }
    } catch(error) {
      console.log(error)
      res.status(400).json({ message: "Login error" });
    }
  }
});

// VERIFY EMAIL
//route to verify if the code sent to the users email for MFA is correct
router.post("/verify-account", async (req, res) => {
  //getting the required data from the body of the request
  const { email, verificationCode } = req.body;
  //finding the user from extracted data after checking if needed data is present
  if(email && verificationCode) {
    const user = await User.findOne({email});
    //check if the user is present
    if(user) {
      //check if user has a verfication code present
      if(user?.verificationCode){
        //checking the encoded verification code matches the one from the found user
        if(compareCrypts(user?.verificationCode, verificationCode)) {
          //changing the isVerified status for user to ture and saving to the database
          user.isVerified = true;
          const now = new Date(); // Get the current date and time
          now.setMinutes(now.getMinutes() + 2); // Add 2 minutes to the current time
          user.verificationExpDate = now;
          await user.save(); // Save user to database 
          //Create token to be sent to the client
          const token = jwt.sign(
            { userId: user._id, email: user.email },  // payload
            "process.env.JWT_SECRET" as string,
            { expiresIn: "2h" }
          );

          //Set the cookie in the request
          res.cookie("authToken", token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 2 * 60 * 60 * 1000
          });
          
          // Send this if email verification is completed
          res.json({ message: "Email verified successfully", ok: true });
        } else {
          //returned if verfication code is not correct
          res.status(400).json({ message: "verification code incorrect" });
        }
      } else {
        //retunred if the user found doesnt have a verifcation code (should never reach here but just in case)
        res.status(400).json({ message: "Something went wrong please try logining in again" });
      }
    } else {
      //returned if user is not found
      res.status(400).json({ message: "User not found" });
    }
  } else {
    //returned if the data sent from the client is missing components
    res.status(400).json({ message: "Something went wrong please try verifying again" });
  }
});

router.post("/testing", authenticateUser, (req, res) => {
  console.log("jhellsdaf")
  const user = (req as any).user;
  console.log(user)
  res.status(200).json({ message: "✅ Authenticated user", user });
});

export default router;
