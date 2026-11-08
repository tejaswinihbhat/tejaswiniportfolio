# Dr. Tejaswini H — Academic Portfolio

A Next.js portfolio starter with a premium navy/white/gold visual system, responsive public website, Supabase-backed certificate gallery and private admin sign-in.

## Included
- Academic homepage, profile, education, appointments and research areas
- Selected journal and conference publications with DOI links
- Journal reviewing record and selected conference-review activity
- Teaching, academic service and FDP sections
- Certificate gallery with PDF/JPG/PNG upload, edit and delete
- Private admin login using Supabase Auth
- Responsive layout for desktop and mobile

## Requirements
- Node.js 18.17+ (20 LTS recommended)
- GitHub account
- Vercel account
- Supabase account

## Run locally
1. Extract the ZIP.
2. Open the project folder in VS Code.
3. Run `npm install`.
4. Copy `.env.example` to `.env.local`.
5. Add your Supabase project URL and anon/public key.
6. Run the SQL in `supabase/schema.sql` in Supabase SQL Editor.
7. In Supabase Authentication, create your own user under Users (do not enable public sign-up).
8. Run `npm run dev` and open http://localhost:3000.

## Deploy to Vercel
1. Push the project to a private GitHub repository.
2. In Vercel, select **Add New → Project** and import that repository.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` under Project Settings → Environment Variables.
4. Deploy. Vercel will provide a `*.vercel.app` address.
5. Test public pages, admin sign-in and certificate upload.

## Security notes
- Never put the Supabase `service_role` key in this project or in any `NEXT_PUBLIC_` variable.
- Disable public sign-ups in Supabase Auth. Create admin accounts manually.
- The anon key is designed to be public; Row Level Security policies protect database writes.
- The certificate bucket is public-read so visitors can view certificate documents. Do not upload documents containing private information, signatures, personal IDs or sensitive data.
- This starter currently implements live CRUD for certificates. Profile, publication and other academic sections are sourced from `lib/content.ts`; the next enhancement is to move these into editable Supabase tables.

## Content accuracy and privacy
The initial content is based on the supplied profile and known updates: Ph.D. completed in 2026 and In-charge Head of Department, AI & DS, from July 2026. Personal residential address, date of birth and personal phone number are intentionally omitted. Confirm all publication metadata, journal quartiles, review counts, event dates and institutional designations before publishing.


The public portfolio includes a dedicated **Professional Links** section for Email, ORCID, LinkedIn, Scopus, Web of Science ResearcherID, Google Scholar and DBLP.
