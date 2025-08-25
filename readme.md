feat: Implement evaluation and type controllers, routes, and global error middleware

- Added `type.controller.js` with CRUD operations and percentage validation for evaluation types
- Implemented `evaluation.controller.js` with self, peer, and supervisor evaluation handling
- Included NaN-safe calculation functions matching Civil Service scoring formula
- Created `type.routes.js` and `evaluation.routes.js` with RESTful endpoints
- Added `global.error.middleware.js` for centralized error handling with logging
- Ensured validation for section weights, level range (1-4), and consistent calculation logic
- Code matches project description requirements and Civil Service evaluation rules
