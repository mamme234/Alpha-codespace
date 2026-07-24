const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

// Email Service
let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return transporter;
}

async function sendVerificationEmail(email, userId) {
  try {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
    const verifyUrl = `${process.env.CORS_ORIGIN}/verify?token=${token}`;
    
    await getTransporter().sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Verify Your Email - Codespace',
      html: `
        <h1>Welcome to Codespace!</h1>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verifyUrl}">${verifyUrl}</a>
        <p>This link will expire in 24 hours.</p>
      `
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

async function sendPasswordResetEmail(email, token) {
  try {
    const resetUrl = `${process.env.CORS_ORIGIN}/reset-password?token=${token}`;
    
    await getTransporter().sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Reset Password - Codespace',
      html: `
        <h1>Reset Your Password</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
      `
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

// File Service
const archiver = require('archiver');
const unzipper = require('unzipper');
const fs = require('fs-extra');
const path = require('path');

async function zipDirectory(sourceDir, outputPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    output.on('close', resolve);
    archive.on('error', reject);
    
    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

async function unzipFile(zipPath, targetDir) {
  await fs.ensureDir(targetDir);
  await fs.createReadStream(zipPath)
    .pipe(unzipper.Extract({ path: targetDir }))
    .promise();
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  zipDirectory,
  unzipFile
};
