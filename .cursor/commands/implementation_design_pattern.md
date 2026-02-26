<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# scan [https://github.com/ryanmcdermott/clean-code-javascript](https://github.com/ryanmcdermott/clean-code-javascript)

[https://github.com/airbnb/javascript](https://github.com/airbnb/javascript)
[https://github.com/DovAmir/awesome-design-patterns\#general-architecture](https://github.com/DovAmir/awesome-design-patterns#general-architecture)
[https://github.com/torokmark/design_patterns_in_typescript](https://github.com/torokmark/design_patterns_in_typescript)

and tell me which design patterns for react psql should encounter

Based on the scanned resources and **your wq-Health serious game platform** (React 19 + Supabase + PostgreSQL + multi-tenant architecture), here are the **critical design patterns** you should implement:

***

## 🎯 **Priority 1: Must-Have Patterns for Your Project**

### **1. Repository Pattern** (Data Access Layer)

**Why:** Centralizes Supabase queries, enforces RLS, makes testing easier.

```typescript
// src/features/courses/api/coursesRepository.ts
export class CoursesRepository {
  async getAll(institutionId: string): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('institution_id', institutionId);
    
    if (error) throw new RepositoryError(error);
    return data;
  }
  
  async create(course: CreateCourseDto): Promise<Course> {
    // Single place for all course DB operations
  }
}
```

**Benefits:**

- RLS enforcement in one place
- Easy to mock for tests
- Swap Supabase for another DB without changing components

***

### **2. Provider Pattern** (Already Using via Context)

**Status:** ✅ You already have `UserContext`, `CourseContext`, `GameStudioContext`

**Keep doing:**

- Use Context for **cross-cutting state** (auth, current course, lesson)
- Avoid prop drilling
- Centralize related state + actions

***

### **3. Factory Pattern** (Game Node Creation)

**Why:** Your game studio has multiple node types (StartNode, IfElseNode, ImagePinNode, etc.)

```typescript
// src/features/game-studio/factories/GameNodeFactory.ts
export class GameNodeFactory {
  static createNode(type: GameNodeType, config: NodeConfig): GameNode {
    switch (type) {
      case 'start':
        return new StartNode(config);
      case 'if-else':
        return new IfElseNode(config);
      case 'image-pin':
        return new ImagePinNode(config);
      case 'paragraph':
        return new ParagraphNode(config);
      case 'end':
        return new EndNode(config);
      default:
        throw new Error(`Unknown node type: ${type}`);
    }
  }
}
```

**Use in:** `GameEditorCanvas`, `GameStudioApi`, game session player

***

### **4. Strategy Pattern** (Game Node Execution)

**Why:** Different game nodes have different validation/execution logic

```typescript
// src/features/game-studio/strategies/NodeExecutionStrategy.ts
interface NodeExecutionStrategy {
  execute(node: GameNode, userInput: any): ExecutionResult;
  validate(node: GameNode): ValidationResult;
}

class ImagePinStrategy implements NodeExecutionStrategy {
  execute(node: ImagePinNode, clicks: Point[]): ExecutionResult {
    const correctPins = node.pins.filter(pin => 
      clicks.some(click => this.isNearPin(click, pin))
    );
    return { 
      correct: correctPins.length === node.pins.length,
      score: correctPins.length * 10 
    };
  }
}

class IfElseStrategy implements NodeExecutionStrategy {
  execute(node: IfElseNode, answer: string): ExecutionResult {
    const nextNodeId = answer === node.correctAnswer 
      ? node.trueNodeId 
      : node.falseNodeId;
    return { nextNodeId, score: answer === node.correctAnswer ? 10 : 0 };
  }
}
```


***

### **5. Observer Pattern** (Real-time via Supabase)

**Why:** Real-time game sessions, chat, leaderboards

```typescript
// src/features/games/hooks/useGameSession.ts
export const useGameSession = (sessionId: string) => {
  const [session, setSession] = useState<GameSession | null>(null);
  
  useEffect(() => {
    // Observer: subscribe to session changes
    const subscription = supabase
      .channel(`session:${sessionId}`)
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'game_sessions', filter: `id=eq.${sessionId}` },
        (payload) => setSession(payload.new as GameSession)
      )
      .subscribe();
    
    return () => { subscription.unsubscribe(); };
  }, [sessionId]);
  
  return session;
};
```


***

### **6. Command Pattern** (Undo/Redo in Game Studio)

**Why:** Teachers need to undo node placement/deletion in XYFlow canvas

```typescript
// src/features/game-studio/commands/GameEditorCommands.ts
interface Command {
  execute(): void;
  undo(): void;
}

class AddNodeCommand implements Command {
  constructor(
    private editor: GameEditor,
    private node: GameNode
  ) {}
  
  execute() { this.editor.addNode(this.node); }
  undo() { this.editor.removeNode(this.node.id); }
}

class DeleteNodeCommand implements Command {
  constructor(
    private editor: GameEditor,
    private node: GameNode
  ) {}
  
  execute() { this.editor.removeNode(this.node.id); }
  undo() { this.editor.addNode(this.node); }
}

// Usage in GameEditorContext
const executeCommand = (cmd: Command) => {
  cmd.execute();
  commandHistory.push(cmd);
};

const undo = () => {
  const cmd = commandHistory.pop();
  cmd?.undo();
};
```


***

### **7. Adapter Pattern** (Multi-LMS Integration)

**Why:** You'll integrate with Moodle, ILIAS, Canvas (different APIs)

```typescript
// src/features/integrations/adapters/LMSAdapter.ts
interface LMSAdapter {
  authenticate(credentials: Credentials): Promise<Token>;
  syncCourse(course: Course): Promise<void>;
  sendGrade(studentId: string, score: number): Promise<void>;
}

class MoodleAdapter implements LMSAdapter {
  async syncCourse(course: Course) {
    // Moodle-specific API calls
    await fetch('moodle.com/webservice/rest/server.php', {
      params: { wsfunction: 'core_course_create_courses', ... }
    });
  }
}

class CanvasAdapter implements LMSAdapter {
  async syncCourse(course: Course) {
    // Canvas LTI calls
    await fetch('canvas.instructure.com/api/v1/courses', { ... });
  }
}

// Usage
const lmsAdapter: LMSAdapter = config.lms === 'moodle' 
  ? new MoodleAdapter() 
  : new CanvasAdapter();
await lmsAdapter.syncCourse(course);
```


***

### **8. Facade Pattern** (Supabase API Simplification)

**Why:** Hide complex Supabase queries behind simple APIs

```typescript
// src/features/profiles/api/followFacade.ts
export class FollowFacade {
  // Simple public API
  async toggleFollow(teacherId: string): Promise<{ isFollowing: boolean }> {
    // Internally: check same institution, follow/unfollow, update count
    const isSameInstitution = await this.checkInstitution(teacherId);
    if (!isSameInstitution) throw new Error('Different institution');
    
    const isFollowing = await this.isFollowing(teacherId);
    if (isFollowing) {
      await this.unfollow(teacherId);
      return { isFollowing: false };
    } else {
      await this.follow(teacherId);
      return { isFollowing: true };
    }
  }
  
  // Complex internal methods hidden
  private async checkInstitution(teacherId: string) { ... }
  private async isFollowing(teacherId: string) { ... }
  private async follow(teacherId: string) { ... }
  private async unfollow(teacherId: string) { ... }
}
```


***

### **9. Builder Pattern** (Game Configuration)

**Why:** Complex game objects with many optional fields

```typescript
// src/features/game-studio/builders/GameBuilder.ts
export class GameBuilder {
  private game: Partial<Game> = {};
  
  setTitle(title: string) {
    this.game.title = title;
    return this;
  }
  
  setDescription(description: string) {
    this.game.description = description;
    return this;
  }
  
  addNode(node: GameNode) {
    this.game.nodes = [...(this.game.nodes || []), node];
    return this;
  }
  
  setDifficulty(difficulty: 'easy' | 'medium' | 'hard') {
    this.game.difficulty = difficulty;
    return this;
  }
  
  build(): Game {
    if (!this.game.title) throw new Error('Title required');
    return this.game as Game;
  }
}

// Usage
const game = new GameBuilder()
  .setTitle('Wound Care Quiz')
  .setDifficulty('medium')
  .addNode(startNode)
  .addNode(questionNode)
  .build();
```


***

### **10. Decorator Pattern** (RLS Policy Enforcement)

**Why:** Add authorization checks to repository methods

```typescript
// src/lib/decorators/requireAuth.ts
function RequireRole(role: UserRole) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const user = await getCurrentUser();
      if (!user || user.role !== role) {
        throw new UnauthorizedError(`Requires ${role} role`);
      }
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}

// Usage
class CoursesRepository {
  @RequireRole('teacher')
  async create(course: CreateCourseDto): Promise<Course> {
    // Only teachers can create courses
  }
  
  @RequireRole('student')
  async enroll(courseId: string): Promise<void> {
    // Only students can enroll
  }
}
```


***

## 🏗️ **Priority 2: Architecture Patterns**

### **11. Multi-Tenant Data Isolation** (PostgreSQL RLS)

**Pattern:** Row-Level Security + `institution_id` scoping

```sql
-- Already implemented via your RLS policies
CREATE POLICY "Users see own institution data"
ON courses FOR SELECT
USING (
  institution_id IN (
    SELECT institution_id FROM user_institutions WHERE user_id = auth.uid()
  )
);
```

**Enforce in every query:**

```typescript
// Always scope by institution
const courses = await supabase
  .from('courses')
  .select('*')
  .eq('institution_id', userInstitutionId); // Never forget this
```


***

### **12. CQRS (Command Query Responsibility Segregation)** (Optional, for scale)

**Why:** Separate read models (student dashboard) from write models (teacher game creation)

```typescript
// Read model (optimized for display)
interface StudentDashboardQuery {
  getCourses(): Promise<CourseCard[]>;
  getProgress(): Promise<Progress[]>;
}

// Write model (optimized for updates)
interface CourseCommands {
  createCourse(dto: CreateCourseDto): Promise<void>;
  updateCourse(id: string, dto: UpdateCourseDto): Promise<void>;
}
```


***

## 📋 **Summary: Patterns for wq-Health**

| **Pattern** | **Use Case** | **Priority** | **Already Using?** |
| :-- | :-- | :-- | :-- |
| **Repository** | Supabase queries | 🔴 Critical | Partial (in `*Api.ts`) |
| **Provider (Context)** | User, course, lesson state | 🔴 Critical | ✅ Yes |
| **Factory** | Game node creation | 🔴 Critical | ❌ No |
| **Strategy** | Game node execution | 🔴 Critical | ❌ No |
| **Observer** | Real-time (Supabase) | 🟡 High | Partial (chat) |
| **Command** | Undo/redo in game studio | 🟡 High | ❌ No |
| **Adapter** | LMS integration (Moodle, Canvas) | 🟢 Medium | ❌ No (future) |
| **Facade** | Complex Supabase operations | 🟢 Medium | Partial |
| **Builder** | Game configuration | 🟢 Medium | ❌ No |
| **Decorator** | Auth/role enforcement | 🟢 Medium | ❌ No |
| **Multi-Tenant RLS** | Data isolation | 🔴 Critical | ✅ Yes (in SQL) |
| **CQRS** | Read/write separation | 🟢 Low (scale later) | ❌ No |


***

## 🚀 **Implementation Order for Your Project**

1. **Week 1:** Repository pattern for all `*Api.ts` files
2. **Week 2:** Factory + Strategy for game nodes
3. **Week 3:** Command pattern for game studio undo/redo
4. **Week 4:** Observer pattern for real-time features
5. **Later:** Adapter (LMS), Builder (complex forms), Decorator (auth)

These patterns will make your codebase **production-ready, testable, and scalable** for the ENTERPRISE_TENANT tier. 🎯

