# Course

## Functional feature map

Course must provide a structured learning path with measurable outcomes:

1. Course and topic authoring
2. Lesson delivery and presentation mode
3. Classroom-scoped publishing
4. Student progress tracking
5. Course-quality analytics for teachers
6. Lesson-to-game linkage
7. Notes integration at slide level

---

## Functional areas

### 1) Course authoring

- create and manage courses, topics, and lessons
- organize learning flow by topic sequence
- reuse media and content blocks from cloud assets
- publish updates without breaking existing classroom assignments

### 2) Lesson delivery

- support standard reading mode and presentation mode
- define slide boundaries from lesson structure
- keep lesson progression consistent across devices
- support optional inline checks per lesson segment

Slide sizing logic:

- target reading window per slide: 60 to 90 seconds
- minimum useful text target: 40 words
- maximum text before split: 120 words
- hard split trigger by block count: more than 6 blocks in one slide segment
- media weighting for split logic:
  - 1 image = 20 word-equivalents
  - 1 video = 40 word-equivalents
- effective content load formula:
  - effective*words = text_words + (images * 20) + (videos \_ 40)
- split rule:
  - if effective_words > 120, split into the next slide segment

### 3) Classroom publishing scope

- publish courses to selected classrooms
- ensure access is classroom-scoped
- support draft and published states with safe update path
- keep archived classroom history readable

### 4) Student learning experience

- show topic and lesson progress clearly
- resume from last lesson/slide location
- show completion state per lesson
- estimate reading effort for pacing

### 5) Teacher analytics (course)

- per-student lesson completion
- class completion by topic
- drop-off points by lesson
- most-skipped lesson signals
- last activity and inactivity alerts

### 6) Event tracking baseline

Track these course-learning events:

- lesson opened
- lesson completed
- lesson/slide time spent
- slide viewed
- slide navigation direction
- notes created from slide context

### 7) Lesson and game connection

- attach games to lesson context
- use course analytics to identify where games should be inserted
- measure completion impact after game attachment

### 8) Notes integration

- allow student note capture per lesson/slide
- link note context back to learning source
- support revision workflows from notes to lesson

### 9) Layout combinations

Supported lesson slide layouts:

- title + text
- title + image
- title + image + text
- title + bullets
- title + video
- knowledge check
- quote / highlight

---

## Delivery quality guardrails

- one lesson segment should be concise enough for focused reading
- avoid oversized single-slide content blocks
- use split and pacing rules to reduce cognitive overload
- prioritize readability and comprehension over dense formatting
