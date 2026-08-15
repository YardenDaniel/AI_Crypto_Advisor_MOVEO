# AI Crypto Advisor

Personalized daily briefing for crypto investors.

After a short onboarding quiz, the app learns about the user's preferred crypto assets, investor type, and content interests. It then presents a personalized dashboard with market data, news, an AI-generated daily insight, a crypto meme, and feedback controls that can be used for future recommendation improvements.

Built for the Moveo coding assignment.

---

## Live Application

- **Frontend:** https://ai-crypto-advisor-ecru.vercel.app
- **API Documentation:** https://ai-crypto-advisor-api.up.railway.app/docs
- **GitHub Repository:** https://github.com/YardenDaniel/AI_Crypto_Advisor_MOVEO
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Railway
- **Database:** PostgreSQL on Railway

---

## Features

- **Signup and Login**
  - Name, email, and password
  - JWT authentication stored in an HttpOnly cookie
  - Session restoration through `/auth/me`
  - Logout and protected routes
- **Onboarding**
  - Preferred crypto assets
  - Investor type
  - Preferred content types
  - Preferences are persisted in PostgreSQL
- **Personalized Dashboard**
  - Coin Prices
  - Market News
  - AI Insight of the Day
  - Crypto Meme
- **Feedback and Voting**
  - One thumbs-up or thumbs-down vote per displayed item
  - Votes are stored in PostgreSQL
  - Feedback is associated with the exact content item shown to the user
- **Meme Refresh**
  - Users can request a new meme without refreshing the rest of the dashboard
  - Immediate repetition is avoided when another usable meme is available
- **Independent Dashboard Sections**
  - Each section loads independently
  - One failed external provider does not take down the entire dashboard
  - Loading, empty, error, and retry states are handled separately
- **Responsive UI**
  - Desktop, tablet, and mobile layouts
  - Accessible controls and keyboard-friendly interactions
  - Meme image lightbox
  - Active loading state for slower AI Insight generation

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite |
| Data Fetching | TanStack Query |
| Routing | React Router |
| Styling | Tailwind CSS v4 + CSS design tokens |
| Backend | FastAPI |
| ORM | SQLAlchemy 2 |
| Validation | Pydantic |
| Database | PostgreSQL |
| Migrations | Alembic |
| Authentication | JWT in HttpOnly cookies |
| Password Hashing | `pwdlib` with Argon2 |
| Coin Data | CoinGecko |
| AI | OpenRouter |
| Memes | Reddit + static fallback |
| Frontend Hosting | Vercel |
| Backend Hosting | Railway |
| Database Hosting | Railway PostgreSQL |

---

## Architecture

```text
frontend/
├── src/
│   ├── api/              Typed API functions and shared fetch client
│   ├── components/       Reusable UI and feature components
│   ├── context/          Authentication context
│   ├── hooks/            Auth, preferences, and dashboard queries
│   ├── pages/            Login, signup, onboarding, dashboard
│   ├── styles/           Design tokens and global styles
│   ├── types/            TypeScript API contracts
│   └── utils/            Formatting and UI utilities
│
backend/
├── app/
│   ├── api/              FastAPI routes and dependencies
│   ├── constants/        Shared enums/constants
│   ├── core/             Configuration, security, cookies
│   ├── db/               SQLAlchemy session and models
│   ├── integrations/     CoinGecko, OpenRouter, Reddit
│   ├── schemas/          Pydantic request/response schemas
│   └── services/         Business logic
│
└── alembic/              Database migrations
```

The dashboard sections are independent backend endpoints:

```text
GET /dashboard/prices
GET /dashboard/news
GET /dashboard/meme
GET /dashboard/insight
```

The frontend mirrors this architecture with independent TanStack Query keys:

```text
['dashboard', 'prices']
['dashboard', 'news']
['dashboard', 'meme']
['dashboard', 'insight']
```

This allows one section to fail or retry without blocking the other sections.

---

## Authentication Flow

```text
Signup
→ POST /auth/signup
→ POST /auth/login
→ Backend creates JWT
→ JWT stored in HttpOnly cookie
→ Frontend stores only public user information
```

On application startup:

```text
Browser cookie
→ GET /auth/me
→ 200: authenticated user
→ 401: guest
```

The frontend never reads or stores the JWT.

Authenticated requests use:

```text
credentials: "include"
```

so the browser automatically sends the authentication cookie.

Production cookie configuration:

```text
HttpOnly
Secure
SameSite=none
```

This allows the Vercel frontend to authenticate against the Railway backend.

---

## Onboarding

After authentication, the application checks:

```text
GET /preferences
```

Behavior:

```text
200
→ Preferences already exist
→ Dashboard

404
→ User has not completed onboarding
→ /onboarding
```

The database is the source of truth for onboarding completion. No `localStorage` onboarding flag is used.

### Supported Assets

- BTC
- ETH
- SOL
- XRP
- ADA

### Investor Types

- HODLer
- Day Trader
- NFT Collector

