# Merchant Acquiring MVP

A full-stack MVP for merchant lifecycle and terminal management, built with React (frontend) and Node.js/Express (backend), using MongoDB for data storage.

## Features

- Merchant registration, profile management, transitions, closure, and configuration
- Bulk account creation (CSV upload, template-based)
- Admin panel for merchant and terminal management
- Terminal onboarding, configuration, transaction history, and lifecycle actions
- Automated account review and risk flagging
- RESTful API endpoints for all features
- JWT authentication for admin routes

## Tech Stack

- Frontend: React (Vercel)
- Backend: Node.js/Express (Render)
- Database: MongoDB (Mongoose)

## API Endpoints

See `/backend/routes/merchants.js` and `/backend/routes/terminals.js` for all available endpoints.

## Project Structure

```
merchant-acquiring-mvp/
  backend/
    app.js
    package.json
    models/
    routes/
    controllers/
    middleware/
  frontend/
    package.json
    src/
      App.js
      Register.js
      Status.js
      Admin.js
      AdminPanel.js
      MerchantManagement.js
      TerminalManagement.js
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

## Authentication

- Admin routes require JWT token in `Authorization` header.
- Set `ADMIN_SECRET` env variable for JWT signing.

## Testing

- Use sample data and Postman/curl to test endpoints
- Frontend components are ready for integration and testing

## Future Expansion

- Add more risk rules, reporting, analytics
- Integrate payment gateways
- Enhance UI/UX and validation

---

For details, see code comments and individual component files.
