# Ranking-Frontend

Frontend web application built with **React**, **Vite**, **TypeScript**, **TailwindCSS**, and **shadcn/ui**.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running in Development](#running-in-development)
- [Production Build](#production-build)
- [Environment Variables](#environment-variables)
- [Code Conventions](#code-conventions)
- [Deployment](#deployment)

## Tech Stack

- **React 18** — UI library
- **Vite** — Fast build tool with HMR
- **TypeScript** — Static typing
- **TailwindCSS** — Utility-first CSS framework
- **shadcn/ui** — Accessible UI components (add as needed)
- **React Router** — Client-side routing
- **ESLint + Prettier** — Code quality and formatting

## Project Structure

```
Ranking-Frontend/
├── public/                 # Static assets served as-is
│   └── favicon.svg
├── src/
│   ├── assets/             # Images, fonts, etc. imported in code
│   ├── components/         # Reusable components
│   │   └── ui/             # shadcn/ui components
│   ├── pages/              # Application pages / screens
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities, helpers, API clients
│   ├── services/           # API calls / business logic
│   ├── types/              # Shared TypeScript definitions
│   ├── styles/             # Global styles (Tailwind)
│   │   └── globals.css
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Entry point
│   └── vite-env.d.ts
├── .env.example            # Example environment variables
├── .eslintrc.cjs           # ESLint configuration
├── .gitignore
├── .prettierrc             # Prettier configuration
├── index.html              # Root HTML template
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

## Prerequisites

- **Node.js** >= 18.0.0 (recommended: 20.x LTS)
- **npm** >= 9 (or **pnpm** / **yarn**)
- An editor with TypeScript support (VS Code recommended)

Check installed versions:

```bash
node --version
npm --version
```

## Installation

1. Clone the repository:

```bash
git clone <repo-url>
cd Ranking-Frontend
```

2. Install dependencies:

```bash
npm install
```

3. Copy the environment file:

```bash
cp .env.example .env
```

Then adjust the values in `.env` (notably `VITE_API_URL`).

## Running in Development

```bash
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173).

The dev server provides **Hot Module Replacement**: any code change is reflected instantly.

## Production Build

```bash
npm run build
```

Optimized files are generated in the `dist/` folder.

To preview the build locally:

```bash
npm run preview
```

## Environment Variables

Variables must be prefixed with `VITE_` to be accessible on the client side.

Example (`.env`):

```
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Ranking
```

Usage in code:

```ts
const apiUrl = import.meta.env.VITE_API_URL;
```

## Code Conventions

- **Components**: PascalCase (`UserCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`useAuth.ts`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Types/Interfaces**: PascalCase (`User`, `ApiResponse`)

Useful commands:

```bash
npm run lint        # Lint the code with ESLint
npm run format      # Format the code with Prettier
npm run type-check  # Check TypeScript types
```

## Adding a shadcn/ui Component

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
```

Components are copied into `src/components/ui/`.

## Deployment

### On a Linux Server (with Nginx)

1. Build:

```bash
npm run build
```

2. Copy the contents of the `dist/` folder to the server:

```bash
scp -r dist/* user@server:/var/www/ranking-frontend/
```

3. Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/ranking-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### With Docker

A `Dockerfile` can be added later to containerize the application.

## License

To be defined.
