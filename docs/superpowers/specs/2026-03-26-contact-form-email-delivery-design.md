# Contact Form Email Delivery — Design Spec

**Date:** 2026-03-26
**Status:** Approved
**Stack:** Zoho Mail (custom domain inbox) + EmailJS (form relay)
**Deployment:** Vercel at svetoslav.dev

---

## Problem

The contact form in `src/pages/Contact.tsx` is fully implemented and already calls
EmailJS, but the three required environment variables are missing. Form submissions
silently fail in both development and production.

---

## Scope

No React or TypeScript changes are required. The work is entirely configuration:

1. Create a `hello@svetoslav.dev` mailbox via Zoho Mail (free tier).
2. Connect that mailbox to EmailJS via SMTP.
3. Create an EmailJS template matching the variables the code already sends.
4. Add the three env vars locally (`.env`) and on Vercel.

---

## Architecture

```
User fills form
      │
      ▼
Contact.tsx (browser)
  emailjs.send(serviceId, templateId, { from_name, from_email, message }, { publicKey })
      │
      ▼
EmailJS servers
  SMTP → smtp.zoho.eu:587
      │
      ▼
hello@svetoslav.dev  (Zoho Mail inbox)
```

No backend or serverless function is involved. EmailJS acts as the SMTP relay,
authenticated with an App Password issued by Zoho.

---

## EmailJS Template

Create a template in the EmailJS dashboard with the following mapping.
Variable names must match exactly — the code passes them as-is.

| Template variable | Source         | Description              |
|-------------------|----------------|--------------------------|
| `{{from_name}}`   | `form.name`    | Sender's full name       |
| `{{from_email}}`  | `form.email`   | Sender's email address   |
| `{{message}}`     | `form.message` | Message body             |

**Suggested subject:** `New message from {{from_name}} — svetoslav.dev`
**To:** `hello@svetoslav.dev`
**Reply-To:** `{{from_email}}` (set this so you can reply directly to the sender)

---

## Environment Variables

### Local development — `.env` (gitignored, never committed)

```
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxx
```

### Vercel production

Add under **Project → Settings → Environment Variables** (scope: Production + Preview):

| Key                        | Value source              |
|----------------------------|---------------------------|
| `VITE_EMAILJS_SERVICE_ID`  | EmailJS dashboard         |
| `VITE_EMAILJS_TEMPLATE_ID` | EmailJS dashboard         |
| `VITE_EMAILJS_PUBLIC_KEY`  | EmailJS dashboard (Account → API Keys) |

Trigger a redeploy after saving.

---

## Manual Setup Steps

### Step 1 — Zoho Mail

1. Go to [zoho.com/mail](https://www.zoho.com/mail/) and sign up for the **Free** plan.
2. Choose **Add an existing domain** and enter `svetoslav.dev`.
3. Verify domain ownership by adding the TXT record Zoho provides to your DNS
   (your domain registrar or Vercel DNS panel).
4. Add Zoho's **MX records** to your DNS. Zoho shows the exact values during setup.
5. Add the **SPF record** (`v=spf1 include:zoho.eu ~all` for EU, or `zoho.com` for US).
6. Add the **DKIM record** that Zoho generates (a TXT record under a `_domainkey` subdomain).
7. Create the mailbox: username `hello`, domain `svetoslav.dev`.
8. In Zoho Mail settings, generate an **App Password**:
   - Account → Security → App Passwords → Generate new
   - Label it "EmailJS" and copy the password (shown only once).

> DNS changes can take a few minutes to a few hours to propagate.

### Step 2 — EmailJS

1. Create a free account at [emailjs.com](https://www.emailjs.com/).
2. Go to **Email Services → Add New Service → SMTP**.
3. Fill in the SMTP settings:
   - **Host:** `smtp.zoho.eu` (if your Zoho account is EU) or `smtp.zoho.com` (US)
   - **Port:** `587`
   - **Security:** TLS
   - **Username:** `hello@svetoslav.dev`
   - **Password:** the App Password from Step 1
4. Click **Test** to confirm the connection, then save. Note the **Service ID**.
5. Go to **Email Templates → Create New Template**.
6. Set subject, To, Reply-To, and body using the variables in the table above.
7. Save the template and note the **Template ID**.
8. Go to **Account → API Keys** and copy your **Public Key**.

### Step 3 — Vercel

1. Open the Vercel dashboard → `svetoslav.dev` project → **Settings → Environment Variables**.
2. Add the three variables from the table above.
3. Go to **Deployments** and trigger a **Redeploy** on the latest production deployment.

---

## Free Tier Limits

| Service  | Free limit             | Expected usage      |
|----------|------------------------|---------------------|
| Zoho Mail | 1 user, 5 GB storage  | Well within limits  |
| EmailJS   | 200 emails/month       | Well within limits for a portfolio |

---

## Testing

After the Vercel redeploy:

1. Open `https://svetoslav.dev/contact`.
2. Fill in the form with a real name, email, and message.
3. Submit — you should see the success toast.
4. Check `hello@svetoslav.dev` in Zoho Mail for the incoming email.
5. Verify the Reply-To header points to the address you entered in the form.
