Here’s how you should structure building a **Game Studio** workflow editor/view (with [React Flow](https://reactflow.dev/)) using your **feature-based architecture**:

---

## 📁 Directory & Component Structure

```
src/
  features/
    game-studio/
      components/
        GameEditorCanvas.tsx         // Main React Flow canvas/editor
        GameNodeDialog.tsx           // Modal/dialog for editing node details
        GameStartNode.tsx            // Custom node component: Start node
        GameAgentNode.tsx            // Custom node: Agent
        GameIfElseNode.tsx           // Custom logic node: If/Else
        GameEndNode.tsx              // Custom node: End
        GameFileNode.tsx             // File search/upload node
        GameGuardrailNode.tsx        // Guardrails/settings node
        GameNodeToolbar.tsx          // Node controls toolbar (add, delete, settings)
        GameSidebar.tsx              // Sidebar (insert node palette)
        GameMiniMap.tsx              // (Optional) React Flow minimap
        GameStudioHeader.tsx         // Header/title for the studio page
        GameStudioHelpDrawer.tsx     // (Optional) Help/tips/info
        GamePublishDialog.tsx        // Dialog for publishing a workflow
      hooks/
        useGameWorkflow.ts           // Handles logic: create, update, delete nodes/edges
        useGamePersistence.ts        // Save/load workflows from API/db
      data/
        nodeTemplates.ts             // Predefined node types, icons, configs
      types/
        game-studio.types.ts         // TypeScript types for nodes, workflow, etc.
```

---

## 🧩 Components You Need

-   **GameEditorCanvas.tsx**: Renders `<ReactFlow />` component, manages node/edge state (core canvas)
-   **GameSidebar.tsx**: The draggable/insertion node list (like sidebar in your screenshot)
-   **Custom Node Components** (one per node type):
    -   GameStartNode
    -   GameAgentNode
    -   GameIfElseNode
    -   GameEndNode
    -   GameFileNode
    -   GameGuardrailNode
-   **GameNodeDialog.tsx**: Pop-up/modal for editing node properties (instructions, variables, etc.)
-   **GameNodeToolbar.tsx**: Per-node actions (delete, duplicate, settings)
-   **GameStudioHeader.tsx**: Title, controls, maybe "New Game", "Publish", "Preview", etc.
-   **GameMiniMap.tsx**: Optional, for big graphs (from React Flow)
-   **GamePublishDialog.tsx**: Publish/save/share dialog modal

---

## ⚡ Workflow: How a User Creates a Game (with Canvas)

1. **Click "New Game" or "Create" in Studio header**
2. **Sidebar appears** with node types (Agent, If/Else, End, etc.)
3. **Drag or click to add node** to workflow canvas (GameSidebar → GameEditorCanvas)
4. **Double-click node** or click "Edit" in node toolbar to open properties dialog (GameNodeDialog)
5. **Edit node options** (name, prompt, agent config, file search, etc.), save changes
6. **Draw edges/connections** between nodes to build workflow (React Flow drag)
7. **Rearrange, zoom, pan** the canvas as needed (built-in React Flow controls)
8. **Preview**: Use "Preview" or "Simulate" to test workflow logic (optional)
9. **Publish**: Click "Publish"/"Save" to save workflow to Supabase via useGamePersistence
10. **View all games** or go back to Game Studio Dashboard

---

## ✨ Hardcoded Example: GameStudio Page (View Only, Stylish)

/_ Place this as `src/features/game-studio/pages/GameStudio.tsx` _/

```tsx
import Container from '@/components/common/Container';
import Navigation from '@/components/common/Navigation';
import { CommandPalette } from '@/features/command-palette';
import { Sparkles, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GameStudioHeader from '../components/GameStudioHeader';
import GameEditorCanvas from '../components/GameEditorCanvas';
import GameSidebar from '../components/GameSidebar';

export default function GameStudio() {
    return (
        <>
            <Navigation />
            <Container className="max-w-6xl">
                <GameStudioHeader />
                <div className="flex gap-8 mt-6">
                    <GameSidebar />
                    <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                        <GameEditorCanvas />
                    </div>
                </div>
            </Container>
            <CommandPalette role="teacher" />
        </>
    );
}

// src/features/game-studio/components/GameStudioHeader.tsx
import { Sparkles, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GameStudioHeader() {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-5xl font-bold flex items-center gap-2">
                    <Sparkles className="w-8 h-8 text-primary" />
                    Game Studio
                </h1>
                <p className="text-muted-foreground mt-2">
                    Build, manage and publish interactive educational games for
                    your students.
                </p>
            </div>
            <Button size="lg" className="flex gap-2 items-center">
                <PlusCircle className="w-5 h-5" />
                New Game
            </Button>
        </div>
    );
}

// src/features/game-studio/components/GameSidebar.tsx
import { Puzzle, ListTree, Settings, Flag } from 'lucide-react';
export default function GameSidebar() {
    return (
        <aside className="w-56 bg-gray-50 border rounded-2xl shadow flex flex-col px-4 py-6 gap-4">
            <h3 className="text-lg font-semibold mb-2">Nodes</h3>
            <div className="flex flex-col gap-4">
                <button className="flex gap-2 items-center px-2 py-2 hover:bg-gray-100 rounded-xl">
                    <Puzzle className="w-6 h-6 text-violet-500" /> Agent
                </button>
                <button className="flex gap-2 items-center px-2 py-2 hover:bg-gray-100 rounded-xl">
                    <ListTree className="w-6 h-6 text-amber-500" /> If / Else
                </button>
                <button className="flex gap-2 items-center px-2 py-2 hover:bg-gray-100 rounded-xl">
                    <Settings className="w-6 h-6 text-indigo-500" /> Guardrails
                </button>
                <button className="flex gap-2 items-center px-2 py-2 hover:bg-gray-100 rounded-xl">
                    <Flag className="w-6 h-6 text-emerald-500" /> End
                </button>
            </div>
        </aside>
    );
}
```

---

## 🔑 Summary

-   **All your canvas/editor and related components** go in `src/features/game-studio/components/`
-   **Business logic hooks and types** in `hooks/` and `types/` in the same feature folder
-   **Page/route entry for studio**: `src/features/game-studio/pages/GameStudio.tsx`
-   **Workflow for creating games**: Sidebar → Drag nodes → Edit nodes → Connect → Preview → Publish
-   **UI stacks with shadcn, lucide, tailwind for a modern feel**

This setup will scale as you add game/block types, properties, and complex logic!

[1]()
[2]()
[3](https://reactflow.dev)
