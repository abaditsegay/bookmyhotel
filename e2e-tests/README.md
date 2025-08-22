# System Admin E2E Testing with Playwright

This directory contains comprehensive End-to-End (E2E) testing for the System Admin workflows in the BookMyHotel application using Playwright.

## 📁 Directory Structure

```
e2e-tests/
├── README.md                          # This documentation
├── playwright.config.ts               # Playwright configuration
├── auth/
│   └── system-admin.setup.ts         # Authentication setup for admin
├── fixtures/
│   └── testData.ts                    # Centralized test data
├── pages/
│   ├── BasePage.ts                    # Base page object model
│   ├── AdminDashboardPage.ts          # Admin dashboard interactions
│   ├── HotelRegistrationsPage.ts      # Hotel registration management
│   ├── UserManagementPage.ts          # User management operations
│   └── HotelManagementPage.ts         # Hotel management operations
├── tests/
│   └── system-admin.spec.ts           # System admin test suite
├── utils/
│   └── (utility functions as needed)
└── test-results/                      # Generated test results and reports
```

## 🎯 Test Coverage

### System Admin Dashboard
- ✅ Dashboard statistics display
- ✅ Navigation between sections
- ✅ Recent activities viewing
- ✅ Data refresh functionality

### Hotel Registration Management
- ✅ View registration requests
- ✅ Filter by status (PENDING/APPROVED/REJECTED)
- ✅ Search registrations
- ✅ Refresh functionality
- 🔄 Approve registrations (requires test data)
- 🔄 Reject registrations (requires test data)

### User Management
- ✅ View users list
- ✅ Filter by role and status
- ✅ Search users
- ✅ Refresh functionality
- 🔄 Create new users (requires test data)
- 🔄 Edit existing users (requires test data)

### Hotel Management
- ✅ View hotels list
- ✅ Filter by status
- ✅ Search hotels
- ✅ Refresh functionality
- 🔄 Update hotel status (requires test data)
- 🔄 View hotel details (requires test data)

### Integration Workflows
- ✅ Navigation between all admin sections
- ✅ Data consistency across sections

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 16+ installed
- BookMyHotel application running locally
- System admin account configured

### Installation
1. Install Playwright and dependencies:
```bash
npm install -D @playwright/test
npx playwright install
```

2. Configure environment variables (if needed):
```bash
# Create .env file in project root
BASE_URL=http://localhost:3000
API_BASE_URL=http://localhost:8080
```

### Configuration
The `playwright.config.ts` file includes:
- Multi-browser testing (Chromium, Firefox, WebKit)
- Web server integration for local development
- Authentication dependencies
- Test output configuration
- Retry settings

## 🚀 Running Tests

### Run all System Admin tests
```bash
npx playwright test e2e-tests/tests/system-admin.spec.ts
```

### Run specific test suites
```bash
# Dashboard tests only
npx playwright test e2e-tests/tests/system-admin.spec.ts -g "Dashboard Operations"

# Hotel registration tests only
npx playwright test e2e-tests/tests/system-admin.spec.ts -g "Hotel Registration Management"

# User management tests only
npx playwright test e2e-tests/tests/system-admin.spec.ts -g "User Management"
```

### Run with specific browser
```bash
# Chrome only
npx playwright test --project=chromium

# Firefox only
npx playwright test --project=firefox

# Safari only
npx playwright test --project=webkit
```

### Run in headed mode (visible browser)
```bash
npx playwright test --headed
```

### Run in debug mode
```bash
npx playwright test --debug
```

## 📊 Test Reports

### Generate HTML Report
```bash
npx playwright show-report
```

### View Test Results
- Test results are saved in `test-results/` directory
- Screenshots and videos are captured on failure
- HTML report provides detailed test execution details

## 🏗️ Page Object Model Architecture

### BasePage.ts
Common functionality for all pages:
- Navigation helpers
- Wait utilities
- Error handling
- API response waiting

### AdminDashboardPage.ts
Dashboard-specific interactions:
- Statistics retrieval
- Navigation to other sections
- Recent activities
- Data refresh

### HotelRegistrationsPage.ts
Hotel registration management:
- Registration listing and filtering
- Approval/rejection workflows
- Search functionality
- Status management

### UserManagementPage.ts
User administration:
- User creation and editing
- Role and status management
- Search and filtering
- User operations

### HotelManagementPage.ts
Hotel administration:
- Hotel listing and filtering
- Status updates
- Details viewing
- Management operations

## 📝 Test Data Management

The `testData.ts` file contains:
- System admin credentials
- Test hotel registrations
- Test user data
- API endpoints
- Validation patterns
- Configuration settings

### Test Data Structure
```typescript
export const SYSTEM_ADMIN = {
  email: 'admin@bookmyhotel.com',
  password: 'admin123',
  firstName: 'System',
  lastName: 'Administrator',
  role: 'ADMIN'
};

export const TEST_HOTEL_REGISTRATIONS = [
  // Multiple hotel registration test cases
];

export const TEST_USERS = [
  // Various user types for testing
];
```

## 🔧 Configuration Options

### Playwright Configuration (`playwright.config.ts`)
- **Timeout**: 30 seconds per test
- **Retries**: 2 retries on CI, 0 locally
- **Workers**: 1 worker to avoid conflicts
- **Browsers**: Chromium, Firefox, WebKit
- **Screenshots**: On failure
- **Video**: On first retry

### Test Data Configuration
- Base URLs for frontend and backend
- Timeout settings for different operations
- Retry configurations
- Validation patterns

## 📋 Test Development Guidelines

### Adding New Tests
1. Use the existing page object models
2. Follow the established naming conventions
3. Include proper assertions and error handling
4. Use test data from `testData.ts`
5. Add appropriate test tags and descriptions

### Page Object Best Practices
1. Use data-testid attributes for element selection
2. Implement proper waiting strategies
3. Create reusable methods for common operations
4. Handle both success and error scenarios
5. Maintain consistency with existing patterns

### Test Data Management
1. Use centralized test data from fixtures
2. Avoid hardcoded values in tests
3. Include cleanup procedures where needed
4. Use realistic test data
5. Consider data dependencies between tests

## 🔍 Debugging Tests

### Common Issues
1. **Element not found**: Check data-testid attributes
2. **Timeout errors**: Increase wait times or improve selectors
3. **Authentication failures**: Verify admin credentials
4. **API response delays**: Add proper API waiting

### Debug Techniques
1. Use `--headed` mode to watch test execution
2. Add `await page.pause()` for breakpoints
3. Use `console.log()` for debugging information
4. Check network tab for API responses
5. Verify element visibility with browser devtools

## 🚦 Test Status Legend

- ✅ **Implemented and Working**: Test is fully functional
- 🔄 **Requires Test Data**: Test logic is complete but needs data setup
- ❌ **Not Implemented**: Test is planned but not yet created
- 🚧 **In Progress**: Test is being developed

## 📞 Support

For questions or issues with the E2E testing setup:
1. Check the existing test documentation
2. Review the page object model implementations
3. Verify the test data configuration
4. Consult the Playwright documentation
5. Review the application's data-testid attributes

## 🔄 Future Enhancements

1. **Data Setup**: Automated test data creation and cleanup
2. **Visual Testing**: Screenshot comparison tests
3. **Performance Testing**: Page load and API response time tests
4. **Accessibility Testing**: WCAG compliance checks
5. **Mobile Testing**: Responsive design validation
6. **API Testing**: Direct API endpoint validation
7. **Cross-Environment**: Testing across different environments

---

This E2E testing framework provides comprehensive coverage of System Admin workflows with a maintainable, modular architecture that can be easily extended for additional test scenarios.
