# TaskIt V1 Technical Blueprint

Date: 23 March 2026
Status: Approved planning baseline for implementation

## 1) Product Scope Locked

This document reflects the confirmed V1 decisions:

1. Multi-user application with isolated user data.
2. Login page is public; all other app pages are protected.
3. Auth abstraction from day one with Google OAuth and email/password fallback.
4. No mandatory email verification in V1.
5. Minimal dark UI with globally consistent theme behavior on all pages.
6. Theme is switchable with multiple curated dark presets.
7. Responsive web required; baseline PWA included now.
8. Core object types: tasks, habits, events.
9. Gamification: streaks, XP, levels, badges.
10. Notifications included.
11. Recurrence supports weekday patterns and end conditions.
12. Soft delete with trash and restore.
13. Timezone-aware scheduling and streak computation.
14. Profile customization and preferences pages included.

## 2) System Architecture

## 2.1 Backend

- Framework: Spring Boot (existing project stack).
- Security: JWT access + refresh tokens.
- Auth provider abstraction layer:
  - Local password provider.
  - OAuth provider adapter (Google initially).
  - Extensible for future providers.
- Data ownership: every domain record includes userId.
- Time model:
  - Store all instants in UTC.
  - Keep user timezone in profile/preferences.
  - Compute day boundaries and streaks in user timezone.
- Soft delete:
  - Use deletedAt for recoverable domain entities.
  - Exclude soft-deleted records by default.

## 2.2 Frontend

- Framework: React + Vite (existing project stack).
- State and data:
  - Auth/session state in app-level store.
  - Entity caches for tasks/habits/events.
  - Offline queue state for pending writes.
- Routing:
  - Public auth layout for login/signup.
  - Protected app shell for all feature pages.
- Design system:
  - Tokenized dark theme variables.
  - Global theme persistence per user.

## 2.3 PWA + Offline + Notifications

- PWA baseline:
  - App manifest.
  - Service worker for app shell and static assets.
- Offline-first behavior:
  - IndexedDB for entity cache and sync queue.
  - Optimistic UI writes.
  - Reconcile on reconnect.
- Notifications:
  - Browser push where supported.
  - Preference-driven reminder scheduling.
  - In-app fallback reminders if push permissions are denied.

## 3) Domain Model

## 3.1 User

Fields:
- id
- email
- passwordHash (nullable for OAuth-only accounts)
- displayName
- avatarUrl
- bio
- locale
- timezone
- createdAt
- updatedAt

## 3.2 UserPreferences

Fields:
- id
- userId
- themeId
- motionIntensity (none, reduced, normal)
- weekStartDay (monday, sunday)
- defaultReminderMinutesBefore
- quietHoursStart
- quietHoursEnd
- notificationsEnabled
- createdAt
- updatedAt

## 3.3 AuthIdentity

Purpose: abstract provider-specific identity mapping.

Fields:
- id
- userId
- provider (local, google, future providers)
- providerUserId
- providerEmail
- createdAt
- updatedAt

## 3.4 Task

Fields:
- id
- userId
- title
- description
- priority (low, medium, high)
- status (todo, in_progress, done, archived)
- dueAtUtc
- scheduledAtUtc
- completedAtUtc
- estimateMinutes
- recurrenceEnabled
- recurrenceConfigJson
- sourceTimezone
- deletedAt
- createdAt
- updatedAt

## 3.5 Habit

Fields:
- id
- userId
- name
- description
- frequencyType (daily, weekly)
- targetCountPerPeriod
- difficulty (easy, medium, hard)
- recurrenceEnabled
- recurrenceConfigJson
- streakCurrent
- streakBest
- lastSatisfiedDateKey
- active
- deletedAt
- createdAt
- updatedAt

## 3.6 HabitCheckin

Fields:
- id
- habitId
- userId
- completedAtUtc
- localDateKey
- count
- xpAwarded
- createdAt

## 3.7 Event

Fields:
- id
- userId
- title
- description
- location
- allDay
- startAtUtc
- endAtUtc
- status (scheduled, done, cancelled)
- recurrenceEnabled
- recurrenceConfigJson
- reminderMinutesBefore
- sourceTimezone
- deletedAt
- createdAt
- updatedAt

## 3.8 XpEvent

Fields:
- id
- userId
- sourceType (task, habit, event, bonus)
- sourceId
- xp
- localDateKey
- createdAt

## 3.9 Badge and UserBadge

Badge fields:
- id
- code
- name
- description
- criteriaType
- criteriaValue
- createdAt

UserBadge fields:
- id
- userId
- badgeId
- earnedAt

## 3.10 NotificationSubscription

Fields:
- id
- userId
- endpoint
- p256dh
- auth
- userAgent
- expiresAt
- createdAt
- updatedAt

## 3.11 NotificationJob

