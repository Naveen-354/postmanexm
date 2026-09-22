# APIFlow

APIFlow is a modern, cloud-native API Testing & Request History platform. Built to be a highly scalable and free alternative to traditional API clients, it provides an intuitive, high-density interface for managing API requests, viewing history, and collaborating via workspaces.

## Features

- **Workspaces & Collections**: Organize your API requests logically.
- **Request Editor**: Highly functional interface for configuring Methods, URLs, Query Parameters, Headers, and JSON Payloads.
- **Monaco Editor**: First-class JSON body editing with syntax highlighting.
- **Cloud Proxy Execution**: Execute API requests securely through Next.js server-side API routes, bypassing restrictive client-side CORS issues.
- **History Tracking**: Automatically keeps a log of every executed request (including the response payload and timing).
- **Dark/Light Mode**: Toggleable themes via Next Themes.
- **Command Palette**: Quick navigation and theme switching via `Ctrl + K`.
- **Database**: Fully backed by Supabase PostgreSQL with strict Row Level Security (RLS) policies.

## Tech Stack

- **Framework**: [Next.js 15 App Router](https://nextjs.org/)
- **UI Components**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Code Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)

## Getting Started

### 1. Set up Supabase
1. Create a new Supabase project.
2. Run the SQL files located in `supabase/migrations/` in your Supabase SQL editor to create the necessary tables and RLS policies.
3. Obtain your Project URL and Anon Key.

### 2. Environment Variables
Copy `.env.example` to `.env.local` and fill in your Supabase details:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Install & Run
```bash
npm install
npm run dev
```
Navigate to `http://localhost:3000`.

## Deployment

This platform is architected to run perfectly on the free tiers of Vercel and Supabase.

1. Push your code to GitHub.
2. Create a new project on Vercel and connect your repository.
3. Add the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` Environment Variables in the Vercel dashboard.
4. Deploy!

## Security

- **Server-Side Execution**: Requests are executed server-side to prevent exposing secrets on the client and to bypass CORS.
- **Response Size Limits**: The API proxy limits responses to 5MB to prevent memory exhaustion from massive payloads.
- **Timeouts**: Requests have a hard timeout of 30s.
- **Row Level Security (RLS)**: Users can only see and interact with workspaces and requests that belong to them.
