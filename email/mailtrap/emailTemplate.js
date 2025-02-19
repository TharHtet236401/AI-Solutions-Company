// This is the template for the verification code email
export const VERIFICATION_CODE_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Code</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Roboto', Arial, sans-serif; line-height: 1.6; color: #2c3e50; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
  <div style="background: linear-gradient(135deg, #10375B, #1a4b76); padding: 2.5rem; text-align: center; border-radius: 20px 20px 0 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <h1 style="color: white; margin: 0; font-size: 2rem; font-weight: 500;">Verification Code</h1>
  </div>
  <div style="background-color: white; padding: 2.5rem; border-radius: 0 0 20px 20px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
    <p style="font-size: 1.1rem; color: #2c3e50; margin-bottom: 1.5rem;">Hello,</p>
    <p style="font-size: 1.1rem; color: #2c3e50; margin-bottom: 2rem;">Please use the following verification code to complete your inquiry submission:</p>
    <div style="text-align: center; margin: 2rem 0;">
      <div style="background: linear-gradient(135deg, #f8f9fa, #ffffff); padding: 1.5rem; border-radius: 12px; display: inline-block; border: 2px solid #e8eef3; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        <div style="font-size: 2.5rem; font-weight: 700; letter-spacing: 0.5rem; color: #10375B; text-transform: uppercase;">
          {verificationCode}
        </div>
      </div>
    </div>
    <div style="background-color: #f8f9fa; border-radius: 8px; padding: 1.5rem; margin: 2rem 0; border-left: 4px solid #3498db;">
      <p style="margin: 0; color: #2c3e50; font-size: 0.95rem;">
        <strong style="color: #10375B;">Important:</strong><br>
        • This code will expire in 15 minutes<br>
        • Please do not share this code with anyone
      </p>
    </div>
    <div style="margin-top: 2.5rem; padding-top: 2rem; border-top: 1px solid #e8eef3;">
      <p style="margin: 0; color: #2c3e50;">Best regards,</p>
      <p style="margin: 0.5rem 0 0; color: #10375B; font-weight: 500;">AI Solutions Team</p>
    </div>
  </div>
  <div style="text-align: center; margin-top: 1.5rem; color: #666;">
    <p style="font-size: 0.9rem; margin: 0;">
      © 2024 AI Solutions. All rights reserved.<br>
      <span style="color: #999; font-size: 0.8rem;">This is an automated message, please do not reply.</span>
    </p>
  </div>
</body>
</html>
`;


// This is the template for the thank you email after verification
export const THANK_YOU_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Your Inquiry</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Roboto', Arial, sans-serif; line-height: 1.6; color: #2c3e50; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
  <div style="background: linear-gradient(135deg, #10375B, #1a4b76); padding: 2.5rem; text-align: center; border-radius: 20px 20px 0 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <h1 style="color: white; margin: 0; font-size: 2rem; font-weight: 500;">Thank You for Your Inquiry</h1>
  </div>
  <div style="background-color: white; padding: 2.5rem; border-radius: 0 0 20px 20px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
      <p style="font-size: 1.1rem; color: #2c3e50; margin-bottom: 1.5rem;">Dear {name},</p>
    <p style="font-size: 1.1rem; color: #2c3e50; margin-bottom: 1.5rem;">Thank you for submitting your inquiry to AI Solutions. We have successfully received your request and our team will review it shortly.</p>
    <div style="background-color: #f8f9fa; border-radius: 8px; padding: 1.5rem; margin: 2rem 0; border-left: 4px solid #3498db;">
      <p style="margin: 0; color: #2c3e50; font-size: 0.95rem;">
        <strong style="color: #10375B;">What happens next:</strong><br>
        • Our team will carefully review your requirements<br>
        • We will contact you within 1-2 business days<br>
        • We may request additional information if needed
      </p>
    </div>
    <p style="font-size: 1.1rem; color: #2c3e50; margin-bottom: 1.5rem;">If you have any immediate questions, please don't hesitate to reach out to our support team.</p>
    <div style="margin-top: 2.5rem; padding-top: 2rem; border-top: 1px solid #e8eef3;">
      <p style="margin: 0; color: #2c3e50;">Best regards,</p>
      <p style="margin: 0.5rem 0 0; color: #10375B; font-weight: 500;">AI Solutions Team</p>
    </div>
  </div>
  <div style="text-align: center; margin-top: 1.5rem; color: #666;">
    <p style="font-size: 0.9rem; margin: 0;">
      © 2024 AI Solutions. All rights reserved.<br>
      <span style="color: #999; font-size: 0.8rem;">This is an automated message, please do not reply.</span>
    </p>
  </div>
</body>
</html>
`;


export const INQUIRY_REPLY_TEMPLATE = `
<!DOCTYPE html> 
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inquiry Reply</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Roboto', Arial, sans-serif; line-height: 1.6; color: #2c3e50; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff;">
  <div style="background: linear-gradient(135deg, #10375B, #1a4b76); padding: 1.5rem; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 1.5rem; font-weight: 500;">AI Solutions</h1>
  </div>
  <div style="padding: 1.5rem; border-radius: 0 0 8px 8px; border: 1px solid #eee;">
    <div style="white-space: pre-line; font-size: 1rem; color: #2c3e50;">{replyContent}</div>
  </div>
</body>
</html>
`;
  
