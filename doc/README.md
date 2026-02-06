# EquiHire Documentation

Welcome to the EquiHire Core documentation. This folder contains detailed information about the system architecture, API reference, and specific workflows.

## Table of Contents

1.  **[System Overview/Introduction](./introduction.md)**: Detailed problem, solution, **Architecture Diagram**, and roadmap.
2.  **[Getting Started](./getting-started.md)**: Installation and setup guide.
3.  **[Identity Lifecycle](./identity-lifecycle.md)**: Detailed flow of Authentication, Sign-up, and Magic Link Invitations using Asgardeo.
4.  **[API Reference](./api-endpoints.md)**: List of available HTTP and WebSocket endpoints.

## Project Structure

-   `ballerina-gateway`: The core orchestrator.
-   `python-ai-engine`: The intelligence layer responsible for PII Redaction (BERT) and Analytics.
-   `react-frontend`: The dashboard for Recruiters.
