const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // Email options
    const mailOptions = {
        from: process.env.EMAIL_FROM || 'LiftED <noreply@lifted.ke>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
    };

    // Send email
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        return info;
    } catch (err) {
        if (process.env.NODE_ENV === 'production') {
            console.error('Failed to send email:', err);
        }
        throw err;
    }
};

module.exports = sendEmail;