Fields:
- id
- userId
- entityType
- entityId
- scheduledForUtc
- status (queued, sent, failed, cancelled)
- retries
- lastError
- createdAt
- updatedAt

## 3.12 RecurrenceConfig JSON shape

Core fields:
- frequency: daily, weekly, monthly
- interval: integer >= 1
- byWeekdays: array of weekday values when needed
- byMonthDay: day of month when monthly pattern is chosen
- end:
  - type: never, until_date, after_occurrences
  - untilDateLocal: local date when type is until_date
  - occurrences: integer when type is after_occurrences

## 4) API Contract Draft

Base URL: /api/v1

## 4.1 Auth

POST /auth/signup
POST /auth/login
POST /auth/refresh
POST /auth/logout
GET /auth/me
GET /auth/oauth/{provider}/start
GET /auth/oauth/{provider}/callback

Sample login request body:
  {
    "email": "user@example.com",
    "password": "plain-text-on-client-only"
  }

Sample login response body:
  {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresInSeconds": 900,
    "user": {
      "id": "uuid",
      "displayName": "Akash",
      "timezone": "Asia/Kolkata"
    }
  }

## 4.2 Profile and Preferences

GET /profile
PUT /profile
GET /preferences
PUT /preferences

Profile update sample body:
  {
    "displayName": "Akash",
    "avatarUrl": "https://...",
    "bio": "Building better routines",
    "locale": "en-IN",
    "timezone": "Asia/Kolkata"
  }

Preferences update sample body:
  {
    "themeId": "graphite-cyan",
    "motionIntensity": "normal",
    "weekStartDay": "monday",
    "defaultReminderMinutesBefore": 15,
    "notificationsEnabled": true,
    "quietHoursStart": "23:00",
    "quietHoursEnd": "07:00"
  }

## 4.3 Tasks

GET /tasks
POST /tasks
GET /tasks/{id}
PUT /tasks/{id}
DELETE /tasks/{id}
POST /tasks/{id}/complete
POST /tasks/{id}/reopen

Create task sample body:
  {
    "title": "Prepare sprint board",
    "description": "Plan V1 milestones",
    "priority": "high",
    "scheduledAtLocal": "2026-03-24T09:00:00",
    "dueAtLocal": "2026-03-24T18:00:00",
    "timezone": "Asia/Kolkata",
    "estimateMinutes": 45,
    "recurrence": {
      "frequency": "weekly",
      "interval": 1,
      "byWeekdays": ["monday", "wednesday", "friday"],
      "end": {
        "type": "until_date",
        "untilDateLocal": "2026-06-30"
      }
    }
  }

## 4.4 Habits

GET /habits
POST /habits
GET /habits/{id}
PUT /habits/{id}
DELETE /habits/{id}
POST /habits/{id}/checkins
GET /habits/{id}/checkins

Create habit sample body:
  {
    "name": "Read 20 pages",
    "description": "Daily reading routine",
    "frequencyType": "weekly",
    "targetCountPerPeriod": 5,
    "difficulty": "medium",
    "timezone": "Asia/Kolkata",
    "recurrence": {
      "frequency": "weekly",
      "interval": 1,
      "byWeekdays": ["monday", "tuesday", "wednesday", "thursday", "friday"],
      "end": {
        "type": "after_occurrences",
        "occurrences": 60
      }
    }
  }

Check-in sample body:
  {
    "completedAtLocal": "2026-03-23T21:15:00",
    "count": 1,
    "timezone": "Asia/Kolkata"
  }

## 4.5 Events

GET /events
POST /events
GET /events/{id}
PUT /events/{id}
DELETE /events/{id}
POST /events/{id}/mark-done

Create event sample body:
  {
    "title": "Team sync",
    "description": "Weekly planning",
    "location": "Online",
    "allDay": false,
    "startAtLocal": "2026-03-25T10:00:00",
    "endAtLocal": "2026-03-25T10:30:00",
    "timezone": "Asia/Kolkata",
    "reminderMinutesBefore": 10,
    "recurrence": {
      "frequency": "weekly",
      "interval": 1,
      "byWeekdays": ["wednesday"],
      "end": {
        "type": "never"
      }
    }
  }

## 4.6 Gamification

GET /gamification/summary
GET /gamification/streaks
GET /gamification/badges
GET /gamification/xp-events

Summary response sample:
  {
    "totalXp": 1240,
    "level": 6,
    "xpToNextLevel": 160,
    "currentStreaks": {
      "habit": 9,
      "task": 4
    },
    "badges": [
      { "code": "first_checkin", "earnedAt": "2026-03-10T09:00:00Z" }
    ]
  }

## 4.7 Notifications

POST /notifications/subscriptions
DELETE /notifications/subscriptions/{id}
POST /notifications/test
GET /notifications/preferences
PUT /notifications/preferences

