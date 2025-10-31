# Mobile Version Features

## Overview
The Smartseed Nursery Management System now includes a mobile-optimized interface specifically designed for field workers and nursery staff.

## Features

### Automatic Mobile Detection
- Automatically detects mobile devices based on:
  - Screen width (< 768px)
  - Touch capability
- Shows simplified interface for staff members

### Mobile Interface Components

#### 1. **Top Navigation Bar**
- Clean header with logo and user name
- Hamburger menu for additional options
- Sign out functionality

#### 2. **Bottom Navigation Bar**
- Fixed bottom navigation with 2 main options:
  - **My Beds**: View all assigned plant beds
  - **Scan QR**: Quick access to QR code scanner

#### 3. **Mobile Beds Page**
- Category filters (All, Forestry, Fruit Tree, Ornamental)
- Horizontal scrolling for easy navigation
- Card-based layout with:
  - Bed name and category badge
  - Location information
  - Person in charge
  - Capacity with visual progress bar
  - Notes section
- Touch-friendly tap targets

#### 4. **Mobile QR Scanner**
- Full-width camera view optimized for mobile
- Large, touch-friendly buttons
- Clear scan status indicators
- Error handling for camera permissions
- Manual QR code entry option

## User Roles with Mobile Access
- Field Workers (`field_worker`)
- Nursery Staff (`nursery_staff`)

## Desktop vs Mobile Behavior
- **Mobile (detected)**: Simplified 2-page interface (Beds + QR Scanner)
- **Desktop**: Full sidebar navigation with all features
- **Admin users**: Always see desktop interface regardless of device

## Technical Implementation

### Device Detection
```typescript
const isMobileWidth = window.innerWidth < 768;
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const isMobileDevice = isMobileWidth || isTouchDevice;
```

### Mobile-Specific Styling
- CSS media queries for screens < 768px
- Touch-optimized button sizes (min 44x44px)
- Hidden scrollbars with maintained functionality
- Prevented zoom on double-tap for iOS
- Full-width camera scanner

## Testing on Desktop
To test mobile mode on desktop:
1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select a mobile device (e.g., iPhone 12 Pro)
4. Refresh the page
5. Login with a field worker account

## Sample Login Credentials
```
Field Worker:
Email: juan@Smartseed.com
Password: password123
```

## Components
- `app/components/layout/MobileNav.tsx` - Mobile navigation header
- `app/components/beds/MobileBedsPage.tsx` - Mobile beds view
- `app/components/scanning/ScanningPage.tsx` - QR scanner
- `app/page.tsx` - Main app with mobile detection

## Future Enhancements
- [ ] Offline mode support
- [ ] Push notifications for tasks
- [ ] Swipe gestures for navigation
- [ ] Image upload from mobile camera
- [ ] GPS-based location tracking
- [ ] Voice notes for bed observations
