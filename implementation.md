Hub Screen — Central Dashboard
Purpose
The Hub is the root screen and the only navigation surface. Each widget represents a screen; tapping it pushes that screen onto the stack. There is no tab bar.
Visual Background (layered, bottom to top)

Starfield — scattered white/purple 1px dots across the upper sky area
Sky gradient — #04040C (top) bleeding through #0D0520 → #1a0533 → #3d0d5c → #8b1a6b → #c4386e → #f4937c (horizon), matching the retrowave sunset in the inspiration images
Retrowave sun — large circle, #ff8c42 → #ff6b35 → #ff2d9b gradient, lower half covered by horizontal #04040C stripe cutouts animating opacity — the classic synthwave sun stripe effect
City silhouette — jagged rooftop clip-path polygon in solid #04040C at the horizon, with tiny colored neon window dots in pink, cyan, purple
Animated perspective grid — pink #ff2d9b grid lines scrolling upward from the bottom edge, masked to fade in from midpoint down (gridMove keyframe, 1s linear infinite)
Rain drops — 16 thin 1px vertical lines in pink and purple falling at varying speeds/opacities through the upper sky

Header

Greeting line: ようこそ — welcome back — 9px, purple #a78bfa, uppercase, letter-spacing 3px, neon text-shadow
App title: BudgetAI — 28px bold white, AI in neon pink #ff2d9b with pulsing titlePulse glow animation (keyframe oscillating text-shadow intensity)
Date line: APRIL 2026 — 9px, dim white rgba(255,255,255,0.28), uppercase, letter-spacing 2px

Widget Grid Layout
2-column grid, gap: 10px, inside padding: 50px 14px 20px content area:
WidgetColumnsAspect ratioBudgetFull width (1 / -1)2.1 / 1ExpensesHalf1 / 1RevenueHalf1 / 1OverviewFull width (1 / -1)2.1 / 1ScanHalf1 / 1AccountHalf1 / 1
Widget Structure (each widget, layered)
Each widget is border-radius: 20px, overflow: hidden, with these layers:

Background scene — SVG illustration rendered via react-native-svg, unique per widget, resizeMode: cover
Dark scrim — linear-gradient(160deg, rgba(4,4,12,0.55), rgba(4,4,12,0.3), rgba(4,4,12,0.7)) — ensures text readability over any scene
Neon glow border — 1.5px solid in accent color, pulsing box-shadow / shadow* props animation
Data overlay — position: absolute, bottom: 0 (or top for Account), padding 13px, containing label + number + details + pill

Widget Background Scenes (SVG art via react-native-svg)
Budget — Tokyo neon street:

Background: #080012 → #150228 → #200840 → #0f0420 → #05010e
Diagonal rain Line elements in #a78bfa and #ff2d9b at 0.3–0.5px width, 20–30% opacity
3 building Rect blocks with small window Rect children lit in pink, cyan, purple
Horizontal street glow Line elements in pink at bottom

Expenses — Great Wave:

Background: #020818 → #041428 → #062040 → #083060 → #0a4070
3 layered wave Path elements in #0a3a5a, #0d4a70, #1060a0 at varying opacity (0.4–0.7)
Wave foam: thin curved Path strokes in #48cae4 and #90e0ef
Star Circle dots near top in white at 0.5–0.7 opacity

Revenue — Mountain sunset:

Background: #04040C → #0d0520 → #3d0d5c → #8b1a6b → #c4386e → #f4937c
Sun: Circle cx=center cy=55, r=32, with #ff8c42 → #ff2d9b radial gradient + horizontal stripe Rect cutouts in #04040C covering lower 50% (animated opacity with sunStripe keyframe)
Mountains: Polygon elements in #0a0520 and #130730
Palm tree: Line trunk + curved Path fronds in #04040C

Overview — City panorama:

Background: #080012 → #12002a → #200040 → #300060 → #1a0035
Grid lines: horizontal and vertical Line elements in #a78bfa at 0.15–0.2 opacity, 0.4px stroke
Buildings: Rect elements with colored window Rect children in pink, cyan, purple
Ground reflection: Ellipse elements in #a78bfa and #ff2d9b at 0.1–0.15 opacity at bottom

Scan — Neon rocket:

