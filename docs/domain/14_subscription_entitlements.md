## 1. Purpose

This document defines how subscriptions, pricing tiers, feature entitlements, usage limits, billing state, and institution-level overrides work in WQ-Health.

It is the source of truth for:

- commercial plans
- feature access
- quantitative limits
- grace / suspension behavior
- institution-specific overrides
- future Stripe mapping

This document does **not** define payment provider implementation details.  
It defines the **business model and entitlement model** that the database and application must enforce.

---

## 2. Goals

### 2.1 Business goals

- offer clear paid tiers
- make feature differences understandable
- support schools and clinics later
- allow future upgrades without schema rewrites
- support institution-specific contracts

### 2.2 Technical goals

- feature access must be enforceable in backend and frontend
- pricing must not be hardcoded across the app
- limits must be queryable from the database
- entitlements must support overrides
- subscription state must support grace periods and suspension

---

## 3. Core concepts

### 3.1 Plan

A plan is a commercial package, for example:

- Basic
- Plus
- Enterprise

A plan defines:

- base price
- billing interval
- default included features
- default quantitative limits

### 3.2 Feature

A feature is a capability that can be enabled or disabled.

Examples:

- classroom management
- game studio
- realtime chat
- collaborative notes
- notifications
- cloud storage
- reward system

### 3.3 Entitlement

An entitlement is the effective access rule for an institution.

It can be:

- boolean access
- usage limit
- storage limit
- seat limit
- project limit
- API access limit

### 3.4 Override

An override changes the default plan behavior for a specific institution.

Examples:

- extra teachers
- extra storage
- enable chat on lower tier
- custom grace period
- temporary premium access

---

## 4. Pricing tier proposal

> Initial proposal only. Final pricing can change later.

### 4.1 Basic — 9.99 €

Positioning:

- entry tier
- suitable for small teaching setups or MVP onboarding

Possible included areas:

- Institution
- Student
- Teacher
- Classroom
- Course
- Task
- Note
- Notification

Possible excluded or limited areas:

- Game Studio
- Chat
- Reward System
- Calendar
- higher Cloud quota

### 4.2 Plus — 14.99 €

Positioning:

- richer classroom collaboration
- more serious game functionality
- better for active teacher use

Possible included areas:

- Institution
- Student
- Teacher
- Classroom
- Course
- Task
- Note
- Notification
- Game Studio
- Chat
- Reward System
- Calendar
- larger Cloud quota

### 4.3 Enterprise

Positioning:

- custom contract
- schools / clinics / institutions
- custom limits and SSO later

Possible additions:

- institution overrides
- custom SLAs
- higher storage
- advanced analytics
- SSO / domain controls
- custom support

---

## 5. Feature catalog

## 5.1 Institution

Description:

Core tenant object and administrative boundary.

Can be modeled as:

- enabled / disabled
- max institution admins
- custom branding allowed
- export access allowed

## 5.2 Student

Description:

Student accounts and learner participation.

Can be modeled as:

- max active students
- self-registration allowed
- invite-only allowed

## 5.3 Teacher

Description:

Teacher accounts and teaching permissions.

Can be modeled as:

- max active teachers
- teacher analytics access
- teacher publishing rights

## 5.4 Classroom

Description:

Classroom creation, membership, and classroom delivery.

Can be modeled as:

- max classrooms
- max students per classroom
- archived classrooms allowed

## 5.5 Reward System

Description:

Points, rewards, unlockables, or classroom incentives.

Can be modeled as:

- enabled / disabled
- max reward campaigns
- redemption rules
- teacher-managed rewards

## 5.6 Course

Description:

Course creation, assignment, and delivery.

Can be modeled as:

- max courses
- max lessons per course
- publishing enabled
- course duplication enabled

## 5.7 Game Studio

Description:

Teacher-facing serious game authoring tools.

Can be modeled as:

- enabled / disabled
- max game projects
- max published games
- advanced node types enabled

## 5.8 Task

Description:

Assignments, group tasks, submissions, collaborative work.

Can be modeled as:

- max tasks per course
- collaborative tasks enabled
- group mode enabled
- submission history retention

## 5.9 Calendar

Description:

Scheduling and class/course event planning.

Can be modeled as:

- enabled / disabled
- calendar sync enabled
- reminders enabled

## 5.10 Cloud

Description:

Storage quota for uploaded files and assets.

Can be modeled as:

- storage quota in GB
- max upload size
- supported file types
- media retention policy

## 5.11 Note

Description:

Personal or collaborative notes.

Can be modeled as:

- enabled / disabled
- collaborative notes enabled
- max notes per user
- note version history enabled

## 5.12 Chat

Description:

Realtime messaging within institution or classroom scope.

Can be modeled as:

- enabled / disabled
- classroom chat enabled
- direct messages enabled
- message retention window

## 5.13 Notification

Description:

In-app notifications and optional email-based notifications.

Can be modeled as:

- enabled / disabled
- email notifications enabled
- digest mode enabled
- push/reminder frequency

---

## 6. Entitlement model

### 6.1 Boolean entitlements

Used when a feature is either on or off.

Examples:

- game_studio_enabled
- chat_enabled
- reward_system_enabled
- calendar_enabled

### 6.2 Quantitative entitlements

Used when a feature has limits.

