# CoreDropdown Tasks

## Bugs That Need to be Fixed

### Dark Mode: Unselected dropdown options hard to read due to transparent background
- When dropdown is open, selected button displays correctly with green background
- Unselected options have transparent/very faint background making text difficult to read
- Need better contrast for unselected options

### Both Modes: Dropdown appears permanently open/expanded
- Dropdown options are visible by default instead of hidden
- Should only show when user clicks the dropdown trigger button
- All 4 options (Make Payment, Tokenise, Custom Payment, Preauthorization) are always visible

### Both Modes: No visible dropdown trigger/closed state
- Missing the closed dropdown appearance (single button showing selected value)
- Should display a form-control style button with selected text and chevron icon
- Currently showing all options as if dropdown is permanently expanded

### Both Modes: Payment method buttons and Email/Display Settings buttons are not same size
- Payment Methods section has 8 buttons (Bank, PayTo, PayID, Apple Pay, Google Pay, Slice Pay, Save Card, UnionPay)
- Email Settings section has 2 buttons (Email Merchant, Email Customer)
- Display Settings section has 2 buttons (Hide Logo, Hide Terms)
- Button sizes are inconsistent between these sections

### Both Modes: allowUnionPayOneOffPayment not appearing in code preview when enabled
- When UnionPay payment method is toggled on, it does not show in the code preview
- Cannot verify if it's being included in the ZenPay payload
- Other payment methods appear correctly in code preview when enabled

### Both Modes: Tooltip state issue - tooltips randomly stuck in UI
- Tooltips occasionally remain visible/stuck on screen
- Only disappear when clicking something else
- Tooltip state not clearing properly on hover out or element change

### Both Modes: Keyboard shortcut Ctrl+Shift+Alt+U opens file browser twice
- File import keyboard shortcut triggers file browser to open twice
- Should only open once per key press
- Likely duplicate event handler or debouncing issue

### ✅ FIXED - Both Modes: Download demo filename incorrect
- ~~Current filename: `ZenPay_Tester_{merchantCode}.html`~~
- ~~Should be: `ZenPay-Singlefile-{merchantCode}.html`~~
- ~~Inline download button generates incorrect filename format~~
- **Fixed**: Now uses correct filename `ZenPay-Singlefile-{merchantCode}.html`
- **Bonus**: Download now generates from actual running app (no more Template.html maintenance)
- **Implementation**:
  - Browser download button in UI: Downloads to user's Downloads folder
  - Node.js script: `npm run generate:standalone -- --merchant=CODE --apiKey=key --username=user --password=pass`
  - Both methods produce identical standalone HTML with all assets inlined
  - No CORS errors, no dev mode references, clean output

## Changes That Are Required