Background: #030010 → #0a0025 → #120035 → #080018
Rocket body Path outline in #00f0ff, 1.8px stroke
Porthole Circle in #00f0ff
Fin Path triangles in #ff2d9b
Flame Path in #f59e0b, 2px rounded stroke
Concentric halo Circle elements at 0.1–0.2 opacity
Horizontal scan laser Line in #00f0ff

Account — Neon flamingo:

Background: #0a0010 → #1a0030 → #2d0050 → #1a0030
Flamingo body Path outline in #ff2d9b, 1.8px stroke, with pulsing drop-shadow / shadow animation
Head Circle + beak Path in #ff2d9b
Wing detail Path at 0.5 opacity
Concentric Ellipse halos in pink and purple at 0.1–0.15 opacity
Ground reflection Line in #ff2d9b at 0.3 opacity

Widget Data Overlays
Budget (full width):

Label: BUDGET — 8px, #ff2d9b, uppercase, letter-spacing 2.5px, neon text-shadow
Left side: $1,240 in 24px bold white + subtitle of $1,500 · April in 9px muted white
Right side: 83% in 18px bold #ff2d9b with strong neon glow + subtitle 12 days left
Progress bar: 2px height track, #ff2d9b fill with glow, width = % of budget used
Pill badge: Food over budget · -$42 — pink background tint, pink border, 8px bold

Expenses (half):

Label: EXPENSES in cyan
Primary: $348 in 24px bold white
Subtitle: this week
Divider: 1px rgba(255,255,255,0.12)
3 rows: category name (muted) + amount (white bold), 9px

Revenue (half):

Label: REVENUE in green #39ff9a
Primary: $2,100 in 24px bold green with neon glow
Subtitle: this month
Divider
Last entry row: source + green amount
Pill: Salary · Apr 1

Overview (full width):

Label: OVERVIEW in purple
Left: subtitle Net P&L · April + +$860 in 24px bold green neon
Right: two stat columns — Earned $2,100 (green) and Spent $1,240 (pink), separated by a 1px vertical divider

Scan (half):

Label: SCAN in cyan
Primary: Receipt in 17px bold white
Subtitle: last scanned item + amount (e.g. Last: Subway $12.50)
Pill: Tap to scan

Account (half) — data at TOP, not bottom:

Label: ACCOUNT in purple (at top)
Avatar circle: 32px diameter, #ff2d9b → #a78bfa gradient, white initials, purple shadow glow
Username in 17px bold white
Subtitle: current month


UI & Visual Design
theme.js (create in Phase 0)
js// theme.js — import this in every screen and component
export const theme = {
  colors: {
    // Backgrounds
    background: '#07070F',      // void black — app background
    surface: 'rgba(255,255,255,0.04)',  // widget / card fill
    surfaceModal: '#0F0F1A',    // modal and bottom sheet background
    border: 'rgba(255,255,255,0.08)',   // default subtle border

    // Neon accents (use per-widget or for semantic meaning)
    neonPink: '#ff2d9b',        // budget, overview, danger, over-budget
    neonCyan: '#00f0ff',        // expenses, photo, info
    neonPurple: '#a78bfa',      // revenue, account, neutral accent
    neonGreen: '#39ff9a',       // positive P&L, under-budget, income

    // Text
    text: '#FFFFFF',            // primary text
    textMuted: 'rgba(255,255,255,0.45)',  // secondary / labels
    textDim: 'rgba(255,255,255,0.2)',     // placeholder / disabled

    // Semantic (map to neons)
    success: '#39ff9a',         // positive values
    danger: '#ff2d9b',          // negative values, over-budget
    warning: '#f59e0b',         // approaching limit
    income: '#39ff9a',          // revenue amounts
    expense: '#ff2d9b',         // expense amounts
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    sm: 8,
    md: 14,
    lg: 20,
    widget: 20,
    full: 999,
  },
  font: {
    xs: 10,
    sm: 11,
    md: 13,
    lg: 15,
    xl: 20,
    xxl: 28,
    hero: 36,
    weight: {
      regular: '400',
      medium: '500',
      bold: '600',
    },
  },
  glow: {
    // Use as React Native shadow props + border combos
    pink:   { shadowColor: '#ff2d9b', shadowOffset: {width:0,height:0}, shadowOpacity: 0.7, shadowRadius: 10 },
    cyan:   { shadowColor: '#00f0ff', shadowOffset: {width:0,height:0}, shadowOpacity: 0.7, shadowRadius: 10 },
    purple: { shadowColor: '#a78bfa', shadowOffset: {width:0,height:0}, shadowOpacity: 0.7, shadowRadius: 10 },
    green:  { shadowColor: '#39ff9a', shadowOffset: {width:0,height:0}, shadowOpacity: 0.7, shadowRadius: 10 },
  },
}
Shared components (create in Phase 0)
All in a /components folder:

