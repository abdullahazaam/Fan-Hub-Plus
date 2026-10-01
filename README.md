# Fan Hub Plus

> A cinematic full-stack fandom platform where Anime, Gaming, Movies, TV Shows, K-Pop, Comics, Manga and Cosplay meet in one interactive universe.

**Live:** https://fan-hub-plus-six.vercel.app/  
**API:** https://fan-hub-plus-api.runasp.net

## Highlights

- Cinematic responsive fandom experience with dark/light themes
- Chronicle Explorer with search, filtering, sorting and pagination
- Character Dossiers and multimedia galleries
- Media, ratings, bookmarks, events, merchandise and upcoming releases
- Fan submissions, feedback and administrative moderation
- Secure authentication with password reset and email verification
- Personalized profiles, activity and multi-fandom preferences
- Admin analytics, user management and content CRUD
- “Discover Your Realm” — a weighted fandom discovery experience
- React + TypeScript + Vite frontend
- ASP.NET Core + EF Core + SQL Server backend
- Three.js / React Three Fiber powered visual experiences

## Architecture

```text
Fan Hub Plus
├── Frontend — React + TypeScript + Vite
│   ├── Responsive UI
│   ├── Three.js / R3F scenes
│   ├── Leaflet event maps
│   └── API client + client-side caching
└── Backend — ASP.NET Core
    ├── REST API
    ├── JWT authentication
    ├── Email verification / password reset
    ├── Rate limiting
    ├── EF Core data access
    └── SQL Server
```

## Repository Structure

```text
Project/
├── frontend/     # React application
└── backend/      # ASP.NET Core Web API

Documentation/    # Project documentation artifacts
Video/            # Demonstration assets
.github/          # CI workflows
CONTRIBUTING.md   # Contribution and secret-hygiene rules
SECURITY.md       # Security policy
```

## Local Development

### Prerequisites

- .NET 9 SDK
- Node.js 18+
- SQL Server LocalDB (for the default local database configuration)

### Backend

```powershell
cd Project/backend
$env:FAN_HUB_JWT_KEY="replace-with-a-random-32-plus-character-key"
$env:DEV_ADMIN_PASSWORD="your-local-admin-password"
$env:DEV_USER_PASSWORD="your-local-user-password"
dotnet restore
dotnet run --launch-profile http
```

API: `http://localhost:5075`

### Frontend

```powershell
cd Project/frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

The frontend defaults to the deployed API. To override it locally, create an untracked `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:5075
```

## Security

Never commit JWT keys, SMTP credentials, database credentials, publish profiles, demo passwords or private keys.

- Use environment variables for secrets.
- Keep local launch credentials outside tracked files.
- Review staged changes before every push.
- If a secret was ever exposed publicly, rotate it before relying on the repository as a secure source.
- See [SECURITY.md](SECURITY.md) for reporting guidance.

## Documentation

The repository is organized to support the project report, SRS, architecture material and demonstration workflow. Add large binary deliverables only when they are intentionally part of the public repository.

## Testing & Quality

Frontend checks:

```bash
npm run lint
npm run build
```

Backend checks:

```bash
dotnet restore
dotnet build --configuration Release
```

GitHub Actions runs these checks on pushes and pull requests.

## Project

**Fan Hub Plus**  
End-to-End Web Solutions  
Built by **Abdullah Azaam**

```text
© 2026 Abdullah Azaam. All rights reserved.
```
