# Contact Form Email Delivery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the portfolio contact form deliver emails to `hello@svetoslav.dev` using Zoho Mail as the inbox and EmailJS as the SMTP relay.

**Architecture:** The React form at `src/pages/Contact.tsx` already calls `emailjs.send()` with the correct parameters — no code changes needed. The entire plan is configuration: create a Zoho Mail inbox, connect it to EmailJS via SMTP, create the template, then inject the three resulting keys as environment variables in both the local `.env` file and Vercel.

**Tech Stack:** Zoho Mail (free custom domain inbox), EmailJS (free SMTP relay, 200 emails/month), Vercel environment variables, Vite `import.meta.env`

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `.env` | Create (local only, gitignored) | Hold the three EmailJS keys for local dev |
| `.env.example` | Already correct | No changes needed |
| `src/pages/Contact.tsx` | No changes | Already fully implemented |

---

### Task 1: Create local `.env` file

**Files:**
- Create: `.env` (in project root, never committed — already in `.gitignore`)

- [ ] **Step 1: Verify `.env` is gitignored**

  Open `.gitignore` and confirm `.env` is listed. It is — confirmed in project setup.

- [ ] **Step 2: Create `.env` in the project root**

  ```bash
  # .env  (fill in real values after completing Tasks 2 and 3)
  VITE_EMAILJS_SERVICE_ID=PLACEHOLDER
  VITE_EMAILJS_TEMPLATE_ID=PLACEHOLDER
  VITE_EMAILJS_PUBLIC_KEY=PLACEHOLDER
  ```

  Leave as `PLACEHOLDER` for now — you will replace these after Zoho and EmailJS are configured.

- [ ] **Step 3: Confirm Vite picks up the file**

  ```bash
  npm run dev
  ```

  Open the browser console on the `/contact` page and submit the form with the placeholder values. You should see:
  ```
  EmailJS env vars are not configured.
  ```
  This confirms Vite is reading the file (the guard in `Contact.tsx` line 38 fires because the values are not real IDs yet). If you see this error toast, the file is wired correctly.

---

### Task 2: Set up Zoho Mail with `svetoslav.dev`

