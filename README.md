# Merchant Acquiring MVP

A full-stack MVP for merchant lifecycle, pricing configuration, and terminal management, built with React (frontend) and Node.js/Express (backend).

## Features

- **Merchant Management**
  - Merchant registration, profile management, transitions, and closure
  - Bulk account creation (CSV upload, template-based)
  - Automated account review and risk flagging
  
- **Pricing Management**
  - Configure MDR (Merchant Discount Rate) and fixed fees
  - Support for multiple currencies
  - Effective date management for pricing changes
  
- **Device Management**
  - Hardware POS terminal assignment and management
  - SoftPOS terminal assignment with manual ID entry
  - Terminal status tracking and history
  - Bulk device assignment capabilities
  
- **User Interface**
  - Tab-based navigation for complex screens
  - Breadcrumb navigation for improved usability
  - Responsive design with Bootstrap

## Tech Stack

- **Frontend**: React with Bootstrap for UI
- **Backend**: Node.js/Express
- **Database**: In-memory storage for MVP (expandable to MongoDB)
- **API**: RESTful endpoints for all features

## Project Structure

```
merchant-acquiring-mvp/
  backend/
    app.js                # Main Express application
    package.json
    models/               # Data models
    routes/               # API routes
      merchants.js        # Merchant management routes
      terminals.js        # Terminal management routes
      merchantPricing.js  # Pricing & device management routes
    controllers/          # Business logic
  
  docs/                   # API documentation
    merchant-pricing-api.md  # Pricing & device API documentation
  
  frontend/
    package.json
    public/
    src/
      App.js              # Main React application
      Register.js         # Merchant registration
      Status.js           # Status display components
      Admin.js            # Admin features
      MerchantPricing.js  # Pricing & device management UI
```

## Merchant Pricing & Device Management

### Pricing Features

- Configure MDR percentage and fixed transaction fees
- Select multiple supported currencies
- Set effective start date for pricing changes
- View and update existing pricing configurations

### Device Management Features

- View all available terminals
- Assign hardware POS terminals to merchants
- Add SoftPOS terminals with manual ID entry
- Bulk device assignment capability
- Remove devices from merchants
- Track device status and location

## API Endpoints

### Pricing Management

- `GET /api/merchants/:id/pricing` - Get merchant pricing details
- `PUT /api/merchants/:id/pricing` - Update merchant pricing

### Device Management

- `GET /api/terminals?available=true` - Get available terminals for assignment
- `GET /api/merchants/:id/devices` - Get devices assigned to a merchant
- `POST /api/merchants/:id/devices/assign` - Assign a device to a merchant
- `POST /api/merchants/:id/devices/remove` - Remove a device from a merchant

For detailed API specifications, see the [Merchant Pricing API Documentation](./docs/merchant-pricing-api.md).

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

## User Interface

The merchant pricing and device management UI includes:

1. **Breadcrumb Navigation**
   - Provides clear context and navigation path
   - Shows merchant name and section

2. **Tab-based Interface**
   - "Pricing Plan" tab for MDR and fee configuration
   - "Device Management" tab for terminal assignment

3. **Device Assignment**
   - Multi-select interface for hardware POS terminals
   - Manual entry field for SoftPOS IDs
   - Table view of currently assigned devices

## Future Expansion

- Add payment gateway integration
- Implement user roles and permissions
- Add reporting and analytics
- Enhance validation and error handling
- Convert to persistent database storage

---

For details, see code comments and individual component files.
