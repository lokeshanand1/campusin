# Campus Career India — Landing Page Prototype

This is a responsive HTML/CSS/JS prototype for the **Campus Career India** landing page.

It is designed to:

- Convert Indian college students and recent graduates into qualified leads
- Explain services quickly and clearly
- Make sign-up frictionless with simple forms and strong CTAs
- Enable analytics tracking and CRM integration via webhooks

## Tech stack

- **HTML5**: semantic structure and SEO meta
- **CSS3**: custom, mobile-first responsive layout
- **Vanilla JS**: form validation, modal handling, testimonial slider, analytics hooks, and webhook submission

No build tools or bundlers are required.

## Getting started (local)

1. **Clone or copy** this folder.
2. From the `campusin` directory, open `index.html` in a browser:
   - On macOS (from Finder): right-click `index.html` → “Open With” → a browser.
   - Or run a simple static server from this directory:

   ```bash
   cd /Users/lokeshanand/campusin
   python -m http.server 5500
   ```

3. Navigate to `http://localhost:5500` in your browser.

## Deployment

You can deploy this as a static site using any static hosting:

- **GitHub Pages**
- **Vercel / Netlify** (as a static project)
- **AWS S3 + CloudFront**
- **Firebase Hosting**

Basic steps:

1. Put all files (`index.html`, `styles.css`, `app.js`) in the project root.
2. Push to a repository or connect your hosting provider.
3. Set the project as a static site with `index.html` as the entrypoint.

## Forms & webhooks

There are three key lead forms:

- **Apply for Job** (`#apply-job-form`)
- **Study Abroad** (`#study-abroad-form`)
- **Career Counselling** (modal form in the counselling modal)

All 3 forms:

- Collect minimal fields: `fullName`, `email`, `phone`, `college`, `degreeYear`, `timeline`, `message (optional)`.
- Include hidden fields: `preferredService`, `utmSource`, `landingPageId`, and UTM fields populated from the URL (`utm_source`, `utm_medium`, `utm_campaign`).
- Are validated on the client for required fields, email and phone formats.
- Submit JSON to a configurable webhook (e.g. Zapier) and trigger analytics events.

### Webhook URL

In `app.js`, set your Zapier or backend endpoint:

```js
window.CAMPUS_CAREER_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/your-zap-id-here";
```

Alternatively, replace the default URL inside `submitLeadForm`.

### Payload structure

Submitted JSON will look like:

```json
{
  "fullName": "Aisha Khan",
  "email": "aisha@example.com",
  "phone": "+91 98765 43210",
  "college": "ABC Institute of Technology",
  "degreeYear": "B.Tech CSE, 2025",
  "timeline": "Next 3 months",
  "message": "Targeting SDE roles in Bangalore",
  "preferredService": "Apply for Job",
  "utmSource": "instagram",
  "utmMedium": "cpc",
  "utmCampaign": "final-year-placement-2026",
  "utmCampaignId": "",
  "landingPageId": "campus-career-india-main"
}
```

Map these fields into your CRM via Zapier or your backend.

## Analytics & tracking

The script in `app.js` is wired for:

- **Google Analytics 4**: via `gtag('event', 'lead_submitted', ...)`
- **Google Tag Manager**: via `dataLayer.push({ event: 'leadSubmitted', ... })`
- Optional placeholders for:
  - **Facebook Pixel**: `fbq('track', 'Lead', { content_name: service })`
  - **LinkedIn Insight**: `lintrk('track', { conversion_id: 'LEAD_SUBMITTED' })`

### To enable GA / GTM

1. Add your GA4 or GTM snippet in the `<head>` of `index.html`.
2. Ensure `gtag` or `dataLayer` is defined before `app.js` runs.
3. Use your preferred naming for events; here we use:
   - `lead_submitted` (GA4)
   - `leadSubmitted` (GTM custom event)

## Sample copy

Key copy is already baked into the page:

- **Hero headline**: “Launch Your Career — Jobs, Study Abroad & Career Counselling”
- **Hero subhead**: “From resume to interview, from applications to visas — Campus Career India guides students every step of the way.”
- **Service cards** include:
  - Apply for Job: “Resume review • Interview coaching • Campus & off-campus placements”
  - Study Abroad: “University shortlisting • SOP/LOI support • Visa guidance & pre-departure prep”
  - Counselling: “Career mapping • Aptitude assessment • Mock interviews & mentorship”
- **Testimonials**: 3 sample stories including the provided template line.
- **FAQ**: 5 questions covering timelines, process duration, refund policy, counsellor credentials, and interview prep.

You can adjust all copy directly in `index.html`.

## Example transactional email & WhatsApp templates

**Email (on form success)**

Subject: `We got your request — Campus Career India`

Body:

> Hi \[Name], thanks for reaching out. We’ve received your request for \[Service].  
> Our team will contact you via phone/WhatsApp within 24 hours.  
> Meanwhile, here’s a quick checklist to prepare:  
> 1) Updated resume  
> 2) Academic transcripts  
> 3) Preferred timelines.

**WhatsApp message**

> Hi \[Name], thanks for contacting *Campus Career India* about \[Service].  
> We’ve received your details and will get back to you within 24 hours with next steps.  
> To speed things up, please keep your updated resume and academic transcripts handy.

## SEO & meta

- **Title**: `Campus Career India — Jobs, Study Abroad & Career Counselling`
- **Meta description**: defined in the `<head>` of `index.html`.
- **H1**: same as the hero headline.
- **Structured data**: `Organization` + `LocalBusiness` JSON‑LD is included for better visibility.

## Accessibility & performance

- WCAG-conscious: semantic headings, labelled forms, `aria-live` regions for form feedback, focus styles.
- Designed for good contrast (navy + orange on light backgrounds).
- No large libraries; just one small JS file.
- To further optimize:
  - Convert real hero/illustration images to **WebP**.
  - Use `loading="lazy"` on below-the-fold images (when you add them).
  - Minify `styles.css` and `app.js` for production.

## Post-launch conversion checklist

- **Tracking**
  - **[ ]** GA4 or GTM installed and verified.
  - **[ ]** Custom events for `lead_submitted` and `leadSubmitted` firing on all three lead forms.
  - **[ ]** Goals/conversions configured in GA / ad platforms (Meta, LinkedIn).
- **Funnels**
  - **[ ]** UTM-tagged campaigns for each channel (Instagram, LinkedIn, college partners, email).
  - **[ ]** Dashboards showing leads by service (Job / Study Abroad / Counselling).
- **CRM integration**
  - **[ ]** Zapier or backend webhook correctly receiving JSON from all forms.
  - **[ ]** Automatic contact and deal creation in your CRM for each submission.
  - **[ ]** Auto-tagging of contacts by `preferredService`, `utmSource`, and `landingPageId`.
- **Operations**
  - **[ ]** Confirmation email and WhatsApp templates saved in your email/WhatsApp provider.
  - **[ ]** Clear internal SLA (e.g. “respond within 12–24 hours”).
  - **[ ]** Weekly review of conversion rates and top sources.

