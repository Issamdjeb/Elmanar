# Elmanar

Elmanar helps teachers turn lessons into reviewed quizzes, gives students private spaces to learn and see explanations, and connects families to useful progress summaries. Separate teacher, student, and parent accounts include light and dark themes, student education profiles, and quizzes tailored to a selected stage, year, and subject/module.

## Run locally

Requires Node.js 20.12 or later. The app is intentionally dependency-free; its live front end is `app.js` and `styles.css`, served by `server.mjs`.

```sh
npm start
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). Each person creates a separate teacher, student, or parent account. Students select a stage (Primary 1–5, Middle 1–4, Secondary 1–3, or University 1–8), year, and one or more subjects/modules (comma-separated); these details can be updated in the student portal and personalize teacher-generated quiz content and recommendations. Supabase Auth owns account registration, email confirmation, and password sign-in. The Supabase access/refresh session is saved in the browser's project-scoped local storage key; passwords are never stored by Elmanar. Quiz data and role links remain account-scoped in `.data/elmanar.json`.

### Configure Supabase Auth

Add these project values to the private `.env` file. The publishable key is intended for application use; never add the Supabase secret/service-role key to this app, browser storage, or Git.

```dotenv
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_your-public-key
SUPABASE_SITE_URL=http://127.0.0.1:3000
```

In the Supabase dashboard, keep **Email** enabled and allow email confirmation. Under **Authentication → URL Configuration**, set the local Site URL to `http://127.0.0.1:3000` and add `http://127.0.0.1:3000/**` to the Redirect URLs. Add `http://localhost:3000/**` too if you open Elmanar with `localhost`. Save those dashboard settings and restart Elmanar after changing `.env`. Sign-up displays a confirmation screen and the email link returns to Elmanar; sign-in and session refresh use Supabase Auth.

The **Continue with Google** button is deliberately a labeled prototype. It does not claim to authenticate until Google OAuth is enabled and configured in Supabase.

## Enable AI quiz generation

Copy `.env.example` to `.env`, then set your OpenRouter API key in the local `.env` file:

```dotenv
OPENROUTER_API_KEY=your-key
OPENROUTER_MODEL=openai/gpt-4.1
PORT=3000
```

Restart the server. The key stays server-side. The AI returns a structured quiz that the teacher can edit before publishing. Without a key, teachers can still explore the hand-crafted sample quiz. Keep `.env` private; it is excluded from Git.

## Try the classroom flow

1. Create a **Teacher** account. Paste a lesson or load the sample, generate a quiz, and edit the questions and answers.
2. Publish the quiz and share its private class code.
3. Create a separate **Student** account, enter the class code, and take the quiz. Students can review their score and explanations.
4. In the student portal, copy the private family code. Create a **Parent** account and use that code to connect to the student.
5. The family portal shows the linked learner’s topic-level progress and a supportive suggestion, not their selected answers.

## Tests

Run the mocked Supabase account, email-confirmation, refresh, learning-profile, quiz matching, sharing, privacy, and static-asset integration tests with:

```sh
npm test
```

Run JavaScript syntax checks with `npm run check`.

This project is a local MVP, not a production-ready service for real student data. Before public deployment, add operational protections such as HTTPS, rate limiting, secure account recovery, backups, and a production database. Rotate any API key that has previously been shared in chat and store only replacement public keys in the private `.env` file.