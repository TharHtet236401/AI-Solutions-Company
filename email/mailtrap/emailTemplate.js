export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Verify Your Email</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>Thank you for signing up! Your verification code is:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50;">{verificationCode}</span>
    </div>
    <p>Or click the link below to go to the verification page:</p>
    <div style="text-align: center; margin: 20px 0;">
      <a href="{verificationPage}" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
    </div>
    <p>Enter this code on the verification page to complete your registration.</p>
    <p>This code will expire in 15 minutes for security reasons.</p>
    <p>If you didn't create an account with us, please ignore this email.</p>
    <p>Best regards,<br>Your App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset Successful</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We're writing to confirm that your password has been successfully reset.</p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #4CAF50; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; font-size: 30px;">
        ✓
      </div>
    </div>
    <p>If you did not initiate this password reset, please contact our support team immediately.</p>
    <p>For security reasons, we recommend that you:</p>
    <ul>
      <li>Use a strong, unique password</li>
      <li>Enable two-factor authentication if available</li>
      <li>Avoid using the same password across multiple sites</li>
    </ul>
    <p>Thank you for helping us keep your account secure.</p>
    <p>Best regards,<br>Your App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
    <p>To reset your password, click the button below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{resetURL}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
    </div>
    <p>This link will expire in 15 minutes for security reasons.</p>
    <p>Best regards,<br>Your App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_CHANGED_ALERT_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Changed Alert</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Changed Alert</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>This email is to notify you that your password was recently changed.</p>
    <p>If you made this change, you can safely ignore this email.</p>
    <p>If you did NOT change your password, please:</p>
    <ul>
      <li>Change your password immediately</li>
      <li>Review your account for any suspicious activity</li>
      <li>Contact our support team right away</li>
    </ul>
    <p>For enhanced security, we recommend:</p>
    <ul>
      <li>Using a strong, unique password</li>
      <li>Enabling two-factor authentication</li>
      <li>Regularly monitoring your account activity</li>
    </ul>
    <p>Best regards,<br>Your App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_CHANGE_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Password Change</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Confirm Password Change</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We received a request to change your password. If you didn't make this request, please ignore this email.</p>
    <p>To confirm your password change, click the button below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{resetURL}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Confirm Password Change</a>
    </div>
    <p>This link will expire in 15 minutes for security reasons.</p>
    <p>Best regards,<br>Your App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const OTP_LOGIN_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OTP Login Code</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Your OTP Login Code</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>Here is your one-time password (otp) for login:</p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
        {otp}
      </div>
    </div>
    <p>This code will expire in 15 minutes for security reasons.</p>
    <p>Please do not share this code with anyone.</p>
    <p>If you did not request this OTP code, please change your password immediately.</p>
    <p>Click the link below to verify your OTP code:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{resetURL}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify OTP Code</a>
    </div>
    <p>Best regards,<br>Your App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;


export const AUTHENTICATOR_SETUP_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Authenticator App Setup</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Welcome {name}!</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Thank you for registering! To complete your account setup, please configure two-factor authentication.</p>
    <h2 style="color: #4CAF50; text-align: center;">Set Up Your Authenticator App</h2>
    <div style="text-align: center; margin: 30px 0;">
      <img src="{qrCodeDataUrl}" alt="QR Code for authenticator setup" style="max-width: 200px; margin: 0 auto; display: block; border: 1px solid #ddd; padding: 10px; background: white;">
    </div>
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <h3 style="color: #333; margin-top: 0;">Instructions:</h3>
      <ol style="margin-left: 20px;">
        <li>Download an authenticator app (like Google Authenticator or Authy)</li>
        <li>Open your authenticator app</li>
        <li>Scan the QR code above</li>
        <li>Enter the generated code for account verification and for future logins</li>
        <li>Please do not share this QR code with anyone</li>
      </ol>
    </div>
    <p style="color: #666;">This additional security measure helps protect your account from unauthorized access.</p>
    <p>Best regards,<br>Your App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

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
