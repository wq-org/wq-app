/**
 * Prism grammar registration + the language list offered in the code block UI.
 *
 * `@lexical/code-prism` reads `globalThis.Prism`, so importing extra
 * `prismjs/components/prism-*` files here registers their grammars into the
 * exact instance the highlighter uses. Import order matters: a grammar must be
 * imported after every grammar it extends (e.g. `tsx` after `jsx` + `typescript`).
 * The Node-only `prismjs/components/` loader does not work under Vite — direct
 * component imports are the supported path.
 */

import 'prismjs'
// Shared templating dependency (php, handlebars)
import 'prismjs/components/prism-markup-templating'
// Frontend
import 'prismjs/components/prism-scss'
import 'prismjs/components/prism-less'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-handlebars'
// Backend & server-side
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-php'
import 'prismjs/components/prism-ruby'
import 'prismjs/components/prism-go'
import 'prismjs/components/prism-rust'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-docker'
import 'prismjs/components/prism-nginx'
// Java ecosystem (FXML is valid XML — covered by `markup`)
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-kotlin'
import 'prismjs/components/prism-groovy'
// Systems
import 'prismjs/components/prism-c'
import 'prismjs/components/prism-cpp'
import 'prismjs/components/prism-csharp'
import 'prismjs/components/prism-swift'
// Data & config
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-toml'
import 'prismjs/components/prism-graphql'
import 'prismjs/components/prism-regex'
// Markup & docs
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-latex'

export type CodeBlockLanguageOption = {
  /** Prism grammar id — stored on the CodeNode via setLanguage(). */
  id: string
  /** Human-readable name shown in the picker. */
  label: string
}

/** Sorted by label; `plain` first as the no-highlighting default escape hatch. */
export const CODE_BLOCK_LANGUAGE_OPTIONS: readonly CodeBlockLanguageOption[] = [
  { id: 'plain', label: 'Plain text' },
  { id: 'bash', label: 'Bash' },
  { id: 'c', label: 'C' },
  { id: 'cpp', label: 'C++' },
  { id: 'csharp', label: 'C#' },
  { id: 'css', label: 'CSS' },
  { id: 'docker', label: 'Dockerfile' },
  { id: 'go', label: 'Go' },
  { id: 'graphql', label: 'GraphQL' },
  { id: 'groovy', label: 'Groovy' },
  { id: 'handlebars', label: 'Handlebars' },
  { id: 'markup', label: 'HTML / XML' },
  { id: 'java', label: 'Java' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'json', label: 'JSON' },
  { id: 'jsx', label: 'JSX' },
  { id: 'kotlin', label: 'Kotlin' },
  { id: 'latex', label: 'LaTeX' },
  { id: 'less', label: 'Less' },
  { id: 'markdown', label: 'Markdown' },
  { id: 'nginx', label: 'Nginx' },
  { id: 'php', label: 'PHP' },
  { id: 'python', label: 'Python' },
  { id: 'regex', label: 'Regex' },
  { id: 'ruby', label: 'Ruby' },
  { id: 'rust', label: 'Rust' },
  { id: 'scss', label: 'SCSS' },
  { id: 'sql', label: 'SQL' },
  { id: 'swift', label: 'Swift' },
  { id: 'toml', label: 'TOML' },
  { id: 'tsx', label: 'TSX' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'yaml', label: 'YAML' },
] as const

export function getCodeBlockLanguageLabel(languageId: string | null | undefined): string {
  if (!languageId) return 'Plain text'
  const option = CODE_BLOCK_LANGUAGE_OPTIONS.find((candidate) => candidate.id === languageId)
  return option?.label ?? languageId
}

export function findCodeBlockLanguageByLabel(label: string): CodeBlockLanguageOption | undefined {
  return CODE_BLOCK_LANGUAGE_OPTIONS.find((candidate) => candidate.label === label)
}
