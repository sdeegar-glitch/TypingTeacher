# backend.md

## Executive Summary  
This document outlines a detailed backend implementation plan for a modern typing-learning and speed-testing web app. The stack includes Node.js with Express.js for the API, Supabase (Postgres) for database and auth, and Tailwind CSS for front-end styling. We target feature parity with TypingClub (lessons, badges, stars, progress) plus FastFingers-style speed tests, including exam-specific tests (e.g. SSC, RRB). Core backend responsibilities include user authentication/authorization, test management, result scoring, leaderboards, and admin control. For example, Supabase provides built-in authentication that issues JWT access and refresh tokens to clients【12†L75-L79】, and its Realtime API can push updates for live leaderboards【38†L80-L85】. Our design leverages Supabase’s RBAC features (custom JWT claims for roles)【57†L75-L84】 and Postgres best practices for schema design (e.g. lowercase table names with underscores【58†L217-L224】).  

## Requirements  
- **User Authentication:** Use Supabase Auth. Support sign-up, login, password reset, optional OAuth (Google/GitHub), with email verification. Store minimal user profile. Implement role-based access (e.g. `user`, `admin`) via Supabase custom claims【57†L75-L84】 or a `role` column.  
- **User Roles / RBAC:** Enforce permissions with Supabase Row-Level Security (RLS) and JWT claims. Admins can manage tests and users; regular users can only read tests, submit results, and view their own data. Use a `user_role` claim in JWT (e.g. `"user_role": "admin"`)【57†L75-L84】.  
- **Test Management:** Support many typing tests/exercises. Each test has metadata (title, content passage, duration, difficulty, language, exam type). Include exam-specific tests (Indian government exam passages) stored in DB. Tests can be created/edited/deleted by admins via API.  
- **Typing Sessions & Scoring:** Implement endpoints to create a “test session” when a user takes a test. Calculate **Gross WPM** and **Net WPM**. (Gross WPM = (totalChars/5)/minutes; Net WPM = Gross WPM – (errors/min)【14†L95-L100】.) Track `errors`, `accuracy` (100 * (1 – errors/keystrokes)), correct words, etc. E.g. if 300 chars in 1 min: 300/5 = 60 Gross WPM; 3 errors → Net 57【14†L95-L100】. Store raw results for analysis.  
- **Leaderboards and History:** Maintain a global or filtered leaderboard (e.g. by test or exam type). Leaderboards update when new scores arrive (can use Supabase Realtime subscriptions【38†L80-L85】). Track each user’s test history and earned badges for display in their profile.  
- **Achievements (Badges/Stars):** Award badges or stars for milestones (e.g. high speed, accuracy, streaks). A `badges` table with criteria (e.g. “100 WPM Achiever”). Grant badges when users meet criteria, record in user_badges table.  
- **Admin Dashboard:** Admin-only routes to manage tests (CRUD), exam categories, users (view/disable), and badges. Possibly audit logs of changes.  
- **Security:** Enforce HTTPS, rate-limit API requests. Use Helmet for headers. Validate/sanitize all inputs. Never expose raw Supabase service key.  
- **Logging & Auditing:** Optionally use Postgres triggers or the pgAudit extension for an audit log of key actions (e.g. test creation, user deletion). Log errors.  
- **Storage:** Use Supabase Storage for any static assets (e.g. images/icons for badges or lesson media)【44†L94-L102】.  
- **Testing:** Include unit tests for business logic and integration tests hitting Supabase (using its test CLI). Follow best practices: isolate tests with transactions, test all RLS policies and roles【47†L887-L896】【47†L899-L902】.  
- **Documentation & Deployment:** Provide OpenAPI/Swagger spec. Automate deployment (e.g. GitHub Actions with Supabase CLI). CI pipeline runs DB migrations and tests (e.g. `supabase start` + `supabase test db`)【47†L879-L884】.  

## Architecture  
We propose an MVC-style Express.js API layered with controllers and models (or service modules). Incoming HTTP requests hit **routes** (Express Router) that map URL + HTTP verb to a controller function【40†L270-L279】. Controllers validate input and call data-access **models** (using Supabase client). The general flow is shown below.  

