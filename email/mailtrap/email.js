import { mailtrapClient, sender } from "./mailtrap.config.js";
import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  PASSWORD_CHANGED_ALERT_TEMPLATE,
  PASSWORD_CHANGE_REQUEST_TEMPLATE,
  OTP_LOGIN_TEMPLATE,
  AUTHENTICATOR_SETUP_TEMPLATE
} from "./emailTemplate.js";


//send verification email
export const sendVerificationEmail = async (email, verificationToken, verificationPage) => {
  const recipient = [{ email }];

  try {
    //use the mailtrapClient to send the email
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE
        .replace("{verificationCode}", verificationToken)
        .replace("{verificationPage}", verificationPage),
      category: "Email Verification",
    });
  } catch (error) {
    console.error(`Error sending verification`, error);

    throw new Error(`Error sending verification email: ${error}`);
  }
};

//send authenticator setup email
export const sendAuthenticatorSetupEmail = async (email, name, qrCodeDataUrl) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Authenticator App Setup",
      html: AUTHENTICATOR_SETUP_TEMPLATE
        .replace("{name}", name)
        .replace("{qrCodeDataUrl}", qrCodeDataUrl),
      category: "Authenticator App Setup",
    });
  } catch (error) {
    console.error(`Error sending authenticator setup email`, error);
    throw new Error(`Error sending authenticator setup email: ${error}`);
  }
};

//send password reset email
export const sendPasswordResetEmail = async (email, resetURL) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
      category: "Password Reset",
    });

  } catch (error) {
    console.error(`Error sending password reset email`, error);
    throw new Error(`Error sending password reset email: ${error}`);
  }
};

//send password reset success email
export const sendResetSuccessEmail = async (email) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Password reset successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password Reset",
    });
    
  } catch (error) {
    console.error(`Error sending reset success email`, error);
    throw new Error(`Error sending reset success email: ${error}`);
  }
};

//send password change email
export const sendPasswordChangeEmail = async (email, resetURL) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Password Changing Request",
      html: PASSWORD_CHANGE_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
      category: "Password Changing Request",
    });
  } catch (error) {
    console.error(`Error sending password change email`, error);
    throw new Error(`Error sending password change email: ${error}`);
  }
};

//send password changed alert email
export const sendPasswordChangedAlertEmail = async (email) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
    to: recipient,
    subject: "Password changed alert",
    html: PASSWORD_CHANGED_ALERT_TEMPLATE,
      category: "Password Changed Alert",
    });
    
  } catch (error) {
    console.error(`Error sending password changed alert email`, error);
    throw new Error(`Error sending password changed alert email: ${error}`);
  }
};

//send OTP login email
export const sendOtpLoginEmail = async (email, otp, resetURL) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "OTP Login",
      html: OTP_LOGIN_TEMPLATE.replace("{otp}", otp).replace("{resetURL}", resetURL),
      category: "OTP Login",
    });
  } catch (error) {
    console.error(`Error sending OTP login email`, error);
    throw new Error(`Error sending OTP login email: ${error}`);
  }
}
