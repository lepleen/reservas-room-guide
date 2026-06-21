# Goal

Transform the current `/` route into a modern, premium one-page marketing website while preserving the existing reservation platform architecture.

The public landing page should communicate the value of the platform and guide users toward making a reservation.

Move the existing reservation gateway (External User / Internal User selection) to `/book`.

Do **not** create new reservation flows, duplicate forms, or modify existing business logic.

The reservation system must continue working exactly as it does today.

---

# Routing

## `/`

Create a public one-page marketing website containing the following sections:

- #home
- #about
- #spaces
- #faq
- #contact

This page becomes the public homepage.

---

## `/book`

Create `src/routes/book.tsx`.

Move the current reservation gateway from `src/routes/index.tsx` into this file.

This is a pure UI move.

Do not modify:

- reservation logic
- authentication
- permissions
- routing after role selection
- Supabase integration
- server functions

---

## Existing Routes

Keep every existing application route unchanged.

Examples:

- /dashboard
- /reservations/new
- /internal/dashboard
- /internal/reservations/new
- /auth
- /admin

---

# Public Navigation

Create a reusable `SiteHeader` component.

Navigation order:

- Home
- About
- Spaces
- FAQ
- Contact
- **Book a Space** (Primary CTA)

Behavior:

- On `/`, Home/About/Spaces/FAQ/Contact perform smooth scrolling.
- On `/book`, those same links navigate back to the landing page and scroll to the corresponding section.
- "Book a Space" always navigates to `/book`.

---

# Header Behavior

The navigation bar should:

- be sticky
- have a transparent background over the Hero section
- transition into a solid background after scrolling
- include a subtle backdrop blur
- reuse the project's existing Tailwind utilities
- avoid introducing any new design tokens

On mobile:

- reuse the existing Sheet component
- keep "Book a Space" visible as the primary CTA
- preserve the current responsive behavior

---

# Visual Consistency

Reuse the existing project design system.

Do not introduce:

- new colors
- new fonts
- new spacing scales
- new shadows
- new border radius
- new component libraries

Reuse:

- existing Button
- Card
- Accordion
- Sheet
- typography scale
- spacing utilities
- color tokens

The landing page should feel like a natural extension of the current application.

---

# Landing Page

Use semantic sections.

Wrap every section inside the existing container pattern.

Use reusable React components whenever possible.

---

## Hero (#home)

Do not use placeholder copy.

Use production-ready content.

Headline

Where Great Ideas Meet Great Spaces

Supporting text

Host meetings, conferences, workshops and corporate events through an intuitive reservation platform designed for collaboration and innovation.

Primary CTA

Book a Space

→ `/book`

Secondary CTA

Sign In

→ `/auth`

Use a premium corporate hero image.

No gradients or flashy effects.

---

## About (#about)

Populate with real marketing copy.

Explain that the platform centralizes corporate space reservations while providing a modern experience for organizing meetings, conferences, workshops and business events.

Highlight:

- Easy Reservations
- Professional Spaces
- Flexible Booking
- Business Collaboration
- Efficient Scheduling

Do not use lorem ipsum.

---

## Spaces (#spaces)

Reuse the existing Card component.

Display three featured space categories.

If a rooms table already exists in Supabase:

Load featured spaces dynamically.

Otherwise:

Display placeholder cards designed to be connected later without changing the component structure.

Each card should contain:

- image
- title
- short description
- capacity

Use realistic corporate photography placeholders.

Do not use illustrations.

Images should be easy to replace later.

---

## FAQ (#faq)

Reuse the existing Accordion component.

Populate with 4–5 realistic questions and answers.

Do not use placeholder text.

---

## Contact (#contact)

Create a simple information section.

Include placeholders for:

- Company Address
- Business Email
- Phone Number
- Business Hours

Include a primary "Book a Space" CTA.

Do not create a contact form.

---

# Footer

Create a complete footer.

Include:

- Company logo
- Quick Links
- Contact Information
- Privacy Policy
- Terms & Conditions
- Copyright
- Social Media placeholders

Reuse the existing visual language.

---

# Reservation Gateway (/book)

Render the same shared SiteHeader.

Below the header, display the existing role cards.

Update only the copy.

External User

Description

For visitors, clients, partners, or external organizations requesting a reservation.

Button

Continue as External User

Target

/dashboard

(unchanged)

---

Internal User

Description

For employees and internal staff creating reservations for meetings, events, or corporate activities.

Button

Continue as Internal User

Target

/internal/dashboard

(unchanged)

Do not modify:

- RoleCard styling
- authentication
- reservation forms
- server functions

---

# UX Improvements

Enable:

```css
html {
  scroll-behavior: smooth;
}

```

Add:

- scroll-margin-top for sections
- active navigation highlighting while scrolling
- sticky navigation
- subtle section entrance animations
- hover animations using existing utilities only

Do not introduce animation libraries.

---

# Accessibility

Implement:

- semantic landmarks
- ARIA labels
- keyboard navigation
- visible focus states
- Skip to Content link

Follow WCAG best practices.

---

# SEO

Configure:

- page title
- meta description
- Open Graph tags
- Twitter Card
- canonical URL

Use sensible placeholder values that can be edited later.

---

# Architecture

Create reusable components.

Avoid placing the entire landing page inside one large file.

Suggested structure:

- SiteHeader
- HeroSection
- AboutSection
- SpacesSection
- FAQSection
- ContactSection
- SiteFooter

Each component should remain independent and easy to extend.

---

# Files

Create or update:

- src/routes/index.tsx
- src/routes/book.tsx
- src/components/SiteHeader.tsx
- src/components/SiteFooter.tsx
- src/components/landing/*
- src/styles.css

---

# Future-Proof Requirements

Design the landing page so it can later consume dynamic content from Supabase without requiring structural changes.

Keep every section modular.

Avoid hardcoded layout assumptions.

The homepage should be easy to extend later with sections such as:

- Testimonials
- Partners
- Gallery
- Upcoming Events
- News
- Blog

---

# Out of Scope

Do not modify:

- reservation forms
- authentication
- Supabase schema
- server functions
- RLS
- reservation business logic
- dashboard pages
- admin pages
- existing APIs

The only architectural change is moving the current reservation gateway from `/` to `/book` while introducing a professional marketing homepage that fully matches the existing design system.