HubBackground.js — starfield + animated grid floor, used as absolute background on every screen
NeonCard.js — widget-style card with glow border, accepts accentColor prop
NeonButton.js — full-width button with neon border + glow, accepts color prop
NeonInput.js — dark surface text input with neon focus border
AmountText.js — colored amount (green for positive, pink for negative), accepts value prop
ScreenHeader.js — screen title bar with back chevron, consistent across all inner screens
SectionLabel.js — small uppercase letter-spaced section label in accent color

Inner screen styling rules
Every screen pushed from the Hub must follow these rules:

Same #04040C void background with HubBackground component (starfield + grid) behind content
ScreenHeader at top: screen name in white bold, ‹ back chevron in neon pink, no native navigation header
Cards and modals: rgba(8,4,20,0.75) background, border-radius: 12px, 1px neon border in the screen's accent color
All money values use AmountText — green for positive/income, pink for negative/expense, never plain Text
Buttons use NeonButton — neon border + glow, never plain TouchableOpacity with inline styles
Text inputs use NeonInput — dark surface, neon accent border on focus

Per-screen accent colors and background scenes
Each inner screen extends its widget's aesthetic into a full-screen layout:
ScreenAccentBackground sceneBudgetPink #ff2d9bTokyo neon street — dark purple atmosphere, rain streaks, purple city grid, perspective grid at bottomExpensesCyan #00f0ffGreat Wave — ocean blue wave layers visible behind content, subtle starfield aboveRevenueGreen #39ff9aMountain sunset — retrowave sun + mountain silhouettes at bottom of screenOverviewPurple #a78bfaCity panorama — vertical/horizontal purple grid lines, building silhouettes with neon windowsScanCyan #00f0ffNeon rocket — rocket outline glowing behind scan frame area, deep space backgroundAccountPurple #a78bfaNeon flamingo — flamingo outline glowing behind avatar, deep magenta atmosphere
Inner screen layout patterns
Budget screen:

Full-screen background: dark purple city scene with rain animation
Chat FlatList with message bubbles: user messages right-aligned, rgba(255,45,155,0.15) background, pink border; AI messages left-aligned, rgba(167,139,250,0.12) background, purple border
AI label above each AI bubble: BudgetAI in 8px purple uppercase
Text input bar at bottom: dark rounded pill, placeholder in dim white, send button as pink circle with arrow icon

Expenses screen:

Tab pill selectors at top: Table / Calendar / Breakdown — active tab in cyan with glow, inactive in dim white
Table view: NeonCard per expense row with category color dot, amount right-aligned
Calendar view: react-native-calendars with custom vaporwave theme — pink dots on days with expenses, cyan today highlight
Breakdown view: react-native-chart-kit bar chart with neon colors per category
Add expense FAB: cyan circle button with + in bottom-right corner

Revenue screen:

Total card: green neon amount at top, source breakdown bars (bar width proportional to amount, green for salary, purple for freelance)
Recent entries list: NeonCard rows with source name, date, green amount

Overview screen:

3-stat grid card: P&L (green), Earned (green), Spent (pink)
Bar chart: one bar per category, green for under-budget, pink for over-budget, with legend
Month selector: left/right chevrons with current month label

Scan screen:

Scan frame: centered square with corner bracket indicators in cyan, scan laser line animating top to bottom
Camera + library buttons as NeonButton below frame
Parsed result card: cyan border, merchant name + amount + category pre-filled
Confirm button: full-width cyan NeonButton

Account screen:

Avatar: 44px gradient circle centered, pink glow shadow animation
Name + member-since subtitle centered
Info card: purple border, rows for current month, basic info status (complete/incomplete), remember-me toggle
Logout button: full-width, pink border, rgba(255,45,155,0.08) background

Login screen:

