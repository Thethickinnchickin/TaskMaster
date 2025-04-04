import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const sendEmail = async (email: string, code: number) => {
  try {
    await axios.post("https://api.emailjs.com/api/v1.0/email/send", {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_USER_ID,
      template_params: {
        to_email: email,
        verification_code: code,
      },
    });
    console.log(`📧 Verification email sent to ${email}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

export default sendEmail;