**Where:** [zoho.com/mail](https://www.zoho.com/mail/) — do this in your browser, not the terminal.

- [ ] **Step 1: Create a Zoho Mail account**

  Go to [zoho.com/mail](https://www.zoho.com/mail/), click **Get Started**, and choose the **Forever Free** plan (1 user, 5 GB). Sign up with a personal email — this becomes your Zoho admin account.

- [ ] **Step 2: Add your custom domain**

  During onboarding, choose **Add an existing domain** and enter `svetoslav.dev`.

- [ ] **Step 3: Verify domain ownership via TXT record**

  Zoho will show you a TXT record like:
  ```
  Type:  TXT
  Host:  @ (or svetoslav.dev)
  Value: zoho-verification=zb12345678.zmverify.zoho.eu
  TTL:   3600
  ```
  Add this record in your domain registrar's DNS panel (or in Vercel DNS if your domain is managed there: Vercel Dashboard → `svetoslav.dev` → DNS). Click **Verify** in Zoho after adding. DNS can take a few minutes to propagate — use [dnschecker.org](https://dnschecker.org) to confirm the TXT record is live if Zoho says verification failed.

- [ ] **Step 4: Add MX records**

  Zoho will provide two MX records. Add both to your DNS:
  ```
  Type:     MX
  Host:     @
  Value:    mx.zoho.eu       Priority: 10

  Type:     MX
  Host:     @
  Value:    mx2.zoho.eu      Priority: 20

  Type:     MX
  Host:     @
  Value:    mx3.zoho.eu      Priority: 50
  ```
  (Use `zoho.com` variants instead of `zoho.eu` if Zoho shows US hostnames during your signup.)

- [ ] **Step 5: Add SPF record**

  ```
  Type:   TXT
  Host:   @
  Value:  v=spf1 include:zoho.eu ~all
  TTL:    3600
  ```
  Use `zoho.com` instead of `zoho.eu` if your account is US-based.

- [ ] **Step 6: Add DKIM record**

  In Zoho Mail admin panel → **Domains → DKIM** → click **Generate** next to `svetoslav.dev`. Zoho will show a TXT record like:
  ```
  Type:   TXT
  Host:   zoho._domainkey.svetoslav.dev
  Value:  v=DKIM1; k=rsa; p=MIGfMA0GCSqGS...
  TTL:    3600
  ```
  Add this to your DNS exactly as shown.

- [ ] **Step 7: Create the `hello@svetoslav.dev` mailbox**

  In Zoho Mail admin → **User Details → Add User**:
  - First name: `Hello`
  - Email: `hello@svetoslav.dev`
  - Set a password you'll remember

- [ ] **Step 8: Generate an App Password for EmailJS**

  Log into Zoho Mail as `hello@svetoslav.dev` → top-right avatar → **My Account → Security → App Passwords → Generate New**.
  - Label: `EmailJS`
  - Click **Generate** and **copy the password immediately** — it is shown only once.
  - Save it somewhere safe (e.g., a password manager) until Task 3.

---

### Task 3: Set up EmailJS and create the email template

**Where:** [emailjs.com](https://www.emailjs.com/) — do this in your browser.

- [ ] **Step 1: Create a free EmailJS account**

  Go to [emailjs.com](https://www.emailjs.com/), click **Sign Up Free**, and create an account.

- [ ] **Step 2: Add an Email Service**

  In the EmailJS dashboard → **Email Services → Add New Service → SMTP**.

  Fill in:
  ```
  Name:      Zoho Mail
  Host:      smtp.zoho.eu        (or smtp.zoho.com if US account)
  Port:      587
  Security:  TLS
  Username:  hello@svetoslav.dev
  Password:  [the App Password from Task 2 Step 8]
  ```

  Click **Test** — you should see a success response. Then click **Save**.

  Copy the **Service ID** (looks like `service_xxxxxxx`) — you'll need it in Task 4.

- [ ] **Step 3: Create an Email Template**

  In the EmailJS dashboard → **Email Templates → Create New Template**.

  Set the template fields exactly as follows:
  ```
  To email:   hello@svetoslav.dev
  From name:  {{from_name}}
  Reply To:   {{from_email}}
  Subject:    New message from {{from_name}} — svetoslav.dev
  ```

  Body:
  ```
  You have a new message from your portfolio contact form.

  Name:    {{from_name}}
  Email:   {{from_email}}

  Message:
  {{message}}
  ```

  Click **Save**. Copy the **Template ID** (looks like `template_xxxxxxx`).

- [ ] **Step 4: Copy your Public Key**

  In the EmailJS dashboard → top-right avatar → **Account → API Keys**.

  Copy the **Public Key** (looks like a 10-character alphanumeric string).

---

### Task 4: Wire up the environment variables

**Files:**
- Modify: `.env` (local)
- Modify: Vercel project settings (browser)

- [ ] **Step 1: Update local `.env`**

  Replace the placeholders from Task 1 with the real values:
  ```
  VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
  VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
  VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxx
  ```

- [ ] **Step 2: Add env vars to Vercel**

  In the Vercel dashboard → `svetoslav.dev` project → **Settings → Environment Variables**.

  Add each of the three variables above. Set scope to **Production** and **Preview**.

- [ ] **Step 3: Trigger a Vercel redeploy**

  In Vercel → **Deployments** → click the three-dot menu on the latest production deployment → **Redeploy**. Wait for the build to complete (usually under 60 seconds).

---

### Task 5: End-to-end test

- [ ] **Step 1: Test locally**

  ```bash
  npm run dev
  ```

  Navigate to `http://localhost:5173/contact`. Fill in:
  ```
  Name:    Test User
  Email:   your-personal@email.com
  Message: This is a local test.
  ```

  Submit the form. You should see the success toast (`t.toasts.successTitle`).

  Check `hello@svetoslav.dev` in Zoho Mail — the email should arrive within seconds.

- [ ] **Step 2: Verify Reply-To header**

  In Zoho Mail, open the test email and click **Reply**. Confirm the reply address auto-fills as `your-personal@email.com` (the address you entered in the form), not `hello@svetoslav.dev`.

- [ ] **Step 3: Test on production**

  Open `https://svetoslav.dev/contact` in a browser (incognito to avoid any local env leaking). Submit another test message. Confirm it arrives in `hello@svetoslav.dev`.

- [ ] **Step 4: Test validation error paths**

  Submit the form with:
  - All fields empty → should show the missing-fields error toast
  - Invalid email format (e.g. `notanemail`) → should show the invalid-email error toast

  No email should be sent for these cases.

- [ ] **Step 5: Commit the updated `.env.example` if needed**

  `.env.example` is already correct — no changes needed. Skip this step.

---

## Troubleshooting Reference

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Success toast but no email received | DNS MX records not propagated yet | Wait and retry; check propagation at dnschecker.org |
| EmailJS SMTP test fails | Wrong host (EU vs US) or wrong App Password | Double-check host and regenerate App Password |
| Zoho domain verification fails | TXT record not propagated | Wait 10–30 min, recheck at dnschecker.org |
| Error toast on submit in production | Env vars not saved or redeploy not triggered | Check Vercel env vars and redeploy |
| Reply goes to `hello@svetoslav.dev` instead of sender | Reply-To not set in EmailJS template | Set Reply-To to `{{from_email}}` in the template |
