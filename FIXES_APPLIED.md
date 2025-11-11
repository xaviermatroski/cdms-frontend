# Frontend Fixes Applied

## Issues Fixed

### 1. EJS Syntax Error - Reserved Keyword "case"
**Error:** 
```
Unexpected token 'case' in D:\Study\7thSem\CS540\Project\cdms-frontend\views\cases\detail.ejs while compiling ejs
```

**Root Cause:** 
The variable name `case` is a reserved JavaScript keyword. When EJS compiles templates, it treats `case` as a JavaScript keyword, causing syntax errors.

**Solution:**
- Changed all references from `case` to `caseData` in:
  - `controllers/casesController.js` - Updated render call to pass `caseData` instead of `case`
  - `views/cases/detail.ejs` - Replaced all `case.*` references with `caseData.*`

**Files Modified:**
1. `controllers/casesController.js` - Line ~155: Changed `case: caseData` to `caseData: caseData`
2. `views/cases/detail.ejs` - All occurrences of `case` replaced with `caseData`

---

### 2. Undefined User Object in Error Handling
**Error:**
```
Cannot read properties of undefined (reading 'role')
```

**Root Cause:**
In `casesController.js` showCreateForm error handler, `req.session.user` might be undefined, causing "Cannot read properties of undefined (reading 'role')" when the layout tries to access `user.role`.

**Solution:**
- Updated error handler to pass `user: req.session.user || {}` to ensure user object always exists
- This prevents undefined errors when accessing user properties in the view

**Files Modified:**
1. `controllers/casesController.js` - Line ~73: Changed `user: req.session.user` to `user: req.session.user || {}`

---

## Testing

After these fixes, the following should work:
1. ✅ Create a case - Should redirect to detail view without syntax errors
2. ✅ View case details - Should display all case information correctly
3. ✅ Delete a case - Should work without errors
4. ✅ Error pages - Should display without "Cannot read properties of undefined"

## Technical Notes

- Reserved keywords in JavaScript that should NOT be used as variable names in EJS:
  - `case`, `switch`, `default`, `if`, `else`, `for`, `while`, `do`, `try`, `catch`, `finally`, etc.

- When using EJS templates, always use non-reserved names for data variables to avoid compilation errors

- In Express.js error handlers, always provide fallback values for optional session/user data:
  ```javascript
  user: req.session.user || {}
  ```
