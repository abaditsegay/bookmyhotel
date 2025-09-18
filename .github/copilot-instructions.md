<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->
- [x] Verify that the copilot-instructions.md file in the .github directory is created.

- [x] Clarify Project Requirements - Multi-tenant hotel booking app with Spring Boot (Java 17+), React (TypeScript), MySQL 8, Docker

- [x] Scaffold the Project - Created directory structure, entities, multi-tenancy infrastructure, database migrations, Docker setup

- [x] Customize the Project - Created comprehensive multi-tenant hotel booking app with Spring Boot backend, React frontend, complete with authentication, payment processing, and observability

- [x] Install Required Extensions - No extensions needed for this multi-component project

- [x] Compile the Project - Backend compiles successfully with Maven, frontend dependencies installed with npm

- [x] Create and Run Task - Created Docker Compose task for development environment (requires Docker to be running)

- [x] Launch the Project - Project setup complete. Use Docker Compose to start all services: `docker-compose -f infra/docker-compose.yml up --build`

- [x] Ensure Documentation is Complete - README.md created with comprehensive setup and usage instructions

- [x] Use system-admin-tenant-management.spec e2e testing as a rference for future tests.

	 Make sure to write a modular and reusable code.
	 Follow best practices for code organization and structure.
	 Keep the code DRY (Don't Repeat Yourself) by reusing components and services where applicable.
	 Write unit tests for critical components and features to ensure reliability and facilitate future changes.
	 Document the codebase thoroughly, including API endpoints, data models, and business logic.
	 Ensure proper error handling and validation throughout the application.
	 Do not resort into using simpler approaches at the expense of code quality and maintainability.
	 Do not use simple approaches just for the sake of simplicity and fixing current issues.
	 Use absolute paths whenever running deployment commands.
