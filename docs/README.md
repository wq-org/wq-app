# WQ documentation index

Naming conventions:

- **`docs/domain/NN_<topic>.md`** — product domain specs (numbered 01–18).
- **`docs/architecture/principle_<topic>.md`** — cross-cutting implementation principles.
- **`docs/perplexity/`** — spikes, tasks, and plans: `task_*`, `plan_*`, `note_*` (underscores, no hyphens).
- **`docs/html/`** — static HTML mocks and Lexical previews.

## Domain (`docs/domain/`)

| #   | File                                                                      | Topic                      |
| --- | ------------------------------------------------------------------------- | -------------------------- |
| 01  | [01_super_admin.md](domain/01_super_admin.md)                             | Super admin                |
| 02  | [02_institution.md](domain/02_institution.md)                             | Institution                |
| 03  | [03_teacher.md](domain/03_teacher.md)                                     | Teacher                    |
| 04  | [04_student.md](domain/04_student.md)                                     | Student                    |
| 05  | [05_classroom.md](domain/05_classroom.md)                                 | Classroom                  |
| 06  | [06_note.md](domain/06_note.md)                                           | Notes                      |
| 07  | [07_course.md](domain/07_course.md)                                       | Course, delivery, progress |
| 08  | [08_game_studio.md](domain/08_game_studio.md)                             | Game studio                |
| 09  | [09_task.md](domain/09_task.md)                                           | Tasks                      |
| 10  | [10_reward_system.md](domain/10_reward_system.md)                         | Rewards                    |
| 11  | [11_chat.md](domain/11_chat.md)                                           | Chat                       |
| 12  | [12_notification.md](domain/12_notification.md)                           | Notifications              |
| 13  | [13_hetzner_infra.md](domain/13_hetzner_infra.md)                         | Hetzner infra              |
| 14  | [14_subscription_entitlements.md](domain/14_subscription_entitlements.md) | Entitlements               |
| 15  | [15_platform_roles_schema_map.md](domain/15_platform_roles_schema_map.md) | Roles / RLS map            |
| 16  | [16_cloud_storage.md](domain/16_cloud_storage.md)                         | Cloud storage              |
| 17  | [17_lesson_authoring.md](domain/17_lesson_authoring.md)                   | Lesson Lexical authoring   |
| 18  | [18_game_image_pin_notes.md](domain/18_game_image_pin_notes.md)           | Image pin notes            |

## Architecture principles (`docs/architecture/`)

| File                                                                                                        | Topic                            |
| ----------------------------------------------------------------------------------------------------------- | -------------------------------- |
| [principle_database.md](architecture/principle_database.md)                                                 | Postgres, RLS, migrations        |
| [principle_data_flow.md](architecture/principle_data_flow.md)                                               | Roles, RLS flows, feature access |
| [principle_frontend.md](architecture/principle_frontend.md)                                                 | React layers, FSA                |
| [principle_hooks.md](architecture/principle_hooks.md)                                                       | Hooks conventions                |
| [principle_clean_code.md](architecture/principle_clean_code.md)                                             | Clean code                       |
| [principle_form_validation.md](architecture/principle_form_validation.md)                                   | Forms + Zod                      |
| [principle_animation.md](architecture/principle_animation.md)                                               | Motion / GSAP                    |
| [principle_commit_message.md](architecture/principle_commit_message.md)                                     | Git commit template              |
| [principle_task_template.md](architecture/principle_task_template.md)                                       | Task spec template               |
| [principle_dsgvo_audit_datendefinition.md](architecture/principle_dsgvo_audit_datendefinition.md)           | Audit / DSGVO                    |
| [principle_institution_hierarchy_deliveries.md](architecture/principle_institution_hierarchy_deliveries.md) | Deliveries hierarchy             |
| [principle_commercial_access_graph.md](architecture/principle_commercial_access_graph.md)                   | Commercial access                |
| [principle_lexical_technical.md](architecture/principle_lexical_technical.md)                               | Lexical deep dive                |
| [principle_shadcn_variants.md](architecture/principle_shadcn_variants.md)                                   | shadcn variants                  |
| [principle_ai_tutor_response.md](architecture/principle_ai_tutor_response.md)                               | AI tutor guide                   |

## Perplexity (`docs/perplexity/`)

Tasks and plans use prefixes `task_`, `plan_`, or `note_` with snake_case names.

| Prefix  | Examples                                                                          |
| ------- | --------------------------------------------------------------------------------- |
| `task_` | `task_drag_drop_math_expression_evaluate.md`, `task_cloud_files_audit_trigger.md` |
| `plan_` | `plan_canvas_dnd.md`, `plan_asset_reference.md`                                   |
| `note_` | `note_columns_layout_feature.md`, `note_infinite_scroll_image_feed.md`            |

## Migrations (`supabase/migrations/`)

Authoritative schema source. Domain docs describe intent; migration filenames describe rollout order (`YYYYMMDD…_<domain>_<nn>_<phase>.sql`).

| Domain doc          | Recent migration families                                                         |
| ------------------- | --------------------------------------------------------------------------------- |
| 07 Course           | `course_delivery_*`, `lesson_progress_*`, `topic_versions_*`, `lesson_versions_*` |
| 17 Lesson authoring | `lesson_draft_jsonb_*` (canonical `lessons.content`; retired `lesson_blocks`)     |
| 08 Game studio      | `game_runtime_*`, `game_versions_*`, `games_rls_*`                                |
| 16 Cloud storage    | `cloud_assets_*`, `cloud_files_*`, `register_uploaded_cloud_file_*`               |
| 02 Institution      | `institution_*`, `institution_invite_*`, `institution_hierarchy_*`                |

## HTML (`docs/html/`)

Dashboard mocks (`mock_*_dashboard.html`) and Lexical preview HTML (`lexical_*`, `rich_text_editor_demo.html`).