Routes/controller separation (MDN): *“Routes forward supported requests (and any info in the URL) to the appropriate controller functions. Controller functions get data from the models, create a response, and return it.”*【40†L242-L251】. For example, the image below sketches a test-taking flow: user submits keystrokes → controller computes WPM → model stores result → controller returns analytics.  

【40†L242-L251】【29†L53-L59】 As MDN notes, routes should map HTTP methods (GET/POST/PUT/DELETE) to handlers【40†L270-L279】. The Express app will be organized into router modules (e.g. `/auth`, `/tests`, `/sessions`, `/users`, `/admin`). Middleware will enforce authentication (verifying Supabase JWT) and role checks.  

【54†embed_image】 *Figure: Conceptual flow of request handling (e.g. `/test_sessions` creation) through Express routes and controllers【40†L242-L251】.*  

At startup, the server connects to Supabase (via `@supabase/supabase-js`) to query the Postgres DB. Tests of longer duration could optionally emit realtime updates via Supabase’s Realtime if we want live WPM updates, but initial MVP can poll final results. Leaderboards can use `supabase.from('test_sessions').on('INSERT', …)` to push updates【38†L80-L85】.  

## Data Model  

| **Table**       | **Columns (type)**                                                  | **Constraints**                            | **Example Row**                                            |
|-----------------|---------------------------------------------------------------------|--------------------------------------------|------------------------------------------------------------|
| **users**       | `id (UUID)`, `email (TEXT)`, `name (TEXT)`, `created_at (TIMESTAMP)`, `role (TEXT)` | PK `id`; `email` unique; role ∈ {user,admin} | id=`123e4567...`, email=`alice@example.com`, role=`user`     |
| **exam_types**  | `id (SERIAL)`, `name (TEXT)`                                         | PK `id`                                   | id=1, name=`SSC CGL Tier 1`                                 |
| **tests**       | `id (SERIAL)`, `exam_type_id (INT)`, `title (TEXT)`, `content (TEXT)`, `duration (INT)`, `difficulty (TEXT)`, `language (TEXT)`, `created_by (UUID)` | PK `id`; FK `exam_type_id`→`exam_types.id`; FK `created_by`→`users.id` | id=10, exam_type_id=1, title=`SSC Essay Practice`, duration=300, difficulty=`Moderate` |
| **test_sessions** | `id (SERIAL)`, `user_id (UUID)`, `test_id (INT)`, `started_at (TIMESTAMP)`, `duration (INT)`, `gross_wpm (INT)`, `net_wpm (INT)`, `errors (INT)`, `accuracy (REAL)` | PK `id`; FK `user_id`→`users.id`; FK `test_id`→`tests.id` | id=55, user_id=`123e4567...`, test_id=10, gross_wpm=75, net_wpm=70, errors=2, accuracy=96.4 |
| **badges**      | `id (SERIAL)`, `name (TEXT)`, `description (TEXT)`, `criteria (TEXT)` | PK `id`                                   | id=3, name=`100 WPM Club`, criteria=`net_wpm >= 100`         |
| **user_badges** | `id (SERIAL)`, `user_id (UUID)`, `badge_id (INT)`, `awarded_at (TIMESTAMP)` | PK `id`; FK `user_id`→`users.id`; FK `badge_id`→`badges.id` | id=20, user_id=`123e4567...`, badge_id=3, awarded_at=`2026-05-10` |

*Notes:* We use lowercase with underscores for names (per Supabase guidelines【58†L217-L224】). Data types use PostgreSQL standards (`UUID`, `SERIAL`, `TEXT`, `TIMESTAMP`, etc.)【58†L222-L230】【58†L243-L252】. Additional tables could include audit logs or custom permission tables if needed (see Supabase RBAC examples【57†L114-L120】).  

## API Specification  

Below are key Express endpoints (implementing REST conventions【40†L270-L279】). Authenticated routes check Supabase JWT. Admin-only routes require `role=admin`. JSON is used for all bodies/responses.

