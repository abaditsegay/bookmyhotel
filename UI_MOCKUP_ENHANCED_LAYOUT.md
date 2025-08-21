# Enhanced UI Layout with Calendar and TODOs Pane

## Current Layout vs Enhanced Layout

### **BEFORE: Current Layout Structure**
```
┌─────────────────────────────────────────────────────────────┐
│                      NAVBAR                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                                                             │
│                  MAIN CONTENT                               │
│                  (Full Width)                               │
│                                                             │
│                                                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                      FOOTER                                 │
└─────────────────────────────────────────────────────────────┘
```

### **AFTER: Enhanced Layout with Right Sidebar**
```
┌─────────────────────────────────────────────────────────────┐
│                      NAVBAR                                 │
├─────────────────────────────────────┬───────────────────────┤
│                                     │                       │
│                                     │    📅 CALENDAR        │
│              MAIN CONTENT           │    ┌─────────────────┐ │
│              (Responsive Width)     │    │  Aug 2025       │ │
│                                     │    │ M T W T F S S   │ │
│   ┌─────────────────────────────┐   │    │     1 2 3       │ │
│   │   Hotel Search Results      │   │    │ 4 5 6 7 8 9 10 │ │
│   │   or Dashboard Content      │   │    │11 12 13 14 15   │ │
│   │   or Booking Management     │   │    │16 17 18 19 20   │ │
│   └─────────────────────────────┘   │    │21●22 23 24 25   │ │
│                                     │    └─────────────────┘ │
│                                     │                       │
│                                     │    ✅ TODOs           │
│                                     │    ┌─────────────────┐ │
│                                     │    │□ Check booking  │ │
│                                     │    │□ Review guests  │ │
│                                     │    │□ Update rooms   │ │
│                                     │    │□ Send invoices  │ │
│                                     │    │+ Add new todo   │ │
│                                     │    └─────────────────┘ │
├─────────────────────────────────────┴───────────────────────┤
│                      FOOTER                                 │
└─────────────────────────────────────────────────────────────┘
```

## Desktop Layout Specification

### **Screen Breakpoints:**
- **Desktop (≥1200px)**: Main content (70%) + Right sidebar (30%)
- **Tablet (768px-1199px)**: Main content (75%) + Right sidebar (25%)
- **Mobile (<768px)**: Right sidebar collapses to bottom drawer/modal

### **Right Sidebar Components:**

#### 1. **Calendar Widget**
```
┌─────────────────────────────────┐
│        📅 Calendar              │
├─────────────────────────────────┤
│         August 2025             │
│   Su Mo Tu We Th Fr Sa          │
│                   1  2          │
│    3  4  5  6  7  8  9          │
│   10 11 12 13 14 15 16          │
│   17 18 19 20 (21) 22 23        │  ← Today highlighted
│   24 25 26 27 28 29 30          │
│   31                            │
├─────────────────────────────────┤
│ • Check-in: Guest A (Room 101)  │  ← Events for selected day
│ • Check-out: Guest B (Room 205) │
│ • Maintenance: Room 301         │
└─────────────────────────────────┘
```

#### 2. **TODOs Widget**
```
┌─────────────────────────────────┐
│         ✅ My TODOs             │
├─────────────────────────────────┤
│ ☐ Review pending bookings (3)   │  ← Uncompleted
│ ☐ Update room availability      │
│ ☐ Send welcome emails           │
│ ☑ Process payment for Rm 204    │  ← Completed
│ ☑ Clean Room 105               │
├─────────────────────────────────┤
│ [+ Add new todo]                │  ← Add button
├─────────────────────────────────┤
│ Filter: [ All ▼] Sort: [Due ▼] │  ← Controls
└─────────────────────────────────┘
```

## User Role-Specific Content

### **For GUEST Users:**
**Calendar:** Personal bookings, upcoming trips
**TODOs:** Travel checklist, booking reminders

### **For HOTEL_ADMIN Users:**
**Calendar:** Hotel bookings, maintenance, staff schedules
**TODOs:** Administrative tasks, approvals, reports

### **For FRONTDESK Users:**
**Calendar:** Today's check-ins/check-outs, room status
**TODOs:** Daily tasks, guest requests, housekeeping

### **For ADMIN Users:**
**Calendar:** System events, tenant activities
**TODOs:** System maintenance, user approvals, reports

## Responsive Behavior

### **Desktop (≥1200px)**
- Fixed right sidebar (350px width)
- Main content adjusts to remaining space
- Both widgets fully expanded

### **Tablet (768px-1199px)**
- Collapsible right sidebar (300px width)
- Toggle button in navbar
- Compact widget layout

### **Mobile (<768px)**
- Right sidebar becomes bottom sheet/modal
- Accessible via floating action button
- Swipe gestures for navigation
- Tabs for Calendar/TODOs switching

## Interactive Features

### **Calendar Widget:**
- ✅ Click dates to view/add events
- ✅ Navigate months with arrow buttons
- ✅ Mini event indicators on dates
- ✅ Today highlighting
- ✅ Event popover on hover
- ✅ Quick add event button

### **TODOs Widget:**
- ✅ Check/uncheck todo items
- ✅ Add new todos with quick form
- ✅ Edit todos inline
- ✅ Delete todos with confirmation
- ✅ Filter by status (All/Pending/Completed)
- ✅ Sort by due date, priority, creation date
- ✅ Priority indicators (High/Medium/Low)

## Technical Implementation

### **Component Structure:**
```
EnhancedLayout.tsx
├── Navbar.tsx
├── MainContent.tsx
└── RightSidebar.tsx
    ├── CalendarWidget.tsx
    │   ├── CalendarHeader.tsx
    │   ├── CalendarGrid.tsx
    │   └── EventsList.tsx
    └── TodosWidget.tsx
        ├── TodosList.tsx
        ├── TodoItem.tsx
        ├── AddTodoForm.tsx
        └── TodoFilters.tsx
```

### **State Management:**
- Calendar events stored in backend with API endpoints
- TODOs stored in user preferences/database
- Real-time updates via WebSocket (future enhancement)
- Local storage for widget preferences

### **Styling:**
- Material-UI components for consistency
- Custom theme colors and spacing
- Responsive breakpoints using MUI system
- Smooth animations and transitions
- Dark/light theme support

## User Experience Flow

### **First-Time User Experience:**
1. User logs in → Enhanced layout loads
2. Welcome tooltip explains new sidebar
3. Calendar shows current month with no events
4. TODOs widget shows getting started checklist
5. User can immediately add their first todo/event

### **Daily Usage:**
1. User opens app → sees today's agenda at a glance
2. Quick check of pending todos
3. Add new todos/events without leaving current page
4. Calendar shows upcoming bookings/events
5. TODOs help track daily workflow

This enhanced layout provides a comprehensive workspace for users while maintaining the clean, professional look of the current application.
