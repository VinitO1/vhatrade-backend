# VHATrade Backend - Contact Form API

This backend provides a complete contact form solution with email notifications and data storage.

## Features

- ✅ **Contact Form API** - POST `/api/contact`
- ✅ **Form Validation** - Input sanitization and validation
- ✅ **Email Notifications** - Admin notifications and user confirmations
- ✅ **Data Storage** - Supabase database integration
- ✅ **Error Handling** - Comprehensive error management
- ✅ **Security** - Input validation and sanitization

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy `env.example` to `.env` and configure:

```bash
# Server Configuration
PORT=4000

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Email Configuration (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
ADMIN_EMAIL=contact@vhatrade.ca
```

### 3. Gmail App Password Setup

For Gmail, you need to generate an App Password:

1. Go to [Google Account settings](https://myaccount.google.com/)
2. Enable 2-factor authentication
3. Go to Security → App passwords
4. Generate password for "Mail"
5. Use that password in `EMAIL_PASS`

### 4. Supabase Database Setup

Run the SQL script in `supabase-contacts-table.sql` in your Supabase SQL editor:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-contacts-table.sql`
4. Execute the script

### 5. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### POST `/api/contact`

Submit a contact form.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "ABC Company",
  "phone": "+1234567890",
  "subject": "Import Inquiry",
  "message": "I would like to discuss importing products..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contact form submitted successfully!",
  "data": {
    "contactId": "uuid-here",
    "emailSent": true,
    "confirmationSent": true
  }
}
```

## Email Templates

### Admin Notification Email
- Sent to admin when form is submitted
- Includes all form data
- Professional HTML formatting

### User Confirmation Email
- Sent to user after successful submission
- Confirms receipt of message
- Provides business hours and contact info

## Validation Rules

- **Name**: 2-100 characters
- **Email**: Valid email format
- **Subject**: 5-200 characters
- **Message**: 10-1000 characters
- **Company**: Optional, max 100 characters
- **Phone**: Optional, max 20 characters

## Error Handling

- Input validation errors (400)
- Database errors (500)
- Email sending errors (logged, doesn't fail submission)
- Network errors (500)

## Security Features

- Input sanitization and validation
- CORS enabled
- Rate limiting (can be added)
- SQL injection protection via Supabase

## Testing

Test the API with:

```bash
curl -X POST http://localhost:4000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Message",
    "message": "This is a test message"
  }'
```

## Troubleshooting

### Email Not Sending
- Check Gmail app password
- Verify environment variables
- Check Gmail account settings

### Database Connection Issues
- Verify Supabase credentials
- Check network connectivity
- Ensure table exists

### CORS Issues
- Verify frontend URL in CORS settings
- Check browser console for errors