- **POST** `/auth/signup` – Create new user (email/password). *Req:* `{email, password}`. *Resp:* `{user_id, email}` or error. (Internally uses Supabase Auth.)  
- **POST** `/auth/login` – User login. *Req:* `{email, password}`. *Resp:* `{accessToken, refreshToken, user}` on success. (Tokens from Supabase【12†L75-L79】.)  

- **GET** `/tests` – List available tests. *Resp:* `[{id, title, exam_type, duration, difficulty}]`.  
- **GET** `/tests/:id` – Get test details. *Resp:* `{id, title, content, duration, difficulty, exam_type}`.  
- **POST** `/tests` – **Admin only**. Create a test. *Req:* `{title, content, duration, difficulty, exam_type_id}`. *Resp:* created test record.  
- **PATCH** `/tests/:id` – **Admin only**. Update test metadata/content. *Req:* `{title?, content?, duration?}`, etc. *Resp:* updated fields.  
- **DELETE** `/tests/:id` – **Admin only**. Delete a test.

- **POST** `/test_sessions` – Submit test results. *Req:* `{user_id, test_id, duration, gross_wpm, net_wpm, errors, accuracy}`. *Resp:* `{session_id, gross_wpm, net_wpm, accuracy}`. *Example:* 
  ```json
  // Request
  { 
    "user_id": "123e4567-e89b-12d3-a456-426614174000", 
    "test_id": 10, 
    "duration": 300, 
    "gross_wpm": 80, 
    "net_wpm": 75, 
    "errors": 2, 
    "accuracy": 96.5 
  }
  // Response
  {
    "session_id": 55,
    "gross_wpm": 80,
    "net_wpm": 75,
    "accuracy": 96.5
  }
  ```  
- **GET** `/test_sessions/:id` – Retrieve detailed results for a session. *Resp:* full record including timestamps.

- **GET** `/users/:id/history` – Get user’s test history. *Resp:* `[{session_id, test_id, net_wpm, accuracy, date}]`.  
- **GET** `/leaderboard?exam_type=SSC` – Top scores leaderboard (optionally filter by exam type). *Resp:* `[{rank, user, net_wpm, date}]`. We can sort by best net_wpm.

- **GET** `/badges` – List badge definitions.  
- **GET** `/users/:id/badges` – List badges earned by user.

- **GET/POST/PATCH/DELETE** `/admin/users` – Admin endpoints to list users, disable accounts, etc.  
- **GET/POST/PATCH/DELETE** `/admin/tests` – Admin test management (alternative route).

These endpoints are examples; actual REST design should follow best practices (use appropriate status codes, error messages)【40†L242-L251】【40†L270-L279】. Authentication can be checked via middleware (decode Supabase JWT, enforce RLS policies).

## Security and Authorization  
- **JWT and Claims:** Use Supabase Auth JWT for stateless security. Embed a `user_role` claim in the token (e.g. `"user_role":"admin"` or `"user_role":"user"`) using a Supabase Auth Hook【57†L75-L84】. The server checks this claim or RLS policies to allow/deny operations (e.g. only `admin` can call DELETE /users).  
- **RLS (Row-Level Security):** Enable RLS on tables in Supabase. For example, `test_sessions` SELECT should only return sessions for the current user (using `auth.uid()` in policy). Admin role can bypass or use separate policy.  
- **Input Validation:** Sanitize all inputs. For example, use parameterized queries or the Supabase client (which auto-escapes) to prevent SQL injection. Enforce length limits, e.g. no test content > 10,000 chars.  
- **HTTPS:** Deploy behind HTTPS (automatically enforced by host or use SSL certificates).  
- **CORS:** Restrict CORS to the known frontend domain.  
- **Rate Limiting:** Use `express-rate-limit` to throttle endpoints (e.g. max 100 requests/min per IP) to prevent abuse.  
- **Secrets Management:** Store Supabase service key and any API credentials in environment variables, not in code.  
- **File Access:** If using Supabase Storage for assets, set bucket policies to public/private as needed. User avatars or uploaded content can be private with signed URLs.  
- **Audit Logging:** Use Postgres triggers or pgAudit extension (Supabase supports `pgaudit`) to log sensitive changes (e.g. new admin user, test deletion) for compliance. 

## Testing Strategy  
Follow industry best practices for backend testing【47†L887-L896】【47†L899-L902】:

