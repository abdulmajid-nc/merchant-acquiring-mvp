# Analytics Component

This document provides information about the Analytics dashboard component added to the Merchant Acquiring MVP project.

## Overview

The Analytics component provides a comprehensive dashboard for monitoring payment processing metrics, transaction volumes, and revenue data. It allows merchants and administrators to track performance over different time periods and understand key business metrics.

## Features

1. **Time Period Selection**
   - Filter data by last 7 days, last 30 days, last 90 days, or year-to-date

2. **Key Metrics**
   - Total Revenue
   - Transaction Count
   - Average Transaction Value
   - Success Rate
   - Most Active Terminal
   - Top Merchant

3. **Data Visualization**
   - Revenue over time chart
   - Transaction volume breakdown
   - Success rate pie chart

4. **Recent Transactions Table**
   - View the most recent transactions
   - Filter by status (Completed, Pending, Declined)

## Implementation Details

### Current Status
The Analytics component currently uses mock data to demonstrate the UI and functionality. In a production environment, this would be connected to real transaction data from the backend API.

### Future Enhancements
1. Connect to real transaction data API
2. Add export functionality for reports (CSV, PDF)
3. Implement advanced filtering and sorting options
4. Add comparison with previous periods
5. Integrate with user-specific merchant data

## Routes

- `/analytics` - Main analytics dashboard

## Related Components

- `AdminPanel.js` - Some analytics data is also shown here in a simplified format
- `Status.js` - Transaction status tracking
- `MerchantManagement.js` - Merchant data that feeds into analytics

## Usage

To access the Analytics dashboard, click on the "Analytics" link in the main navigation sidebar.
