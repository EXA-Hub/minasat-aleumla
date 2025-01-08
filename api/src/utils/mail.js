import { createTransport } from 'nodemailer';
import config from '../config.js';

const { emailUser } = config;

var mail = createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: process.env.GMAIL_SECRET,
  },
});

export default mail;