- **Unit Tests:** Write tests for individual controller logic (e.g. WPM calculation, accuracy computation). Use Jest or Mocha with Sinon.  
- **Database/Integration Tests:** Use Supabase CLI for local testing. Each test suite can run inside a transaction and roll back to ensure isolation【47†L887-L896】. Seed test data for users, tests, and simulate various scenarios (admin actions vs normal user).  
- **RLS/Permission Tests:** Specifically test that RLS and role-based rules are enforced. For example, attempt a forbidden query (user listing for non-admin) and assert it fails. Test with different JWT roles. This aligns with Supabase advice on testing different roles and failure cases【47†L887-L896】.  
- **CI Integration:** Automate tests in a pipeline. For example, a GitHub Action can use `supabase/setup-cli`, run `supabase start`, apply migrations, then run `supabase test db` or call Jest for the Node API【47†L879-L884】. Ensure tests run on every PR and fail the build if issues are found【47†L899-L902】.  
- **Performance/Load:** Optionally simulate high load (e.g. JMeter or Artillery) to ensure API scales (rate-limit heavy endpoints).  

## Deployment Steps  
1. **Database Provisioning:** Set up a Supabase project. Define your Postgres schema via SQL migrations (`supabase migrate` or SQL editor). Use lowercase table names (e.g. `test_sessions`) as recommended【58†L217-L224】.  
2. **Environment Config:** In deployment (e.g. Heroku, Vercel, AWS), configure environment variables: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, JWT secret (if separate), etc.  
3. **CI/CD Pipeline:** Example GitHub Action: 
   - Use `supabase/setup-cli@v1` to install CLI.  
   - On push to main: run `supabase start` to launch local Postgres, then apply migrations (`supabase db push`), then run backend tests (`npm test`). A snippet from Supabase docs:  
     ```yaml
     - uses: supabase/setup-cli@v1
     - run: supabase start
     - run: supabase test db
     ``` 
   (This demonstrates automated DB testing)【47†L879-L884】.  
4. **Hosting:** Deploy the Express app to your chosen host (e.g. Heroku, AWS Elastic Beanstalk, or a container on Docker/Kubernetes). Ensure it can connect to the Supabase DB (allow the host’s IP if needed or use managed network).  
5. **Monitoring:** Enable logs (console or a logging service). Monitor DB errors in Supabase dashboard. Use a health check endpoint (`GET /health`) for uptime.  

## Roadmap and Effort Estimate  
Prioritized development milestones (approximate effort in developer-days):

| **Milestone**                      | **Tasks**                                           | **Effort (dev-days)** |
|------------------------------------|-----------------------------------------------------|-----------------------|
| 1. Project & DB Setup              | Initialize Node repo; connect to Supabase; design DB schema; initial migrations | 5d      |
| 2. Auth & User Management          | Implement signup/login (Supabase); user model & profiles; roles setup | 7d      |
| 3. Core Test API                   | Create tests table and CRUD routes (GET/POST/PATCH/DELETE) | 6d     |
| 4. Typing Session & Scoring        | Build `/test_sessions` endpoints; implement WPM/error logic【14†L95-L100】; store results | 5d     |
| 5. Leaderboard & History           | Develop leaderboard query (SQL view); user history endpoint | 4d      |
| 6. Badges & Achievements           | Design badges table; award logic; `/badges` endpoints | 3d      |
| 7. Admin Functions                 | Admin user management (list/delete); admin test CRUD | 4d      |
| 8. Security & Policies             | Add RLS policies; auth middleware; rate limiting; input validation | 5d     |
| 9. Testing & CI/CD                 | Write tests (unit & integration); set up GitHub Actions with Supabase CLI【47†L879-L884】 | 5d      |
| 10. Deployment & Monitoring        | Deploy to production; set env, monitor; tweak configs | 3d      |
| **Total**                          |                                                     | **47d** (≈2 months)    |

This timeline is a rough guide. Tasks may overlap (e.g. frontend can begin before all backend APIs done). All source code and docs should be version-controlled. The described plan covers all required features and uses Supabase/Postgres best practices【58†L217-L224】【57†L75-L84】.  

