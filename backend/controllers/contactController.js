// controllers/contactController.js
const nodemailer = require('nodemailer');

exports.sendContactMessage = async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Create email transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.CONTACT_EMAIL_USER,
                pass: process.env.CONTACT_EMAIL_PASS,
            },
        });

        // ✅ Build email content
        const mailOptions = {
            from: `"${name}" <${process.env.CONTACT_EMAIL_USER}>`,
            to: process.env.CONTACT_EMAIL_RECEIVER,
            replyTo: email, // 👈 So you can reply directly to the sender
            subject: 'New Contact Message from AUTORENT',
            html: `
                <h3>New Contact Message</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>
            `
        };

        // ✅ Send the email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Your message has been sent successfully!' });
    } catch (error) {
        console.error('Email sending error:', error.message);
        res.status(500).json({ message: 'Failed to send message. Please try again later.' });
    }
};