### Content Types

- Market News
- Charts
- Social
- Fun

---

## `content_types` Design Decision

The onboarding flow stores the user's preferred content types in:

```text
preferences.content_types
```

The current assignment dashboard always renders all four required sections.

Therefore, `content_types` is currently stored as preference data for future ranking, emphasis, or personalization rather than being used to completely hide dashboard sections.

The user's selected assets and investor type already directly influence prices, news filtering, meme relevance, and AI Insight generation.

---

## Dashboard

### Coin Prices

Source: CoinGecko.

Displays:

- Asset symbol
- USD price
- 24-hour change
- Provider freshness information when available

Prices are fetched when the section loads and when the dashboard is refreshed.

If CoinGecko is unavailable, the Prices section degrades independently without breaking the rest of the dashboard.

### Market News

The current implementation uses a static CryptoPanic-style news feed, which is allowed by the assignment.

News is filtered using the user's preferred assets while still allowing general crypto news.

Each article can include:

- Headline
- Source
- Date
- Description
- Related asset badges
- External article link
- Individual feedback controls

Each article owns its own feedback record.

### AI Insight of the Day

The AI Insight is generated through OpenRouter using context built from:

- Investor type
- Preferred assets
- Current prices
- Market news

The response contains structured fields such as:

- Title
- Summary
- Key points
- What to watch
- Risk note

The application reuses an existing AI insight for the current UTC day when one is already stored.

AI generation may take longer than the other dashboard requests, so the frontend displays an active generation state while allowing the rest of the dashboard to remain usable.

If the AI provider fails or returns an invalid response, the endpoint returns `502` and the section displays a Retry action.

### Crypto Meme

The application first attempts to retrieve a meme from Reddit.

If Reddit is unavailable or does not provide a usable image, one of six static memes is used as a fallback.

Static images live under:

```text
frontend/public/memes/
```

The Meme section also provides:

- Image enlargement / lightbox
- Meme-only refresh
- Immediate-repeat prevention when another usable meme is available
- Independent feedback and voting

Meme identity remains stable, so if the same meme appears again later, its existing feedback state is reused.

---

## Feedback and Voting

Every displayed dashboard item that supports voting is associated with a `dashboard_feedback` record.

Feedback contains information such as:

```text
user_id
section
item_id
content_snapshot
vote
shown_at
voted_at
```

A database uniqueness constraint ensures one feedback record per:

```text
(user_id, section, item_id)
```

Voting endpoint:

```http
POST /dashboard/feedback/{feedback_id}/vote
```

Example:

```json
{
  "value": "up"
}
```

Supported values:

```text
up
down
```

Voting is intentionally one-time.

After a successful vote, the frontend:

1. Highlights the selected vote
2. Displays a short feedback confirmation
3. Removes the voting controls

Previously voted items remain non-votable when loaded again.

---

## Local Setup

### Prerequisites

- Python 3.11+
- Node.js
- PostgreSQL

### Backend Setup

```bash
cd backend
python -m venv ../.venv
```

Activate the environment.

Windows:

```bash
..\\.venv\\Scripts\\activate
```

macOS / Linux:

```bash
source ../.venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create the local environment file:

```bash
cp .env.example .env
```

Configure the required values and run migrations:

```bash
python -m alembic upgrade head
```

Start FastAPI:

```bash
uvicorn app.main:app --reload
```

Local API:

```text
http://localhost:8000
```

Swagger:

```text
http://localhost:8000/docs
```

Health endpoint:

```text
GET /health
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create:

```text
frontend/.env
```

with:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Run:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## Environment Variables

### Backend

```text
DATABASE_URL
JWT_SECRET_KEY
JWT_ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES
CORS_ORIGINS
AUTH_COOKIE_NAME
AUTH_COOKIE_SECURE
AUTH_COOKIE_SAMESITE
COINGECKO_BASE_URL
COINGECKO_API_KEY
CRYPTOPANIC_BASE_URL
CRYPTOPANIC_API_KEY
REDDIT_MEME_URL
REDDIT_USER_AGENT
OPENROUTER_BASE_URL
OPENROUTER_API_KEY
OPENROUTER_MODEL
```

CryptoPanic variables are currently optional because the application uses the assignment-allowed static news implementation.

Never commit real secrets.

The repository tracks `.env.example`, while `.env` and other local environment files are ignored.

### Frontend

```text
VITE_API_BASE_URL
```

Production value:

```text
https://ai-crypto-advisor-api.up.railway.app
```

---

## Database and Migrations

Main tables:

```text
users
preferences
ai_insights
dashboard_feedback
```

Alembic migrations live under:

```text
backend/alembic/versions/
```

Current migration chain:

1. `c2eddc2c1f42` — users
2. `145e80a0a679` — preferences
3. `ccfd8e68fb7f` — AI insights
4. `7cc39d2e5ac8` — dashboard feedback

Apply migrations:

```bash
cd backend
python -m alembic upgrade head
```

Check current revision:

