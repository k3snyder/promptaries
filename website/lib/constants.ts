export const CATEGORIES = [
  'MetaPrompting',
  'Writing',
  'Coding',
  'Marketing',
  'Productivity',
  'Business',
  'Analysis',
  'Research',
  'Education',
  'Creative',
] as const

export type Category = (typeof CATEGORIES)[number]

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Forked' },
  { value: 'views', label: 'Most Viewed' },
] as const

export const LLM_PLATFORMS = [
  { id: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com/' },
  { id: 'claude', name: 'Claude', url: 'https://claude.ai/new' },
  { id: 'circuit', name: 'Circuit', url: process.env.NEXT_PUBLIC_CIRCUIT_URL || 'https://circuit.example.com/chat' },
] as const

export const LIMITS = {
  PROMPTS_PER_PAGE: 20,
  MAX_TAGS: 10,
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 300,
  MAX_PROMPT_LENGTH: 10000,
} as const
