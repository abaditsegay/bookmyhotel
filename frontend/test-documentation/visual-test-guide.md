# Visual Test Guide - BookMyHotel E2E Tests

**Generated:** October 1, 2025  
**Purpose:** Quick visual reference for test execution and results  

## Test Execution Videos

### 📹 Available Video Recordings

All test executions are recorded in `.webm` format and stored in the `test-results/` directory. Each video provides a complete walkthrough of the test execution from start to finish.

#### How to View Videos

```bash
# Navigate to frontend directory
cd /Users/samuel/Projects2/bookmyhotel/frontend

# Open video files (macOS)
open test-results/*/video.webm

# Alternative: Use VLC or other video player
vlc test-results/*/video.webm
```

### 🎬 Test Video Catalog

#### 1. System Admin Tenant Management
**File:** `test-results/system-admin-tenant-manage-*/video.webm`  
**Duration:** ~24 seconds  
**Content:**
- Login process with admin credentials
- Navigation to system admin dashboard
- Tenant management interface
- Creating new tenant "Test Hotel"
- Verification of successful tenant creation

**Key Moments:**
- 0:00-0:05 - Homepage and login navigation
- 0:05-0:10 - Authentication process
- 0:10-0:15 - Admin dashboard access
- 0:15-0:20 - Tenant creation form
- 0:20-0:24 - Successful tenant verification

#### 2. Basic Application Tests
**File:** `test-results/basic-*/video.webm`  
**Duration:** ~3 seconds  
**Content:**
- Homepage loading verification
- Navigation element checks
- Basic UI component validation

**Key Moments:**
- 0:00-0:01 - Homepage load
- 0:01-0:02 - Navigation verification
- 0:02-0:03 - Component validation complete

## Interactive Traces

### 🔍 Debugging with Playwright Traces

Interactive traces provide step-by-step execution details, network requests, DOM snapshots, and debugging information.

#### How to View Traces

```bash
# View specific trace file
npx playwright show-trace test-results/system-admin-tenant-manage-*/trace.zip

# View trace for basic tests
npx playwright show-trace test-results/basic-*/trace.zip
```

#### What Traces Include

- **DOM Snapshots:** Before and after each action
- **Network Activity:** All HTTP requests and responses
- **Console Logs:** JavaScript console output
- **Screenshots:** Visual state at each step
- **Action Timeline:** Detailed step-by-step execution
- **Performance Metrics:** Timing and resource usage

### 📊 Trace Analysis Features

When viewing traces in the Playwright trace viewer, you can:

1. **Step Through Actions**
   - See each click, type, navigation action
   - View DOM state before and after each action
   - Inspect element selectors used

2. **Network Analysis**
   - View all API calls made during test
   - Check request/response headers and bodies
   - Identify slow or failed network requests

3. **Console Debugging**
   - See JavaScript errors or warnings
   - View custom debug logging
   - Check for performance issues

4. **Visual Inspection**
   - Screenshots at each major step
   - Hover effects and element highlighting
   - Responsive design validation

## Screenshots Collection

### 📸 Automated Screenshot Capture

Screenshots are automatically captured at key test points:

- **Test Start:** Initial application state
- **After Login:** Successful authentication
- **Page Navigation:** Each major page transition
- **Form Submission:** Before and after form actions
- **Test Completion:** Final state verification
- **Test Failure:** Error state for debugging

#### Screenshot Naming Convention

```
test-results/[test-name]-[browser]/
├── test-passed-1-[screenshot-name].png
├── test-passed-2-[screenshot-name].png
└── test-failed-1-[screenshot-name].png (if test fails)
```

## Test Asset Organization

### 📁 Directory Structure

```
frontend/test-results/
├── basic-homepage-loads-successfully-chromium/
│   ├── video.webm
│   ├── trace.zip
│   └── trace/
├── basic-navigation-elements-are-present-chromium/
│   ├── video.webm
│   ├── trace.zip
│   └── trace/
└── system-admin-tenant-manage-[hash]-chromium/
    ├── video.webm
    ├── trace.zip
    └── trace/
```

### 🏷️ File Naming Patterns

- **Videos:** Always named `video.webm`
- **Traces:** Always named `trace.zip`
- **Test Directories:** Include test name and browser
- **Timestamp Hash:** Added to prevent overwrites

## Quick Access Commands

### 🚀 One-Command Access

```bash
# View latest tenant management test video
open test-results/system-admin-tenant-manage-*/video.webm

# Open latest trace for debugging
npx playwright show-trace test-results/system-admin-tenant-manage-*/trace.zip

# View all available test results
ls -la test-results/

# Clean old test results
rm -rf test-results/*
```

### 🔄 Re-running Tests with Fresh Assets

```bash
# Run tests and generate fresh videos/traces
npx playwright test --trace=on --video=on

# Run specific test with fresh assets
npx playwright test system-admin-tenant-management.spec.ts --trace=on --video=on

# Run in headed mode for live viewing
npx playwright test --headed --trace=on
```

## Test Result Analysis

### ✅ Success Indicators in Videos

When viewing test videos, look for:

- **Smooth Navigation:** No hanging or error pages
- **Form Completion:** All fields filled correctly
- **Success Messages:** Confirmation dialogs or notifications
- **Data Persistence:** New data appearing in lists
- **Clean UI:** No broken layouts or missing elements

### ❌ Failure Indicators in Videos

Signs of test issues in videos:

- **Stuck Loading:** Pages that don't finish loading
- **Empty Forms:** Fields that don't accept input
- **Missing Elements:** Buttons or links that don't appear
- **Error Pages:** 404, 500, or other error responses
- **JavaScript Errors:** Console error messages visible

### 🐛 Using Videos for Debugging

Video recordings are invaluable for:

1. **Visual Debugging:** See exactly what the test saw
2. **Timing Issues:** Identify elements that load slowly
3. **User Experience:** Understand the actual user flow
4. **Regression Testing:** Compare current vs previous behavior
5. **Bug Reports:** Provide visual evidence for developers

## Best Practices for Test Asset Review

### 📋 Review Checklist

When analyzing test results:

- [ ] **Video Playback:** Watch full test execution
- [ ] **Trace Analysis:** Check network requests and console
- [ ] **Screenshot Review:** Verify UI state at key points
- [ ] **Performance Check:** Monitor execution timing
- [ ] **Error Investigation:** Look for JavaScript errors
- [ ] **Data Validation:** Confirm data persistence

### 🎯 Focus Areas

**For Passing Tests:**
- Verify expected behavior
- Check for performance regressions
- Validate UI/UX quality
- Monitor for warning messages

**For Failing Tests:**
- Identify exact failure point
- Check network request status
- Look for JavaScript errors
- Verify test data availability
- Validate element selectors

---

**Asset Location:** `/Users/samuel/Projects2/bookmyhotel/frontend/test-results/`  
**Supported Formats:** .webm (video), .zip (traces), .png (screenshots)  
**Retention:** Assets persist until manually cleaned or overwritten  