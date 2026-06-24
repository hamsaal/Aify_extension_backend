# Aify Extension Backend

Express backend for the Aify browser extension authentication and AI request flow. The app handles Firebase email/password login, Google OAuth through Passport, Firebase-backed sessions, auth-token middleware, and authenticated AI chat requests.

## What Is Included

- Express app exported from `app.js`
- Firebase Authentication email/password login and registration
- Google OAuth callback handling with `passport-google-oauth20`
- Firebase session storage through `connect-session-firebase`
- Cookie/header auth helpers with encrypted token values
- Authenticated `/req/chat` route that delegates to the AI request function
- Jasmine unit tests for helpers, middleware, and route handlers

## Project Structure

```text
.
|-- app.js
|-- configurations/
|   |-- email.js
|   |-- google-passport.js
|   |-- imp-func.js
|   |-- keys.js
|   |-- middlewares.js
|   `-- newUser.js
|-- routes/
|   |-- auth-routes.js
|   `-- req-routes.js
|-- spec/
|   |-- configurations/
|   |-- helpers/
|   |-- routes/
|   `-- support/
`-- views/
```

## Requirements

- Node.js and npm
- Firebase project credentials/configuration
- Google OAuth client credentials
- The AI request module imported by `routes/req-routes.js` as `../../reqFunc`

## Installation

```bash
npm install
```

If you are working from Windows against this WSL path, PowerShell may block `npm.ps1` or `cmd.exe` may dislike UNC working directories. This form works from Windows:

```bash
cmd.exe /c "pushd \\wsl.localhost\Ubuntu\home\hs840\Aify_extension_backend & npm.cmd install"
```

## Configuration

Runtime configuration is loaded from `configurations/keys.js`. Keep real secrets out of commits and deployment logs.

The app expects values for:

- Firebase API key and Admin SDK setup
- Google OAuth client ID and client secret
- Cookie/session options used by auth responses

The Express session store is initialized with `admin.database()` in `app.js`, so Firebase Admin must be configured before the app handles traffic.

## Available Routes

### Auth Routes

Mounted under `/auth`.

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/auth/email` | Sign in with Firebase email/password credentials |
| `POST` | `/auth/register` | Create a Firebase user and send an email verification code |
| `GET` | `/auth/google` | Start Google OAuth login |
| `GET` | `/auth/google/redirect` | Handle Google OAuth redirect and set auth cookies |

### Request Routes

Mounted under `/req` and protected by `authCheck2`.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/req/` | Basic health response |
| `POST` | `/req/chat` | Send a request body and user id to `reqAI` |

### App Routes

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/` | Render authenticated user success page or login page |
| `GET` | `/logout` | Destroy session, clear auth cookies, and redirect home |

## Authentication Flow

Email login stores Firebase auth data on the session and sets encrypted cookies:

- `userToken`
- `uid`
- `refToken`
- `expiryTime`

Protected extension requests send auth headers:

- `x-auth-api`
- `x-auth-uid`
- `x-auth-expiry`
- `x-auth-reftoken`

`authCheck2` decrypts those values, refreshes expired tokens, verifies Firebase ID tokens, and attaches `req.uid` plus any refreshed token payload for downstream handlers.

## Testing

Run the Jasmine suite:

```bash
npm test
```

The current suite covers:

- Firebase token verification behavior
- Encryption/decryption helper behavior
- Firebase refresh-token request construction
- Email/password auth request construction
- New-user creation and verification-email request flow
- `authCheck` and `authCheck2` middleware branches
- Auth route success/error handling
- Request route delegation to `reqAI`

The tests use dependency stubs, so they do not call Firebase, Google, or the AI service.

## Dependency Notes

`connect-session-firebase` currently declares a Firebase Admin peer range that is older than the latest Firebase Admin package. The project is locked with the installed dependency tree in `package-lock.json`; run `npm audit` during dependency maintenance and test auth/session behavior after package upgrades.

## Development Checklist

Before pushing changes:

```bash
npm test
npm audit --omit=dev
```

Use `npm audit fix` only after reviewing the package changes it proposes, especially for Firebase-related packages.