# frontend.md

## Executive Summary  
This document specifies the frontend design and implementation plan for the typing learning platform using modern UI practices. We will use Tailwind CSS for styling and a component-based JavaScript framework (e.g. React/Vue) for interactivity. The UI will mirror TypingClub’s engaging, gamified style【32†L82-L90】 and include FastFingers-like speed test functionality. Key pages include user and admin dashboards, test-taking interface, results analytics, leaderboards, and profiles. For example, TypingClub emphasizes an *“engaging and interactive experience”* with *“levels, badges and stars”* to motivate learning【32†L82-L90】, and our UI will similarly use badges, progress bars, and live feedback. FastFingers adds competitive elements; we will include live score displays (e.g. a real-time WPM gauge【29†L53-L59】). Accessibility is a priority – TypingClub markets itself as “the most accessible typing program available”【32†L97-L101】, so we’ll ensure high-contrast text, ARIA labels, and keyboard support.  

## Requirements & User Flows  
- **Authentication:** Pages for Login and Signup. After login, redirect to user Dashboard.  
- **Public Home/Landing:** Describe benefits (learn typing, exam practice). May show sample courses.  
- **Dashboard (User):** Summary of user stats: total tests taken, best WPM, badges earned, etc. List of available tests by category (e.g. “English Practice”, “SSC Exam Tests”). Leaderboard section (e.g. top scores among friends or global). History of recent test results.  
- **Typing Test Page:** Central interactive component. Shows passage or word list. Highlights current word/letter as user types. Errors are marked in red in real-time. Displays a timer if timed. Live metrics (Gross WPM) update each keystroke, final Net WPM shown upon submit. Must include a **Submit** button to end test early.  
- **Result Page:** After submission, show detailed analytics: Gross/Net WPM, accuracy, errors count, time taken, and a chart or suggestions (e.g. “Focus on words you miss often”). Possibly a chart of speed over time (minute by minute).  
- **Leaderboards Page:** Shows rankings by net WPM for different tests or in total. Tabs for Overall and per-exam leaderboards.  
- **Profile Page:** (Optional) Shows user’s profile (name, email, etc.), badges earned, historical high scores, preferences.  
- **Dashboard (Admin):** Accessible only to admins. Pages to **Manage Tests** (form to add new test, list existing tests with edit/delete) and **Manage Users** (list of users, roles, ability to deactivate). Possibly a “Reports” view of usage stats.  

## Components List  
Key UI components (Tailwind CSS classes used for layout and styling):

- **Navbar/Header** – Responsive top nav with links (Home, Dashboard, Leaderboards, Profile, Admin if role).  
- **Footer** – Basic site info.  
- **TestCard** – Displays a test’s title, type (exam?), difficulty, button to start.  
- **TypingArea** – The core test component. Contains:
  - `<p class="typing-sentence">` with words. The *current word* can be wrapped in `<span class="bg-blue-100 underline">`, **correct letters** in green, **wrong letters** in red (Tailwind classes like `text-green-600` / `text-red-600`).  
  - Timer display (`<span class="timer px-2">`), Stats (`WPM`, `errors`).  
  - **Submit** Button: e.g. `<button class="bg-blue-500 text-white rounded px-4 py-2">Submit</button>`.  
- **ResultChart** – Chart or gauge. Example: use a `<canvas>` or SVG for speed-over-time. For a gauge, use an image or D3.  
- **LeaderboardTable** – Table listing ranks. Styled with Tailwind table classes.  
- **Badge** – Icon + name. Grid of user’s badges on profile.  
- **UserForm** – (Admin) Form inputs (Tailwind `input`, `select`, `button`) for creating/editing tests or users.  
- **Alerts/Modals** – For confirmations (e.g. “Delete test?”). Use Tailwind `bg-red-100 border-red-500`.  
- **Animations/Microinteractions:** Transitions on key focus, button hover (`hover:bg-blue-600`), subtle shake on error words (`animate-shake`), smooth progress bar transitions for leaderboards.

## Pages and Routes (wireframe table)  

