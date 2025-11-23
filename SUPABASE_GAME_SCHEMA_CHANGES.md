# Supabase Game Schema Changes

## Summary

Successfully updated the game schema to improve type safety, enforce media organization patterns, and strengthen security.

---

## ✅ Completed Changes

### 1. **Games → Teacher Relationship**

**Status:** ✅ Completed

- **Removed:** Foreign key constraint `games_topic_id_fkey` from `games.topic_id` → `topics.id`
- **Result:** Games are now **only tied to teachers** (`games.teacher_id`), not to topics
- **Benefit:** Flexible game management - teachers can use games across multiple topics/courses
- **Note:** `topic_id` column still exists but is optional and not enforced

```sql
-- Migration: remove_games_topic_id_constraint
ALTER TABLE games DROP CONSTRAINT IF EXISTS games_topic_id_fkey;
```

---

### 2. **Game Type Safety**

**Status:** ✅ Already Implemented

- **ENUM Type:** `game_type` with values:
  - `image_term_match`
  - `image_marker`
  - `line_picker`
  - `custom`
- **Validation:** Enforced at insert via PostgreSQL ENUM constraint
- **Column:** `games.game_type` is NOT NULL and must be one of the ENUM values

---

### 3. **Media File Organization & Type Safety**

**Status:** ✅ Completed

#### a) Created `entity_type` ENUM

```sql
CREATE TYPE entity_type AS ENUM ('game', 'course', 'topic', 'lesson', 'profile');
```

- **Column:** `media_files.entity_type` now uses ENUM instead of text
- **Benefit:** Type-safe media linking, prevents typos

#### b) Enforced Game Media Path Pattern

**Required Pattern:** `games/{game_id}/{filename}`

**Enforcement Methods:**

1. **Check Constraint:** `check_game_file_path`
   - Validates file_path follows UUID pattern: `^games/[uuid]/.+`

2. **Trigger:** `trigger_validate_game_media`
   - Validates `entity_id` references existing game
   - Ensures file_path matches `games/{game_id}/` exactly
   - Prevents NULL `entity_id` for game media

#### c) Performance Optimization

```sql
CREATE INDEX idx_media_files_entity
ON media_files(entity_type, entity_id)
WHERE entity_type = 'game';
```

---

### 4. **Row Level Security (RLS)**

**Status:** ✅ Completed

#### Games Table

**Policy:** `Teachers can manage their games`

```sql
auth.uid() = teacher_id
```

- Teachers can SELECT, INSERT, UPDATE, DELETE only their own games

#### Game Versions Table

**Status:** ✅ RLS Now Enabled

**Policies:**

1. `Teachers can view their game versions` (SELECT)
2. `Teachers can create versions for their games` (INSERT)
3. `Teachers can update their game versions` (UPDATE)
4. `Teachers can delete their game versions` (DELETE)

All policies check:

```sql
EXISTS (
  SELECT 1 FROM games
  WHERE games.id = game_versions.game_id
  AND games.teacher_id = auth.uid()
)
```

---

### 5. **Security Hardening**

**Status:** ✅ Completed

Fixed function security issues by setting `search_path`:

- `validate_game_media_reference()` - SECURITY DEFINER with search_path = public
- `update_updated_at()` - SECURITY DEFINER with search_path = public
- `update_teacher_follow_count()` - SECURITY DEFINER with search_path = public

**Prevents:** SQL injection via search_path manipulation

---

## 📊 Current Schema Overview

### Games Table

```
games
├── id (uuid, PK)
├── title (text, NOT NULL)
├── description (text)
├── game_type (ENUM: game_type, NOT NULL) ✅ Type-safe
├── teacher_id (uuid, NOT NULL, FK → profiles.user_id) ✅ Only tied to teacher
├── topic_id (uuid, optional, no FK) ⚠️ Not enforced
├── game_config (jsonb, NOT NULL)
├── status (ENUM: game_status)
├── version (int4)
├── published_version (int4)
├── is_draft (bool)
├── published_at (timestamptz)
├── created_at (timestamptz)
└── updated_at (timestamptz)

RLS: ✅ Teachers can only manage their own games
```

### Media Files Table

```
media_files
├── id (uuid, PK)
├── title (text, NOT NULL)
├── description (text)
├── file_path (text, NOT NULL) ✅ Validated for games
├── file_type (ENUM: file_type, NOT NULL)
├── file_size_bytes (bigint)
├── uploader_id (uuid, NOT NULL, FK → profiles.user_id)
├── entity_type (ENUM: entity_type) ✅ Type-safe
├── entity_id (uuid) ✅ Validated via trigger
└── created_at (timestamptz)

Constraints:
✅ check_game_file_path - Path must match games/{uuid}/...
✅ trigger_validate_game_media - Validates game exists + path correctness

Index:
✅ idx_media_files_entity (entity_type, entity_id) WHERE entity_type = 'game'
```

### Game Versions Table

