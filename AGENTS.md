<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
# Travingat Project Context & Guidelines

Welcome to the **Travingat** project repository.
When working on this project, please adhere to the following project-specific guidelines, architectural patterns, and design constraints.

## Tech Stack

- **Framework:** Next.js (App Router)
- **UI/Components:** React
- **Styling:** Tailwind CSS (using standard utility classes, note the use of modern classes like `bg-linear-to-r` which replaced `bg-gradient-to-r` in v4 if used, and native `aspect-ratio` support).

## Design & Layout Strictness

- **Figma Fidelity:** This project enforces **pixel-perfect** implementations based on Figma designs. Never eyeball dimensions, margins, or padding. If the Figma design calls for a specific gap or padding (e.g., `pt-[48px]` or `gap-[40px]`), use those precise Tailwind arbitrary values instead of defaulting to standard sizes unless they map perfectly to the tailwind config.
- **Baseline Matching:** Pay very close attention to flexbox alignments (such as `items-stretch`, `items-end`). Often, elements need to strictly share top or bottom baselines, which requires careful layout strategies rather than just hacking padding.
- **Responsive Handling (Component Isolation):** If a specific layout (like a complex desktop hero section) requires exact fixed dimensions that would break or become too complex when mixed with mobile responsive classes (e.g., `lg:` vs base classes), **isolate the desktop view into its own component** (e.g., `ProfileDesktopHero.tsx`). This allows the desktop view to remain 100% constant and locked to its pixel-perfect dimensions, while the mobile view can be handled independently without layout collisions.

## Key Components & UI

- **Images:** Do NOT use standard HTML `<img>` tags or raw Next.js `<Image>` tags for general application images if a custom wrapper is preferred. Always use the project's custom `<LoadedImage />` component (found at `@/components/ui/LoadedImage`) for handling image loading states, skeletons, and icons seamlessly.
- **Asset Paths:** Use the available utility functions like `toLandingAssetUrl` (from `@/lib/landing-assets`) and `toFlagAssetPath` (from `../utils`) to resolve image and media paths properly.

## Workflow Rules

- **Component Splitting:** The main application pages can become quite large. Proactively split complex nested UI blocks into separate React components to maintain readability and avoid 1000+ line files.
- **Preserve Behavior:** When fixing one breakpoint (e.g., desktop), always double-check that you haven't accidentally overridden or broken the mobile layout. Utilize the isolation strategy mentioned above to prevent this.

By following these guidelines, you will ensure a robust, maintainable, and visually flawless application that stays true to its original design intent.

## Codebase Architecture & Key Technologies

Travingat is a modern full-stack web application built using the Next.js App Router.

- **Frontend/Framework:** Next.js 16.1 (App Router), React 19, Server Components & Client Components.
- **Styling:** Tailwind CSS v4 (using the new `@tailwindcss/postcss` setup).
- **Database:** PostgreSQL hosted on Neon (using `@neondatabase/serverless` for serverless edge connections).
- **Storage/Assets:** Cloudflare R2 / AWS S3 (`@aws-sdk/client-s3`). Asset uploads generate pre-signed URLs on the server, and clients upload directly to R2. Sharp and `browser-image-compression` are used for image processing.
- **Emails:** Nodemailer handles waitlist confirmations and other email delivery.

## Directory Structure Overview

The codebase is primarily structured inside the `src/` directory:

- **`src/app/`**: Contains all Next.js App Router routes and pages.
  - `(public routes)`: `/blog`, `/pricing`, `/profiles/[id]`, `/templates`, `/featured-profiles`, `/waitlist`.
  - `/admin`: The internal CMS and dashboard for managing users, profiles, blogs, testimonials, and the waitlist.
  - `/api`: Backend REST routes handling operations like R2 upload presigning (`/api/upload/presign`), waitlist processing, and admin endpoints.
- **`src/features/`**: Contains domain-specific business logic, components, and data isolated by feature area.
  - `/profilepages`: The core feature of Travingat. Contains the `ProfileComponent`, `CountryDetailComponent`, and the `ProfileDesktopHero` to render a user's travel profile.
  - `/featured-profiles`: Logic for the featured user carousel.
- **`src/components/`**: Reusable generic UI components.
  - `/ui`: Contains atomic components (e.g., `<LoadedImage />`, `<WaitlistPopup />`, `<MoreOptionsButton />`).
  - `/sections` & `/layout`: Reusable layout sections (Header, Footer, Parallax).
- **`src/lib/`**: Core utilities, database connections, and integrations.
  - `db.ts`: Neon database connection configuration.
  - `r2-upload.ts` & `image-compress.ts`: Cloudflare R2 bucket connection and image processing scripts.
  - `waitlist-email.ts`: Nodemailer configuration for emails.
  - `landing-assets.ts`: Utilities for resolving asset paths (e.g., `toLandingAssetUrl`).

## Data Flow & Architecture Patterns

1. **Routing:** We exclusively use the Next.js App Router. Pages are Server Components by default unless interactivity is needed, in which case `"use client"` is applied to the specific component.
2. **Database Access:** Database queries to Neon are handled either in `/api` route handlers or directly inside Server Components/Server Actions.
3. **Asset Management:** Images (like avatars and cover photos) are typically stored in R2. URLs to these assets are usually resolved using `toLandingAssetUrl` before being passed to `<LoadedImage />`.

## Admin & CMS

The application includes a fully featured custom CMS located at `src/app/admin`. It handles authentication (`/api/admin/session`) and provides a GUI to modify database records for Blogs, Profiles, Testimonials, and Users without writing raw SQL.