Examples:

- max_teachers
- max_students
- max_classrooms
- max_courses
- max_game_projects
- storage_quota_mb

### 6.3 Behavioral entitlements

Used when policy behavior differs by plan.

Examples:

- allow_collaborative_tasks
- allow_course_publish
- allow_archiving
- allow_exports
- allow_custom_branding

---

## 7. Effective access rules

Effective access for an institution must be resolved in this order:

1. global platform default
2. selected plan defaults
3. institution-specific override
4. temporary promotional override if present

This means the app must **not** depend on one simple `plan_name` check.

---

## 8. Suggested data model

## 8.1 plans

Represents commercial plans.

Suggested fields:

- id
- code
- name
- description
- price_amount
- currency
- billing_interval
- is_active
- created_at
- updated_at

## 8.2 features

Represents the feature catalog.

Suggested fields:

- id
- code
- name
- description
- category
- value_type
  - boolean
  - integer
  - bigint
  - text
- created_at
- updated_at

## 8.3 plan_entitlements

Maps plans to feature values.

Suggested fields:

- id
- plan_id
- feature_id
- boolean_value
- integer_value
- text_value
- created_at
- updated_at

## 8.4 institution_subscriptions

Represents the active subscription state for an institution.

Suggested fields:

- id
- institution_id
- plan_id
- status
- started_at
- current_period_start
- current_period_end
- cancel_at_period_end
- canceled_at
- grace_until
- suspended_at
- created_at
- updated_at

## 8.5 institution_entitlement_overrides

Institution-specific override layer.

Suggested fields:

- id
- institution_id
- feature_id
- boolean_value
- integer_value
- text_value
- reason
- starts_at
- ends_at
- created_by
- created_at
- updated_at

## 8.6 billing_providers

Optional future table for Stripe/provider metadata.

Suggested fields:

- id
- provider
- external_customer_id
- external_subscription_id
- external_price_id
- institution_id
- created_at
- updated_at

---

## 9. Subscription statuses

Supported statuses should be:

- trialing
- active
- past_due
- grace
- suspended
- canceled
- expired

### 9.1 trialing

Institution has access according to trial policy.

### 9.2 active

Institution has paid access.

### 9.3 past_due

Payment issue exists, but access may still remain temporarily.

### 9.4 grace

Access remains during a configured grace period.

### 9.5 suspended

Institution loses write access or premium access.

### 9.6 canceled

Subscription ended by cancellation logic.

### 9.7 expired

No active entitlement remains.

---

## 10. Access behavior by billing state

### 10.1 active

- normal access
- all entitled features enabled

### 10.2 grace

- usually keep read/write access for a short window
- show billing warning banners

### 10.3 suspended

Recommended behavior:

- read-only for most content
- block premium feature creation
- allow admin billing access
- preserve data

### 10.4 expired

Recommended behavior:

- preserve data
- block most non-admin actions
- allow reactivation

---

## 11. Recommended first plan matrix

> Placeholder matrix. Product decision can change later.

| Feature       | Basic 9.99 € | Plus 14.99 € |
| ------------- | -----------: | -----------: |
| Institution   |          Yes |          Yes |
| Student       |          Yes |          Yes |
| Teacher       |      Limited | Higher limit |
| Classroom     |          Yes |          Yes |
| Reward System | No / Limited |          Yes |
| Course        |          Yes |          Yes |
| Game Studio   | Yes/ Limited |          Yes |
| Task          |          Yes |          Yes |
| Calendar      | Yes/ Limited |          Yes |
| Cloud         |  Small quota | Larger quota |
| Note          |          Yes |          Yes |
| Chat          | Yes/ Limited |          Yes |
| Notification  |          Yes |          Yes |

---

## 12. Open product decisions

The following still need explicit product decisions:

1. Are plans priced per institution, per teacher, per classroom, or hybrid?
2. Is the 9.99 € plan monthly only?
3. Are student seats unlimited or capped?
4. Is Game Studio fully locked behind Plus?
5. Is Chat included in Basic?
6. Is Cloud quota a meaningful differentiator?
7. Do schools and clinics need different plan families later?

---

## 13. Recommended implementation rules

1. Never hardcode feature access in frontend only
2. Backend must enforce entitlements
3. Plan checks must be centralized
4. Institution overrides must be first-class
5. Billing state must affect feature access predictably
6. Preserve data even when a plan expires
7. Log plan changes and entitlement overrides in audit logs

---

## 14. Audit requirements

The following must be audited:

- plan assigned to institution
- plan upgraded / downgraded
- override created
- override removed
- subscription suspended
- subscription reactivated
- quota exceeded events if relevant

---

## 15. Future integrations

This model should be compatible later with:

- Stripe products / prices
- per-seat billing
- annual billing
- coupon / promotional periods
- enterprise contracts
- institution procurement workflows
- SSO-linked enterprise plans

---

## 16. Recommended next documents

After this file, create:

- `15_Billing_and_Payment_Integration.md`
- `16_Quota_and_Usage_Enforcement.md`
- `17_Admin_Billing_UI.md`

---

## 17. Summary

This file defines:

- what a plan is
- what a feature is
- how entitlements are modeled
- how institution overrides work
- how billing state affects access

It should become the reference for both:

- database schema design
- product packaging and pricing