Subscription body sample:
  {
    "endpoint": "https://...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    },
    "userAgent": "Mozilla/..."
  }

## 4.8 Trash

GET /trash
POST /trash/restore
DELETE /trash/purge/{entityType}/{id}

Restore sample body:
  {
    "entityType": "task",
    "entityId": "uuid"
  }

## 5) Frontend Route Map

Public routes:
- /login
- /signup

Protected routes:
- /dashboard
- /tasks
- /habits
- /events
- /insights
- /trash
- /profile
- /preferences

Routing behavior:
- Unauthenticated users are redirected to /login.
- Authenticated users visiting /login or /signup are redirected to /dashboard.
- Intended path is preserved during auth redirect.

## 6) Frontend Component Tree (V1)

App root:
- AppShell
  - AuthProvider
  - ThemeProvider
  - ConnectivityProvider
  - SyncQueueProvider
  - Router

Public layout:
- AuthLayout
  - LoginPage
    - LoginForm
    - OAuthButtons
  - SignupPage
    - SignupForm

Protected layout:
- ProtectedLayout
  - TopBar
    - UserMenu
    - QuickAddMenu
    - SyncStatusIndicator
  - Sidebar (desktop)
  - BottomNav (mobile)
  - PageOutlet

Feature pages:
- DashboardPage
  - TodaySummaryCard
  - StreakCard
  - XpProgressCard
  - QuickAddPanel
- TasksPage
  - TaskFilters
  - TaskList
  - TaskComposerModal
- HabitsPage
  - HabitGrid
  - HabitCheckinPanel
  - HabitStatsPanel
- EventsPage
  - CalendarView
  - AgendaList
  - EventEditorModal
- InsightsPage
  - LevelCard
  - BadgeGrid
  - StreakTimeline
- TrashPage
  - TrashedItemList
  - RestoreActionBar
- ProfilePage
  - AvatarEditor
  - ProfileForm
- PreferencesPage
  - ThemePicker
  - NotificationSettings
  - TimezoneLocaleForm
  - MotionSettings

## 7) Theme System

Theme presets for V1:
- graphite-cyan
- charcoal-emerald
- midnight-amber

Token categories:
- surface/background
- text/secondary text
- border/divider
- accent/hover/active
- success/warning/error

Rules:
- Theme is applied globally across all pages.
- Theme choice persists server-side in preferences.
- Motion respects user setting (none, reduced, normal).

## 8) Streak and XP Rules (Initial)

XP baseline:
- Task completion:
  - low 10
  - medium 20
  - high 30
- Habit check-in:
  - easy 5
  - medium 10
  - hard 15
- Event marked done:
  - 10

Level curve:
- V1 can use cumulative threshold table managed in configuration.

Streak rules:
- Evaluate satisfaction by user local date key.
- Weekly habits count completion against weekly target.
- Missed required period breaks streak.
- Recurrence end condition disables future streak expectations after end.

## 9) Sync and Conflict Strategy

Client write flow:
1. Apply optimistic update locally.
2. Add action to IndexedDB sync queue.
3. Attempt immediate server sync when online.

Conflict handling:
- Compare updatedAt timestamps.
- Server version wins by default.
- Show client toast when local write is overwritten.
- Keep last failed payload for user retry if needed.

## 10) Security and Validation

Security:
- JWT short-lived access token and rotating refresh token.
- Passwords hashed with strong algorithm in backend.
- Provider tokens never exposed to frontend except session outcome.

Validation:
- Enforce user ownership checks on every resource endpoint.
- Validate recurrence payload consistency.
- Validate timezone names against IANA list.

## 11) Delivery Plan (Execution Order)

Sprint 1
- Auth abstraction, JWT flow, protected routes.
- Shared dark layout and theme provider.
- Profile and preferences skeleton.

Sprint 2
- Tasks, habits, events CRUD.
- Recurrence engine with weekday patterns and end conditions.
- Timezone-aware mapping and date utilities.

Sprint 3
- Streak service, XP service, level progression, badges.
- Insights page and dashboard gamification widgets.

Sprint 4
- Notifications and subscriptions.
- Offline queue + sync pipeline.
- Baseline PWA support.

Sprint 5
- Trash and restore flows.
- Profile customization polish.
- Responsive and animation refinement.
- QA, regression tests, release hardening.

## 12) Non-Goals for V1

- Mandatory email verification.
- External calendar API sync (design remains integration-ready).
- Team collaboration and shared workspaces.
- Complex automation rules beyond core reminders.

## 13) Immediate Next Engineering Artifacts

1. Database migration draft for all entities listed.
2. OpenAPI contract file based on endpoint draft.
3. Backend service interfaces for recurrence, streak, XP, notifications.
4. Frontend route guards and app shell scaffolding.
5. IndexedDB schema and sync queue contract.
