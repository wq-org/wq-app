# Naming the Main Editor vs. the Inline Editor

In your application, the **primary (normal) text editor** and the **inline editing component** (e.g. link editor, hover toolbar) should have clear, distinct names that reflect their roles. Good practice is to name the main editor something like:

- **`RichTextEditor`** or **`DocumentEditor`** – for the main full-featured editor component.
- Or simply **`Editor`** if the context is clear.

For the inline editing UI (which appears as a floating toolbar or popup), use a name like:

- **`InlineEditor`**, **`LinkEditor`**, or **`FloatingLinkEditor`** – indicating it’s a smaller, context-specific editor.
- If it’s for editing links, a name like **`LinkEditForm`** is clear (e.g. used in Lexical as `FloatingLinkEditorPlugin`).
- If it’s for inline formatting (e.g. toolbar), something like **`FormattingToolbar`** or **`InlineToolbar`** works.

The key is consistency and clarity. For example, you might have:

```plaintext
components/
  Editor.tsx        // primary editor
  InlineLinkEditor.tsx  // floating link-editing popup
  InlineToolbar.tsx     // floating formatting toolbar
```

This makes it obvious which component is the main editor and which are auxiliary inline editors.
