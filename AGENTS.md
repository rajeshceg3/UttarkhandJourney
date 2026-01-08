# Agent Instructions

This repository is maintained with high standards. Any changes must adhere to the following protocols:

1.  **Code Style**: Follow the ESLint configuration. No console logs in production code.
2.  **Testing**: All utility functions must have unit tests.
3.  **Security**:
    -   Do not use `innerHTML` with untrusted data.
    -   Maintain Content Security Policy (CSP).
4.  **Performance**:
    -   Lazy load images where possible.
    -   Minimize bundle size.
5.  **Documentation**: Update README.md if architectural changes are made.
