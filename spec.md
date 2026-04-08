Budgeting App

Features:
Log in and account Screen
Budget Screen
Expense Tracker Screen
Revenue Screen
Overview Screen
Photo Screen

Log in and Account:
Function to create an account and log in with that account
App will remember your information every time you log in (will have the option to remember users so that you don’t have to log in every single time you open the app)
Also have log out functionality 

Tech for login and account: AsyncStorage + React Context
Implementation: No real backend needed — accounts are stored locally as a JSON object in AsyncStorage (keyed by username, storing hashed password + profile data). A React Context (AuthContext) wraps the whole app and exposes login, logout, currentUser. On app launch, it checks AsyncStorage for a saved session token — if found, skips the login screen entirely ("remember me"). Logout clears that token. 

Budget Mode:
Connection to OpenRouter OpenAI GPT 4o mini API
At the start of every month (or throughout the month) you will have to option to create your budget for the month
This will open a chat mode where you talk with OpenAI GPT 4o mini to plan your budget together (should be chat back and forth/interactive not just Q&A)
Prompt you to describe your situation (professional status (student, working professional, retired, etc)
What your main purchases are (food, commuting, clothing, luxury, etc)
Your income if any
The above information is described as basic information section (app will remember this information based on the account → once inputted once won’t have to input again → every time you click create budget for the month it will ask you if your basic information changed at all → if yes you will go through the conversation again, if no it will move onto the next questions
Goal for the month (more spending, less spending, etc)
Any special situations you expect throughout the month (trips, big purchases, etc)
Chat will give you realistic suggestions for spending based on that preliminary information
You can then edit to what you would like
Will output a budget overview and breakdown based on expense type

Tech for budget screen: Tech: OpenRouter API → GPT-4o mini, React Native chat UI (FlatList of message bubbles), AsyncStorage for basic info persistence
Implementation: No backend needed — you call OpenRouter directly from the app (API key stored in a .env file via expo-constants). The chat is a FlatList of {role, content} message objects. You maintain the full conversation history in state and send it with every API call (standard multi-turn chat pattern). Basic info (profession, income, expense types) is saved to AsyncStorage under the user's account so it's pre-loaded next session. The system prompt instructs GPT-4o mini to act as a budget planner and guide the conversation. 

Expense Tracker Screen:
You will be able to track and add your expenses each day
Add to specific expense type
Track date, amount, etc
Give you table option (lists out all the expenses using SQL query)
Can filter by amount, date, expense type, etc
Give you calendar option (view all your expenses in a calendar view)
The calendar view will have day, week, month options
Can click into specific day to zoom into those expenses (should have zoom in effect)
Expense breakdown tab (total spending and type breakdown for the day, week, month)

Tech for expense screen: AsyncStorage (as a local DB), FlatList, react-native-calendars library
Implementation: Expenses stored as a JSON array in AsyncStorage — each entry has {id, date, amount, category, note}. Three tabs (Table / Calendar / Breakdown) implemented with a simple tab state variable switching between three sub-components. Table view uses a filtered/sorted FlatList — filtering is done in JS (no actual SQL, despite the "table" feel). Calendar view uses the react-native-calendars library which has built-in day/week/month modes and dot markers; tapping a day filters the expense list below it. Breakdown tab aggregates by category using .reduce().

Revenue screen:
Track your revenue and where it came from 

Tech for revenue screen: Same pattern as Expense Tracker — AsyncStorage, FlatList
Implementation: Nearly identical data model to expenses: {id, date, amount, source, note}. Since it mirrors the expense tracker, the agent can largely reuse the same component structure. The main difference is the category list (Salary, Freelance, Gift, etc. instead of Food, Transport, etc.).

Overview screen:
Gives you a full breakdown of budget, expenses, revenue. Net spending, net p&l, etc

Tech for overview screen: react-native-chart-kit or victory-native for charts, computed aggregations from AsyncStorage data
Implementation: On mount, loads all expenses + revenue + budget from AsyncStorage, computes: total spent, total earned, net P&L, budget remaining per category, over/under budget flags. Displays as summary cards + a pie/bar chart. react-native-chart-kit is the easiest charting library for Expo.

Photo screen:
You have the option to take a photo of a receipt
OpenAI 4o mini will parse through the receipt and try to upload that information to expense tracker
You will fill in the details the AI was not able to fill in

Tech for photo screen: expo-image-picker, OpenRouter API (GPT-4o mini vision), form UI
Implementation: expo-image-picker opens the camera or photo library. The selected image is converted to base64 and sent to OpenRouter with a prompt like "Parse this receipt and return JSON with: date, total, items array with name/price/category." The returned JSON pre-populates an expense entry form. The user reviews, fills gaps, and confirms — which writes to the expense AsyncStorage. The vision capability requires GPT-4o mini (not all OpenRouter models support image input).






Tech Stack

Framework: React Native + Expo SDK 54
Navigation: React Navigation (Stack + Bottom Tab)
Local Storage: AsyncStorage (@react-native-async-storage/async-storage)
Auth: Local-only (AsyncStorage-backed, React Context)
AI Chat & Vision: OpenRouter API → GPT-4o mini
**When you implement the OpenRouter API just use a placeholder key and I will input my own key later
Charts: react-native-chart-kit
Calendar: react-native-calendars
Camera / Photos: expo-image-picker
Environment Variables: expo-constants + .env
State Management: React Context (Auth) + local useState/useEffect per screen


Navigation Structure
App
├── AuthStack (if not logged in)
│   └── LoginScreen
└── MainTabs (if logged in)
    ├── Tab: Budget
    ├── Tab: Expenses
    ├── Tab: Revenue
    ├── Tab: Overview
    └── Tab: Photo




Success Criteria & Agent Testing Protocol
Per-Phase Acceptance Gates
The agent must verify each gate before moving to the next phase. If a gate fails, fix it before proceeding — never carry a broken phase forward.
Phase 0 gate: App launches on simulator with no errors. All 6 tabs are tappable and show a placeholder screen. Hot reload works (change text, save, see it update without restarting).
Phase 1 gate: Add 3 expenses with different categories and dates. Kill the app completely. Reopen — all 3 are still there. Filter by category — only the matching ones appear.
Phase 2 gate: Add 2 revenue entries. Total card at the top shows the correct sum. Kill and reopen — entries persist.
Phase 3 gate: With expenses and revenue already added, navigate to Overview. All numbers are arithmetically correct (manually verify: total revenue − total spent = displayed P&L). Chart renders without crashing.
Phase 4 gate (manual budget): Set a monthly budget with per-category amounts. Navigate away and back — values persist. Phase 4 gate (AI chat): Send a message, receive a response. Send a follow-up — the AI remembers context from the first message (not stateless).
Phase 5 gate: Create account A, add an expense. Log out. Create account B, add a different expense. Log out. Log back into A — only A's expense appears, not B's. Enable "remember me", kill app, reopen — lands directly on main tabs without login screen.
Phase 6 gate: Add expenses on 3 different dates. Calendar view shows dots on those dates and no other dates. Tap a date with expenses — list expands. Tap again — collapses.
Phase 7 gate: Take a photo of any receipt (or a photo of a printed receipt on your screen). Parsed values appear in the form pre-filled. Submit — expense appears in the Expense Tracker. Test failure path: take a photo of something that's not a receipt — app shows blank form with error message, does not crash.

After implementing each phase, perform the following tests before moving on:

1. Run `npx expo start` and confirm the app loads without any red error screen.
2. For any screen that reads from AsyncStorage: add data, 
   use Cmd+Shift+H to home the simulator, reopen the app, 
   and confirm data is still present.
3. For any screen that calls an external API: log the full 
   request and response to the console. Confirm the response 
   is being parsed correctly before building UI around it.
4. After every new screen: navigate to every OTHER screen 
   and confirm they still work (no regressions).
5. If a test fails, fix it before proceeding to the next phase.
6. Never suppress errors with try/catch without also displaying 
   a user-visible error message.
