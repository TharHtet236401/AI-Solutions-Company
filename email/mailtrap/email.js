import { mailtrapClient, sender } from "./mailtrap.config.js";
import {
  VERIFICATION_CODE_TEMPLATE,
  THANK_YOU_TEMPLATE,
  INQUIRY_REPLY_TEMPLATE
} from "./emailTemplate.js";




export const sendVerficationCodeEmail = async (email, verificationCode) => {
  const recipient = [{ email }];
  console.log(email, verificationCode);
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Verification Code",
      html: VERIFICATION_CODE_TEMPLATE
        .replace("{verificationCode}", verificationCode),
      category: "Verification Code",
    });
    console.log("Verification code email sent successfully");
  } catch (error) {
    console.error(`Error sending verification code email`, error);
    throw new Error(`Error sending verification code email: ${error}`);
  }
};

export const sendThankYouEmail = async (email, name) => {
  const recipient = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Thank You for Your Inquiry",
      html: THANK_YOU_TEMPLATE.replace("{name}", name),
      category: "Thank You",
    });
    console.log("Thank you email sent successfully");
  } catch (error) {
    console.error(`Error sending thank you email`, error);
    throw new Error(`Error sending thank you email: ${error}`);
  }
};

export const sendInquiryReplyEmail = async (email, subject, replyContent) => {
  const recipient = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: subject,
      html: INQUIRY_REPLY_TEMPLATE.replace("{replyContent}", replyContent.replace(/\n/g, '<br>')),
      category: "Inquiry Reply",
    });

    console.log("Inquiry reply email sent successfully");
  } catch (error) {
    console.error(`Error sending inquiry reply email`, error);
    throw new Error(`Error sending inquiry reply email: ${error}`);
  }
};