```bash
python -m alembic current
```

---

## Tests

### Backend

From `backend/`:

```bash
pytest -v
```

The backend test suite covers areas including authentication, preferences, prices, news, AI Insight, meme selection, feedback, voting, meme refresh, and feedback reuse.

### Frontend

From `frontend/`:

```bash
npm test
```

Build verification:

```bash
npm run build
```

Frontend tests use Vitest, React Testing Library, jest-dom, and mocked API functions/fetch behavior.

They cover flows including session restoration, login/signup, protected routing, onboarding, dashboard sections, loading/empty/error states, voting, meme refresh, meme lightbox, and dashboard refresh.

---

## Production Deployment

### Architecture

```text
Browser
   │
   ▼
Vercel
React + Vite SPA
   │
   │ credentials: include
   ▼
Railway
FastAPI
   │
   ▼
Railway PostgreSQL
```

### Frontend — Vercel

Production application:

```text
https://ai-crypto-advisor-ecru.vercel.app
```

Configuration:

```text
Root Directory: frontend
Framework: Vite
Build Command: npm run build
Output Directory: dist
```

Environment:

```env
VITE_API_BASE_URL=https://ai-crypto-advisor-api.up.railway.app
```

### Backend — Railway

Production API:

```text
https://ai-crypto-advisor-api.up.railway.app
```

API Documentation:

```text
https://ai-crypto-advisor-api.up.railway.app/docs
```

Railway service root:

```text
/backend
```

Pre-deploy command:

```bash
python -m alembic upgrade head
```

Start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Railway automatically provides the `PORT` environment variable.

Production CORS includes:

```text
https://ai-crypto-advisor-ecru.vercel.app
```

Production authentication uses:

```env
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAMESITE=none
```

---

## Database Access for Reviewers

PostgreSQL is hosted on Railway.

Database credentials are intentionally not published in the repository.

If database access is required for assignment review, reviewer connection details can be supplied separately with the submission.

---

## AI Tools Usage Summary

AI tools were used throughout the development process as collaborative development assistants.

The primary tools used were:

- **ChatGPT**
- **Cursor AI coding agents**

AI assistance was used for:

| Area | Usage |
| --- | --- |
| Architecture | Translating the assignment requirements into a React + FastAPI + PostgreSQL architecture |
| Planning | Breaking development into isolated backend/frontend stages and Git branches |
| Implementation | Assisting with API endpoints, services, schemas, React components, and hooks |
| Debugging | Investigating authentication, cookies, CORS, provider failures, and runtime issues |
| Testing | Designing and reviewing pytest and Vitest test coverage |
| UI / UX | Iterating on dashboard layout, AI loading UX, feedback lifecycle, and meme interactions |
| Deployment | Configuring Railway, PostgreSQL, Vercel, environment variables, CORS, and production cookies |
| Documentation | Reviewing and preparing submission documentation |

AI-generated suggestions were reviewed, tested, and adjusted before being accepted.

Runtime AI inside the product is separate from development assistance.

`GET /dashboard/insight` uses OpenRouter to generate structured daily crypto insights based on the user's preferences and current dashboard context.

---

## Bonus — Using Feedback to Improve Recommendations

The current application already stores structured explicit feedback in:

```text
dashboard_feedback
```

Each record includes information such as:

```text
user_id
section
item_id
content_snapshot
vote
shown_at
voted_at
```

This creates a labeled history of what content was shown, which user saw it, and whether the user liked or disliked it.

A future recommendation system could use this information in several ways:

1. **Personalized ranking** — rank news, memes, or other content higher when it resembles content the user previously upvoted.
2. **Investor-type learning** — aggregate feedback across users with similar investor profiles.
3. **AI prompt personalization** — add summarized feedback preferences to the AI Insight prompt.
4. **Offline evaluation** — use historical `content_snapshot + vote` pairs to compare prompt strategies or recommendation algorithms.
5. **Future ranking model** — with sufficient data, use the stored feedback as training or ranking data for a dedicated recommendation model.

This feedback is **not currently used to retrain the LLM**. It is intentionally stored so future recommendation improvements can be built on top of real user behavior.

---

## Known Limitations

- Market News currently uses the assignment-allowed static feed rather than the live CryptoPanic API.
- AI Insight daily reuse is implemented at the application layer. Two simultaneous first-generation requests could theoretically create duplicate daily records.
- Reddit meme variety depends on reachable direct-image posts. Static fallback memes are used when necessary.
- Sessions expire according to `ACCESS_TOKEN_EXPIRE_MINUTES`; refresh-token rotation is not implemented.
- `content_types` is currently stored for future ranking/emphasis rather than controlling section visibility.

---

## Assignment Deliverables

- Public GitHub repository
- Deployed frontend
- Deployed backend
- PostgreSQL database
- AI-tool usage summary
- Feedback/model-improvement proposal
- Database access available separately for reviewers when required

---

## Author

**Yarden Daniel**

Moveo Coding Task — AI Crypto Advisor