```
game_versions
├── id (uuid, PK)
├── game_id (uuid, NOT NULL, FK → games.id)
├── version (int4, NOT NULL)
├── game_config (jsonb, NOT NULL)
├── published_at (timestamptz)
└── created_at (timestamptz)

RLS: ✅ Teachers can only manage versions of their own games
```

---

## 🔗 Relationships

```
Teacher (profiles.user_id)
    ↓ 1:N
Games (games.teacher_id) ✅ Only owner relationship
    ↓ 1:N
Game Versions (game_versions.game_id) ✅ RLS enforced

Games (games.id)
    ↓ 1:N
Media Files (media_files.entity_id WHERE entity_type = 'game') ✅ Path validated
    → Storage: files/games/{game_id}/...

Games (games.id)
    ↓ 1:N
Game Sessions (game_sessions.game_id) - Student progress tracking
```

---

## 🎯 Usage Guidelines

### Creating a Game

```typescript
// Frontend
const { data: game, error } = await supabase
  .from('games')
  .insert({
    title: 'My Game',
    description: 'Description',
    game_type: 'image_marker', // ✅ ENUM validated
    teacher_id: userId, // ✅ Must match auth.uid()
    game_config: {
      /* config */
    },
  })
  .select()
  .single()
```

### Uploading Game Media

```typescript
// 1. Upload file to storage
const filePath = `games/${gameId}/${filename}` // ✅ Required pattern
const { data: file, error } = await supabase.storage.from('files').upload(filePath, fileData)

// 2. Create media_files record
const { data: media, error } = await supabase.from('media_files').insert({
  title: 'Game Image',
  file_path: filePath, // ✅ Validated to match games/{gameId}/...
  file_type: 'image',
  uploader_id: userId,
  entity_type: 'game', // ✅ ENUM validated
  entity_id: gameId, // ✅ Trigger validates game exists
})
```

### Querying Game Media

```typescript
// Efficient query using the index
const { data: media, error } = await supabase
  .from('media_files')
  .select('*')
  .eq('entity_type', 'game') // ✅ Uses idx_media_files_entity
  .eq('entity_id', gameId)
```

---

## ⚠️ Remaining Considerations

### 1. Auth Configuration

**Action Required:** Enable Leaked Password Protection in Supabase Dashboard

- Navigate to: Authentication → Password Settings
- Enable: "Check against HaveIBeenPwned database"
- [Documentation](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

### 2. Topic Relationship (Optional)

The `topic_id` column still exists but is not enforced. Options:

- **Keep as is:** Use for filtering/categorization without enforcement
- **Remove entirely:** If you never want to track topic association
- **Add back with different logic:** If you want games to optionally belong to topics but with different rules

### 3. Storage Bucket Strategy

Current setup uses `files` bucket for all game media. Consider:

- Creating dedicated `games` bucket for better organization
- Setting up appropriate storage policies for teacher/student access

---

## 🧪 Testing Validation

### Test 1: Valid Game Media

```sql
-- Should succeed
INSERT INTO media_files (
  title, file_path, file_type, uploader_id, entity_type, entity_id
) VALUES (
  'Test Image',
  'games/550e8400-e29b-41d4-a716-446655440000/image.png',
  'image',
  'user-uuid-here',
  'game',
  '550e8400-e29b-41d4-a716-446655440000' -- Must be existing game_id
);
```

### Test 2: Invalid Path Pattern

```sql
-- Should fail: path doesn't match pattern
INSERT INTO media_files (...) VALUES (
  'Test Image',
  'uploads/image.png', -- ❌ Wrong pattern
  'image', 'user-uuid', 'game', 'game-uuid'
);
-- Error: Game media file_path must follow pattern: games/{game_id}/{filename}
```

### Test 3: Non-existent Game

```sql
-- Should fail: game doesn't exist
INSERT INTO media_files (...) VALUES (
  'Test Image',
  'games/550e8400-e29b-41d4-a716-446655440000/image.png',
  'image', 'user-uuid', 'game',
  '550e8400-e29b-41d4-a716-446655440000' -- ❌ Game doesn't exist
);
-- Error: Game with id 550e8400-e29b-41d4-a716-446655440000 does not exist
```

---

## 📝 Migrations Applied

1. `remove_games_topic_id_constraint` - Removed games → topics FK
2. `improve_game_media_type_safety_v2` - Added entity_type ENUM + validation
3. `fix_security_issues_and_rls` - Hardened functions + enabled RLS on game_versions

All migrations are tracked in `supabase_migrations` table.

---

## 🎉 Summary

✅ **Games are teacher-owned** - No topic dependency  
✅ **Type-safe game types** - ENUM validation  
✅ **Organized media storage** - Enforced `games/{game_id}/` pattern  
✅ **Type-safe entity linking** - ENUM for entity_type  
✅ **Automatic validation** - Triggers prevent invalid data  
✅ **Secure RLS policies** - Teachers control their games/versions  
✅ **Performance optimized** - Indexed for game media queries  
✅ **Security hardened** - Functions protected against injection

Your game system is now type-safe, organized, and secure! 🚀
