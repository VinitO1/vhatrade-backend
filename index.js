const express = require('express');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
require('dotenv').config();
const supabase = require('./config/supabaseClient');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Test endpoint to verify Supabase connection
app.get('/api/test', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('test')
            .select('*')
            .limit(1);

        if (error) throw error;

        res.json({
            message: 'Successfully connected to Supabase!',
            data: data
        });
    } catch (error) {
        console.error('Supabase connection error:', error);
        res.status(500).json({
            error: 'Failed to connect to Supabase',
            details: error.message
        });
    }
});

// Basic health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Contact form endpoint
app.post('/api/contact', [
    // Validation rules
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('subject')
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Subject must be between 5 and 200 characters'),
    body('message')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Message must be between 10 and 1000 characters'),
    body('company')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Company name must be less than 100 characters'),
    body('phone')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('Phone number must be less than 20 characters')
], async (req, res) => {
    try {
        // Log incoming request data
        console.log('Contact form submission received:', {
            body: req.body,
            headers: req.headers
        });

        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, email, company, phone, subject, message } = req.body;

        // Log validated data
        console.log('Validated contact data:', { name, email, company, phone, subject, message });

        // Store contact form data in Supabase
        const { data: contactData, error: contactError } = await supabase
            .from('contacts')
            .insert([
                {
                    name,
                    email,
                    company: company || null,
                    phone: phone || null,
                    subject,
                    message,
                    created_at: new Date().toISOString()
                }
            ])
            .select();

        if (contactError) {
            console.error('Supabase insert error:', contactError);
            throw new Error('Failed to save contact form data');
        }

        // Send email notification
        const emailSent = await sendContactEmail({
            name,
            email,
            company,
            phone,
            subject,
            message
        });

        // Send confirmation email to user
        const confirmationSent = await sendConfirmationEmail(email, name);

        res.json({
            success: true,
            message: 'Contact form submitted successfully!',
            data: {
                contactId: contactData[0].id,
                emailSent,
                confirmationSent
            }
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process contact form',
            error: error.message
        });
    }
});

        // Function to send contact form email to admin
        async function sendContactEmail(contactData) {
            try {
                // Create transporter with flexible configuration
                let transporter;
                
                if (process.env.SMTP_HOST) {
                    // Use custom SMTP server (organization email)
                    transporter = nodemailer.createTransport({
                        host: process.env.SMTP_HOST,
                        port: process.env.SMTP_PORT || 587,
                        secure: process.env.SMTP_SECURE === 'true',
                        auth: {
                            user: process.env.EMAIL_USER,
                            pass: process.env.EMAIL_PASS
                        }
                    });
                } else {
                    // Use Gmail (fallback)
                    transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: process.env.EMAIL_USER,
                            pass: process.env.EMAIL_PASS
                        }
                    });
                }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL || 'contact@vhatrade.ca',
            subject: `New Contact Form Submission: ${contactData.subject}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${contactData.name}</p>
                <p><strong>Email:</strong> ${contactData.email}</p>
                <p><strong>Company:</strong> ${contactData.company || 'Not provided'}</p>
                <p><strong>Phone:</strong> ${contactData.phone || 'Not provided'}</p>
                <p><strong>Subject:</strong> ${contactData.subject}</p>
                <p><strong>Message:</strong></p>
                <p>${contactData.message.replace(/\n/g, '<br>')}</p>
                <hr>
                <p><em>Submitted on: ${new Date().toLocaleString()}</em></p>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Contact email sent:', info.messageId);
        return true;

    } catch (error) {
        console.error('Email sending error:', error);
        return false;
    }
}

        // Function to send confirmation email to user
        async function sendConfirmationEmail(userEmail, userName) {
            try {
                // Create transporter with flexible configuration
                let transporter;
                
                if (process.env.SMTP_HOST) {
                    // Use custom SMTP server (organization email)
                    transporter = nodemailer.createTransport({
                        host: process.env.SMTP_HOST,
                        port: process.env.SMTP_PORT || 587,
                        secure: process.env.SMTP_SECURE === 'true',
                        auth: {
                            user: process.env.EMAIL_USER,
                            pass: process.env.EMAIL_PASS
                        }
                    });
                } else {
                    // Use Gmail (fallback)
                    transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: process.env.EMAIL_USER,
                            pass: process.env.EMAIL_PASS
                        }
                    });
                }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Thank you for contacting VHATrade',
            html: `
                <h2>Thank you for contacting VHATrade!</h2>
                <p>Dear ${userName},</p>
                <p>We have received your message and will get back to you within 24-48 hours.</p>
                <p>If you have any urgent inquiries, please call us at +1 (778) 682-7899.</p>
                <br>
                <p>Best regards,</p>
                <p>The VHATrade Team</p>
                <hr>
                <p><em>This is an automated confirmation email. Please do not reply to this message.</em></p>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Confirmation email sent:', info.messageId);
        return true;

    } catch (error) {
        console.error('Confirmation email error:', error);
        return false;
    }
}

app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/api/health`);
    console.log(`Contact form endpoint: http://localhost:${PORT}/api/contact`);
}); 