| **Page**                | **Route**           | **Components**                   | **Notes/Wireframe**                                  |
|-------------------------|---------------------|----------------------------------|------------------------------------------------------|
| Landing/Home            | `/`                 | Navbar, HeroBanner, FeaturesGrid | Hero: tagline & CTA. Show TypingClub-like badges/goals. |
| Login / Signup          | `/login`, `/signup` | AuthForm, AuthCard               | Simple form. Tabs for login/signup toggle.            |
| User Dashboard          | `/dashboard`        | StatsPanel, TestCardGrid, LeaderboardPreview | StatsPanel (Total tests, best speed). Grid of TestCards. Preview of leaderboard or progress.  |
| Exam/Test Listing       | `/tests`            | TestCardGrid, FilterControls     | List all tests (cards) with filter by exam type & difficulty. |
| Typing Test             | `/tests/:id`        | TypingArea, StatsDisplay         | Passage or words displayed. Highlight current word. Submit button at bottom. |
| Test Result             | `/results/:id`      | StatsDisplay, ResultChart, SuggestionBox | Show WPM, accuracy, chart of speed over time (bar chart). Suggestions text.   |
| Leaderboard            | `/leaderboard`       | LeaderboardTable, Tabs           | Tabs for Overall / by-exam. Table of top users.      |
| Profile                | `/profile`          | BadgeGrid, HistoryList          | Show badges earned, list of previous high scores.   |
| Admin - Users          | `/admin/users`      | UserTable, RoleToggle, DisableBtn | Table of users (email, role). Buttons to change role or deactivate. |
| Admin - Tests          | `/admin/tests`      | TestTable, EditFormModal        | Table of tests with edit/delete. “Add Test” button opens form. |

Each page should be mobile-responsive (use Tailwind’s responsive utilities). Navigation should collapse into a hamburger menu on small screens. Use accessible HTML (semantic tags, ARIA labels).  

## Core Interaction Snippet  
Below is a simplified Tailwind HTML snippet for the typing test interface, illustrating how text highlighting could be done:  

```html
<div class="p-4">
  <div class="typing-sentence text-lg leading-relaxed">
    <!-- Correct letters in green, wrong letters in red, current word highlighted -->
    <span class="text-green-600">hello</span> 
    <span class="text-red-600 bg-pink-100">worlf</span>
    <span class="bg-blue-100 underline">ignores</span> the text ...
  </div>
  <div class="mt-4 flex justify-between items-center">
    <span class="text-sm">Time: <span id="timer">02:15</span></span>
    <button class="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded" onclick="submitTest()">
      Submit
    </button>
  </div>
</div>
```

In this snippet: the *current word* has a light-blue background and underline, correctly typed words are green, and mistyped words are red (Tailwind classes). The **Submit** button uses a blue color and hover effect.  

## UI/UX Design Suggestions  
- **Color Palette:** Use a modern and energetic palette. For example: a deep indigo (e.g. `#4F46E5` Tailwind `indigo-600`) as primary, a bright amber (`#F59E0B` amber-500) accent for highlights/badges, and neutral grays (`gray-100`/`gray-800`) for text/background. Ensure sufficient contrast (WCAG AA). For error state, use a strong red (`red-600`).  
- **Typography:** Clean sans-serif fonts (e.g. `font-sans`); use a monospaced font (e.g. `font-mono`) for code or data elements if needed. Ensure legible sizes (base text `text-base` or `text-lg` for sentences).  
- **Microinteractions:** Animate transitions: e.g., when a word is typed correctly, fade its color to green (`transition-colors duration-300`). On errors, animate a brief shake (`animate-shake`). Button presses darken background. Loading states (spinner) for async actions.  
- **Imagery:** Incorporate thematic imagery. For example, a **vintage typewriter** or keyboard photo can reinforce the typing theme. As TypingClub does, we can visually celebrate achievements. An example image is shown below.  
- **Accessibility:** Follow a checklist:
  - Ensure all buttons/inputs are focusable and have `:focus` styles.
  - Provide ARIA labels or hidden text for icons (e.g. a trophy icon = `aria-label="badge"`).
  - Contrast: Text on colored buttons should have >4.5:1 contrast. (Use Tailwind’s accessible color classes or tweak opacity.)
  - Keyboard navigation: Users must be able to navigate the test interface with Tab (start from input area). 
  - Screen readers: Use semantic HTML (`<button>`, `<table>`, `<th>`, etc.). For dynamic content (like updating WPM), use `aria-live` regions.  
  - Responsive text: Ensure the typing text does not overflow off-screen; wrap words.  
  - Referencing TypingClub’s emphasis on accessibility【32†L97-L101】, aim for a design that works for users with diverse needs.  

