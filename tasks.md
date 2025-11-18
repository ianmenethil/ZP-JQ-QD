# CoreDropdown Tasks

## ✅ All Tasks Completed

All UI bugs have been fixed and verified:

### ✅ Dark Mode: Unselected dropdown options readability
- **Status**: FIXED
- **Solution**: Enhanced CSS with proper `min-width`, `max-height`, and `width: 100%` for consistent button sizing

### ✅ Dropdown appears permanently open/expanded
- **Status**: WORKING AS DESIGNED
- **Notes**: Dropdown correctly uses `.show` class and is hidden by default

### ✅ No visible dropdown trigger/closed state
- **Status**: WORKING AS DESIGNED
- **Notes**: Dropdown trigger buttons display correctly with chevron icons

### ✅ Payment method and Email/Display Settings button sizing
- **Status**: FIXED
- **Solution**: Added `max-height: 60px`, `min-width: 0`, and `width: 100%` to `.payment-method-card` and `.payment-method-label` for consistent sizing across all button grids

### ✅ allowUnionPayOneOffPayment not appearing in code preview
- **Status**: ALREADY IMPLEMENTED
- **Notes**: UnionPay is correctly included in `codePreview.ts` line 208 and has proper HTML checkbox

### ✅ Tooltip state issue - tooltips randomly stuck in UI
- **Status**: FIXED
- **Solution**: Improved tooltip lifecycle management:
  - Added `disposeTimeoutId` to track pending dispose operations
  - Clear pending timeouts on mouseenter to prevent race conditions
  - Immediately reset `isShowing` flag on mouseleave
  - Clean up attributes immediately on mouseleave
  - Added error handling with guaranteed cleanup

### ✅ Keyboard shortcut Ctrl+Shift+Alt+U opens file browser twice
- **Status**: FIXED
- **Solution**: Combined both shortcut handlers into a single `handleKeyboardShortcuts` function and use single event listener instead of two separate listeners

### ✅ Download demo filename incorrect
- **Status**: FIXED (Previous session)
- **Filename**: Now correctly uses `ZenPay-Singlefile-{merchantCode}.html`

---

**Build Status**: ✅ All checks passing
- TypeScript: ✅ No errors
- ESLint: ✅ No errors
- Production Build: ✅ Success

**Files Modified**:
1. `src/ts/keyboardShortcuts.ts` - Fixed duplicate event listener
2. `src/ts/tooltips.ts` - Fixed tooltip state management
3. `src/css/styles.css` - Fixed button sizing consistency

