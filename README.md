# Merchant Acquiring MVP

A proof-of-concept web application for merchant onboarding and admin review.

## Features

- Merchant registration form
- Document submission (comma-separated URLs)
- Application status check by merchant ID
- Admin panel for reviewing and updating merchant status

## Project Structure

```
merchant-acquiring-mvp/
  backend/
    app.js
    package.json
  frontend/
    package.json
    src/
      App.js
      Register.js
      Status.js
      Admin.js
      index.js
```

## Quick Start

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Deployment

- **Frontend**: Deploy on [Vercel](https://vercel.com/) or [Netlify](https://netlify.com/) for a public URL.
- **Backend**: Deploy on [Render](https://render.com/), [Railway](https://railway.app/), or [Heroku](https://heroku.com/).

## License

MIT