【32†L82-L90】 TypingClub emphasizes game-like interactivity and motivation. For example, incorporating badges and progress bars keeps learners engaged. Below is a motivational image evocative of the typing theme:  

【32†L97-L101】 *Figure: Typing-related imagery can reinforce the learning theme (e.g. the typewriter image below). Accessibility features (like clear labels and high contrast) should match industry standards.*  
【21†embed_image】 *Figure: Example of thematic imagery (a person at a vintage typewriter).*  

## Gamification & Visuals  
- **Levels and Badges:** Just as 10FastFingers uses a points/levels system to motivate users【20†L80-L84】, our UI will display earned badges and a progress level (e.g. level up when total minutes typed reaches a threshold). For example, an infographic might show a stair-step of levels, as sketched below.  
- **Speed Visualization:** For live feedback, a gauge or progress bar can show current speed. An AnyChart tutorial shows a linear gauge chart for a typing speedometer【29†L53-L59】. We could similarly display real-time WPM on a horizontal gauge. See the example below (with net WPM after test completion).  
- **Embeds:**  

【20†L80-L84】 *Figure: 10FastFingers motivates users with points and levels earned over time【20†L80-L84】.* 【23†embed_image】 *Figure: The platform’s “Points, Levels & Progress” infographic inspires a similar gamification UI (illustrative).*  

【29†L53-L59】 *Figure: Interactive speedometer gauge example from AnyChart. A similar linear gauge could display live or final WPM to users.* 【31†embed_image】 *Figure: Example of a real-time typing speed gauge (net WPM) on a laptop screen.*  

## Component Wireframes (Sketch)  
- **Typing Test:** See above HTML snippet; design as a clean card with large text area for passage. The current word is highlighted. Underneath, show stats (`<span class="text-xs">Gross: 80 WPM, Errors: 2</span>`).  
- **Result Analytics:** Show two columns – left: chart (e.g. line or bar chart of speed over time), right: key stats (WPM, accuracy) with recommendations in a colored box. Use Tailwind charts library (e.g. Tailwind CSS charts, D3, or static SVG).  
- **Leaderboards:** Tabbed UI (`Overall`, `By Exam`). Use a sortable table. Highlight current user’s row.  
- **Admin Forms:** Form fields styled with `border`, `p-2`, `rounded`. Example:  
  ```html
  <input type="text" class="border rounded px-2 py-1 w-full" placeholder="Test title">
  <textarea class="border rounded px-2 py-1 w-full" rows="4"></textarea>
  <button class="bg-green-500 hover:bg-green-600 text-white px-4 py-2">Save Test</button>
  ```  

## Accessibility Checklist  
- [x] Use semantic HTML elements (`<button>`, `<table>`, `<nav>`).  
- [x] Provide `aria-label` or visible text for icons/buttons.  
- [x] Ensure keyboard focus styles (outline or ring on focused element).  
- [x] Maintain >4.5:1 contrast for text. (Tailwind’s default text classes on `bg-white` already meet this.)  
- [x] Dynamic updates (e.g. timer, WPM) within an `aria-live="polite"` region.  
- [x] Form fields have `<label>`.  
- [x] Alt text for images (our example images would have descriptive alt text).  
- [x] Large clickable areas (buttons at least 44×44px).  
- [x] Responsive font sizes and text wrapping.  

With this plan, the frontend will deliver a modern, intuitive, and accessible UI. The embedded components and snippets illustrate the core interactions, and the included images highlight our design inspiration (interactive gauges and game-like elements)【20†L80-L84】【29†L53-L59】【32†L82-L90】. Each page and component should be implemented with Tailwind utility classes for consistency and easy theming.

