# Setup and publishing checklist

## A. Supabase setup
1. Create a Supabase project.
2. Open **Project Settings → API** and copy the Project URL and `anon` / publishable key.
3. Copy `.env.example` to `.env.local` and fill in those values.
4. Open **SQL Editor**, paste `supabase/schema.sql`, and run it.
5. Open **Authentication → Providers → Email** and keep email/password enabled.
6. Disable public sign-ups (Authentication settings).
7. Open **Authentication → Users → Add user** and create your private admin login.
8. Confirm Storage contains a public bucket named `certificates`.

## B. Local preview
```bash
npm install
npm run dev
```
Open `http://localhost:3000`.

## C. Publish on Vercel
1. Create a private GitHub repository and push the extracted project.
2. Import the repository in Vercel.
3. Add both Supabase environment variables in Vercel project settings.
4. Deploy and use the generated `https://....vercel.app` domain.
5. Test admin login and upload one non-sensitive sample certificate.

## D. Updating the content
- Certificate entries: use the Admin area at the bottom of the public site.
- Text content such as profile, education, publications, research topics, teaching and FDPs: edit `lib/content.ts` and redeploy.
- The admin interface is currently a functional certificate manager. A second development phase can add browser-based editing for every portfolio section.

## E. Before going public
- Add a professional headshot if desired.
- Verify the exact Ph.D. award wording and institution naming.
- Verify publication metadata and DOI links.
- Confirm current designation and institution-approved wording.
- Upload only certificates intended for public viewing.
- Keep home address, date of birth and personal phone number private.
