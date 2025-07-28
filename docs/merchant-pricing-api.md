# Merchant Pricing & Device Management APIs

This document outlines the APIs required for merchant pricing configuration and device assignment.

## Pricing Management

### Get Merchant Pricing
```
GET /api/merchants/:id/pricing
```

**Response:**
```json
{
  "mdr": "2.50",
  "fixedFee": "0.30",
  "currencies": ["AED", "USD"],
  "effectiveStartDate": "2025-08-01T00:00:00.000Z"
}
```

### Update Merchant Pricing
```
PUT /api/merchants/:id/pricing
```

**Request Body:**
```json
{
  "mdr": "2.75",
  "fixedFee": "0.35",
  "currencies": ["AED", "USD", "EUR"],
  "effectiveStartDate": "2025-08-15T00:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Pricing updated successfully",
  "pricing": {
    "mdr": "2.75",
    "fixedFee": "0.35",
    "currencies": ["AED", "USD", "EUR"],
    "effectiveStartDate": "2025-08-15T00:00:00.000Z"
  }
}
```

## Device Management

### Get Available Terminals
```
GET /api/terminals?available=true
```

**Response:**
```json
{
  "terminals": [
    {
      "id": 601,
      "serial": "POS-6001",
      "status": "inactive",
      "model": "PAX A920",
      "location": "",
      "transactions": [],
      "merchant": "",
      "merchantName": ""
    },
    {
      "id": 602,
      "serial": "POS-6002",
      "status": "inactive",
      "model": "Verifone Carbon",
      "location": "",
      "transactions": [],
      "merchant": "",
      "merchantName": ""
    }
  ],
  "total": 2,
  "unassigned": 2
}
```

### Get Merchant Devices
```
GET /api/merchants/:id/devices
```

**Response:**
```json
{
  "devices": [
    {
      "id": 101,
      "serial": "POS-1001",
      "status": "active",
      "model": "Verifone VX520",
      "location": "Main Store",
      "transactions": [...]
    },
    {
      "id": "SPOS-001",
      "serial": "SPOS-001",
      "status": "active",
      "model": "SoftPOS Terminal",
      "location": "",
      "deviceType": "softpos",
      "transactions": []
    }
  ]
}
```

### Assign Device to Merchant
```
POST /api/merchants/:id/devices/assign
```

**Request Body (Hardware POS):**
```json
{
  "deviceId": 601
}
```

**Request Body (SoftPOS):**
```json
{
  "deviceId": "SPOS-001",
  "deviceType": "softpos"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Device assigned successfully",
  "device": {
    "id": 601,
    "serial": "POS-6001",
    "status": "active",
    "model": "PAX A920",
    "location": "",
    "transactions": []
  }
}
```

### Remove Device from Merchant
```
POST /api/merchants/:id/devices/remove
```

**Request Body:**
```json
{
  "deviceId": 601
}
```

**Response:**
```json
{
  "success": true,
  "message": "Device removed successfully"
}
```

## UI Suggestions

1. **Use tabs for organization**
   - "Pricing Plan" tab - Contains the pricing configuration form
   - "Device Management" tab - Contains device assignment and management

2. **Add breadcrumbs for navigation**
   ```
   Merchants > Merchant Name > Pricing & Devices
   ```

3. **Include collapsible sections for complex forms**
   - Use a toggle button to show/hide the bulk device assignment section

4. **Display merchant information prominently**
   - Show merchant name, status, and key details at the top of the page