Same vaporwave background as Hub (starfield + sky gradient + sun + grid)
App title BudgetAI centered with pink neon glow — hero moment
NeonInput fields for username and password
NeonButton for Log In (pink) and Create Account (purple outline)
Remember me toggle in purple


Build Order (Recommended)
Phase 0 — Foundation + design system (45 min)

Stack navigation shell: HubScreen as root, all other screens as empty placeholders
Create theme.js with full vaporwave color/spacing/glow system
Create /components folder with all shared components listed above
Implement HubBackground (starfield + animated grid) — test it renders correctly
Build the Hub widget grid with placeholder data (no AsyncStorage yet)
Verify tapping each widget navigates to the correct placeholder screen
Gate: Hub renders with background, all 6 widgets visible, all navigate correctly, hot reload works

Phase 1 — Expense tracker, table view (45 min)

Add expense modal using NeonInput, NeonButton, category picker
AsyncStorage persistence under key expenses_[username]
FlatList using NeonCard per entry
Filter by category using pill selectors in neon cyan
Hub Expenses widget reads live data from AsyncStorage and shows real weekly total
Gate: Add 3 expenses, kill app, reopen — all 3 persist. Hub widget updates. Filter works.

Phase 2 — Revenue screen (20 min)

Add revenue modal, same pattern as expenses
AsyncStorage under revenue_[username]
Total card at top using AmountText in neon green
Hub Revenue widget shows real monthly total
Gate: Add 2 entries, total correct, persists, hub widget updates.

Phase 3 — Overview screen (30 min)

Load expenses + revenue, compute P&L
Bar chart using react-native-chart-kit with neon pink/green colors
Over-budget categories flagged in neon pink
Hub Overview widget shows real P&L
Gate: Numbers correct. Chart renders. Hub widget reflects real data.

Mini UI pass — lock the design language (30 min)

Open simulator, walk every screen
Fix spacing, font sizes, glow intensities, modal padding
Verify the hub background animation is smooth (not janky)
Confirm all AmountText, NeonButton, NeonCard components are used consistently — no inline color overrides
Gate: Phases 0–3 look cohesive and intentional. Screenshots could pass for a real app.

Phase 4 — Budget screen (60 min)

Manual per-category budget entry using NeonInput fields
Wire OpenRouter AI chat: message bubbles styled as dark cards, user messages right-aligned in neon pink, AI messages left-aligned in neon purple
Conversation history preserved across messages
Basic info saved to user profile in AsyncStorage
Hub Budget widget reads real budget data: amount used, progress bar, days left
Gate (manual): Budget persists, hub widget updates. Gate (AI): Follow-up references prior context.

Phase 5 — Auth (45 min)

Login screen: same vaporwave background, NeonInput fields, NeonButton
App title "BudgetAI" as hero text with neon pink glow on login screen
AuthContext wrapping app, local AsyncStorage auth
"Remember me" toggle in neon purple
Logout from Account screen, returns to login
Namespace all AsyncStorage keys by username
Hub Account widget shows real username + avatar initials
Gate: Two separate accounts with separate data. Remember me works. Logout works.

Phase 6 — Expense tracker, calendar + breakdown tabs (45 min)

Tab pills at top of Expense screen (Table / Calendar / Breakdown) styled in neon cyan
react-native-calendars with custom theme matching vaporwave palette — pink dots on days with expenses
Tap day → animated slide-down panel showing that day's expenses
Breakdown tab: category totals + react-native-chart-kit pie chart in neon colors
Gate: Dots on correct dates. Tap expands/collapses with animation. Breakdown totals match table.

Phase 7 — Photo screen (45 min)

expo-image-picker camera + library buttons styled as NeonButton
Compress image via expo-image-manipulator before base64 encoding
OpenRouter vision call with response_format: { type: "json_object" }
Parsed values pre-populate a NeonInput form
Graceful fallback: non-receipt → blank form + neon pink error message
Hub Scan widget shows last scanned item name + amount
Gate: Receipt photo populates form. Fallback works. Saved expense appears in tracker. Hub widget updates.

Phase 8 — Final polish + submission (30 min)

Audit every screen: consistent glow intensities, no hardcoded colors outside theme.js
Test empty states (no expenses yet, no budget set, no revenue) — each should show a styled empty state message, not a blank screen
Test long text (long usernames, long expense notes) — no overflow
End-to-end persistence test across all screens