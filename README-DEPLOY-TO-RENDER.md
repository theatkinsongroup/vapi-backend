# Atkinson Group — Vapi Backend (Render Deployment Guide)

This backend powers the **“david” Vapi recruiting assistant** for The Atkinson Group. It handles:
- ✅ Appointment booking (Google Calendar)
- ✅ SMS confirmations (Twilio)
- ✅ Email + .ICS calendar invites (Office365)
- ✅ Safety/threat flagging
- ✅ Number blocking

---

## 1) Folder Structure (for reference)


---

## 2) Required Environment Variables (add in Render → Web Service → Environment)


**Important:**  
`GOOGLE_APPLICATION_CREDENTIALS_JSON` must contain the **entire JSON text**, not a file path.

---

## 3) Google Calendar Setup

1. Open the **ISA Appt Calendar** in Google Calendar
2. Go to: **Settings → Share with specific people**
3. Add your **Service Account Email**
4. Permission: **Make changes to events (Editor)**

---

## 4) Deploy to Render

1. Go to **https://render.com**
2. **New → Web Service**
3. Connect your `vapi-backend` GitHub repo
4. Use these settings:

| Setting | Value |
|---------|-------|
| Environment | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Auto Deploy | Yes |
| Region | US |
| Plan | Starter/Basic (recommended) |

5. Add all Environment Variables (from Section 2)
6. Click **Deploy**

Render will give you a public URL, e.g.:


---

## 5) Test the Backend (Verify Before Opening Vapi)

### ✅ Health Check
Visit in browser:
Expected:

### ✅ Booking Endpoint (/api/book)
Send (via Postman or curl):
```json
{
  "candidateName": "Test Agent",
  "phone": "+16025550123",
  "email": "agent@example.com",
  "requestedStartISO": "2025-10-22T17:15:00-07:00",
  "notes": "Pain: leads"
}
{
  "to": "+16025550123",
  "whenPHX": "Wed 5:15 PM",
  "confirmed": true
}
{
  "to": "agent@example.com",
  "startISO": "2025-10-23T00:15:00Z",
  "endISO": "2025-10-23T00:30:00Z",
  "subject": "Intro Call with Jim Atkinson (15 min)",
  "description": "Candidate: Test Agent"
}
