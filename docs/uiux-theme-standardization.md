# UI/UX Theme Standardization & Component Guide

## Theme System
- **Light/Dark Mode:** Toggle in sidebar, persists via localStorage.
- **Implementation:** Uses Tailwind CSS `dark:` variants and a `ThemeContext`.
- **How to Use:** Wrap your app in `ThemeProvider` and use `useTheme()` to access or toggle theme.

## Standardized Components
- **NotificationBanner:** Consistent feedback, theme-aware.
- **StatusBadge & TransactionStatusBadge:** Unified status display, theme-aware.
- **StatsCard:** For metrics, theme-aware.
- **TransactionTable:** Responsive, accessible, theme-aware.
- **TransactionDetailsModal:** Detailed view, theme-aware.
- **TransactionStatusFilter:** Filter UI, theme-aware.

## Style Guide
- **Colors:** Centralized in `tailwind.config.js`.
- **Typography:** Uses Inter/Open Sans, scalable via Tailwind.
- **Spacing:** Tailwind utilities, consistent across components.
- **Buttons, Badges, Alerts:** Centralized classes in `index.css`.

## Usage Example
```
import { useTheme } from './contexts/ThemeContext';
const { theme, toggleTheme } = useTheme();
```

## Accessibility
- All components use sufficient color contrast in both themes.
- Keyboard and screen reader accessible.

## Responsive Design
- Layout and tables adapt to all breakpoints.

## How to Add New Components
- Use Tailwind utility classes and `dark:` variants.
- Follow the structure of existing components for props and documentation.

## Before/After Screenshots
- See `/docs/uiux-theme-standardization-screenshots/` (add your screenshots here).

---

For more, see the referenced best practice guides in the PR.
