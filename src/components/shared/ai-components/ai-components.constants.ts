import { AlertTriangle, Gauge, Sparkles } from 'lucide-react'
import type { Ai02ModelOption, Ai02PromptSuggestion } from './ai-components.types'

export const AI02_DEFAULT_PROMPTS = [
  {
    icon: Sparkles,
    text: 'Write documentation',
    prompt:
      'Write comprehensive documentation for this codebase, including setup instructions, API references, and usage examples.',
  },
  {
    icon: Gauge,
    text: 'Optimize performance',
    prompt:
      'Analyze the codebase for performance bottlenecks and suggest optimizations to improve loading times and runtime efficiency.',
  },
  {
    icon: AlertTriangle,
    text: 'Find and fix 3 bugs',
    prompt:
      'Scan through the codebase to identify and fix 3 critical bugs, providing detailed explanations for each fix.',
  },
] as const satisfies readonly Ai02PromptSuggestion[]

export const AI02_DEFAULT_MODELS = [
  {
    value: 'gpt-5',
    name: 'GPT-5',
    description: 'Most advanced model',
    max: true,
  },
  {
    value: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Fast and capable',
  },
  {
    value: 'gpt-4',
    name: 'GPT-4',
    description: 'Reliable and accurate',
  },
  {
    value: 'claude-3.5',
    name: 'Claude 3.5 Sonnet',
    description: 'Great for coding tasks',
  },
] as const satisfies readonly Ai02ModelOption[]
