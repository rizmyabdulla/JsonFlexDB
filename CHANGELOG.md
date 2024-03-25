# JsonFlexDB Change Log

All notable changes to this project will be documented in this file.

## [2.1.0] - 2024-03-25

### Added

- Validation support for `insert`, `update`, `findOne`, and `find` methods against provided schema.

### Changed

- Improved error messages for validation failures.

## [2.0.0] - 2024-01-19

### Added

- More detailed doc comments for better understanding of methods.
- Improved error handling for robustness.
- Enhanced async/await support for methods.
- Visualization method for console logging data.

### Changed

- Simplified API to improve usability.
- Enhanced method names for clarity.
- Updated documentation for better user guidance.
- Optimized large-scale data handling.

### Fixed

- Fixed an issue with duplicate entries in indexes.
- Resolved issues with specific update and find operations.
- Addressed errors related to undefined or null objects.

## [1.2.0] - 2024-01-18

### Added

- New method: `findOne(query)` for finding a single document based on a query.
- New method: `getAutoIncrementId()` for getting the next available auto-incremented ID.

### Fixed

- Minor Bugs.
- README.md typos.

## [1.0.0] - 2024-02-18

### Added

- Initial release of JsonFlexDB.
