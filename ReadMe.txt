================================================================================
NN-Zynex: Fan Hub Plus - End-to-End Web Solutions
================================================================================

PROJECT OVERVIEW:
Fan Hub Plus is a unified, interactive Fandom Universe platform catering to
fans of Anime, Gaming, Movies, TV Shows, K-Pop, Comics, Manga, and Cosplay.

DIRECTORY STRUCTURE:
NN-Zynex_End-to-End Web Solutions_NN/
├── Documentation/       (Project reports, SRS, diagrams, data specifications)
├── Project/             (All application source code)
│   ├── Controllers/     (Future API controllers)
│   ├── Properties/      (Launch profiles & environment config)
│   ├── appsettings.json (Base configuration & database connection string)
│   ├── FanHubPlus.csproj(ASP.NET Core Web API project file)
│   ├── Program.cs       (API entry point, CORS, routes & middleware)
│   └── frontend/        (React + TypeScript + Vite single-page app)
│       ├── src/
│       ├── package.json
│       ├── vite.config.ts
│       └── ...
├── Video/               (Mandatory demonstration video .mp4)
├── .gitignore           (Git exclusions for bin, obj, node_modules, secrets)
├── CONTRIBUTING.md      (Contribution and secret hygiene rules)
└── ReadMe.txt           (Setup and run instructions)

================================================================================
LOCAL RUN INSTRUCTIONS:
================================================================================

PREREQUISITES:
1. .NET 9.0 SDK
2. Node.js (v18+ recommended) & npm

STEP 1: RUN THE BACKEND WEB API
1. Open PowerShell or Command Prompt.
2. Navigate to the Project folder:
   cd "NN-Zynex_End-to-End Web Solutions_NN\Project"
3. Run the backend service:
   dotnet run --launch-profile http
   The API will listen at:
   - http://localhost:5075
   - Health check endpoint: http://localhost:5075/api/health

STEP 2: RUN THE FRONTEND APPLICATION
1. Open a second PowerShell or Command Prompt window.
2. Navigate to the frontend directory:
   cd "NN-Zynex_End-to-End Web Solutions_NN\Project\frontend"
3. Install dependencies (if not already installed):
   npm install
4. Start the Vite development server:
   npm run dev
5. Open your browser and navigate to:
   - http://localhost:5173

================================================================================
SECURITY & SECRET HYGIENE:
================================================================================
- No database credentials, JWT secrets, or production connection strings are
  stored in version-controlled source files.
- Local development utilizes localdb / localhost configurations in appsettings.json.
- Sensitive environment overrides should be provided via environment variables
  or untracked appsettings.Production.json / .env files (configured in .gitignore).

================================================================================
CONTRIBUTING & PUSH WORKFLOW:
================================================================================
For every future push:
1. Review changes using `git diff` and `git diff --cached`.
2. Stage ONLY the specific files needed for that feature by explicit path.
   Never use `git add .` or `git add -A`.
3. Scan staged changes for secrets, credentials, or private keys.
4. Commit and push cleanly: `git push origin main`.
5. Never assume .gitignore protects a file already tracked by Git.
================================================================================
