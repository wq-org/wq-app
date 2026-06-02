export interface NavigationSubItemConfig {
  key: string
  href: string
}

export interface NavigationGroupConfig {
  key: string
  sectionId: string
  items: NavigationSubItemConfig[]
}

export interface LandingPageConfig {
  key: string
  path: string
}

export const landingStandalonePages: LandingPageConfig[] = [
  {
    key: 'contact',
    path: '/contact',
  },
]

export const landingNavigationGroups: NavigationGroupConfig[] = [
  {
    key: 'success',
    sectionId: 'success',
    items: [
      { key: 'endLearningApathy', href: '/success/end-learning-apathy' },
      { key: 'intuitiveGaming', href: '/success/intuitive-gaming' },
    ],
  },
  {
    key: 'solutions',
    sectionId: 'solutions',
    items: [
      { key: 'teachers', href: '/solutions/teachers' },
      { key: 'learners', href: '/solutions/learners' },
      { key: 'institutions', href: '/solutions/institutions' },
    ],
  },
  {
    key: 'platform',
    sectionId: 'platform',
    items: [
      { key: 'workspace', href: '/platform/workspace' },
      { key: 'gameStudio', href: '/platform/game-studio' },
      { key: 'analytics', href: '/platform/analytics' },
    ],
  },
  {
    key: 'science',
    sectionId: 'science',
    items: [
      { key: 'wqConcept', href: '/science/wq-concept' },
      { key: 'evidence', href: '/science/evidence' },
    ],
  },
  {
    key: 'mission',
    sectionId: 'mission',
    items: [
      { key: 'vision', href: '/mission/vision' },
      { key: 'partners', href: '/mission/partners' },
    ],
  },
]

export const landingFooterGroups: NavigationGroupConfig[] = [
  {
    key: 'pages',
    sectionId: 'pages',
    items: [
      { key: 'home', href: '/' },
      { key: 'changelog', href: '/changelog' },
    ],
  },
  {
    key: 'platform',
    sectionId: 'platform',
    items: [
      { key: 'workspace', href: '/platform/workspace' },
      { key: 'gameStudio', href: '/platform/game-studio' },
      { key: 'analytics', href: '/platform/analytics' },
      { key: 'collaboration', href: '/platform/collaboration' },
      { key: 'pricing', href: '/platform/pricing' },
    ],
  },
  {
    key: 'success',
    sectionId: 'success',
    items: [
      { key: 'institutions', href: '/solutions/institutions' },
      { key: 'teachers', href: '/solutions/teachers' },
      { key: 'learners', href: '/solutions/learners' },
      { key: 'woundCare', href: '/success/wound-care' },
    ],
  },
  {
    key: 'science',
    sectionId: 'science',
    items: [
      { key: 'wqConcept', href: '/science/wq-concept' },
      { key: 'evidence', href: '/science/evidence' },
      { key: 'vision', href: '/mission/vision' },
      { key: 'blog', href: '/science/blog' },
      { key: 'helpCenter', href: '/science/help-center' },
    ],
  },
  {
    key: 'trust',
    sectionId: 'trust',
    items: [
      { key: 'security', href: '/trust/security' },
      { key: 'privacy', href: '/trust/privacy' },
      { key: 'compliance', href: '/trust/compliance' },
      { key: 'licenses', href: '/trust/licenses' },
    ],
  },
]

function uniquePages(groups: NavigationGroupConfig[]): LandingPageConfig[] {
  const seen = new Set<string>()
  const pages: LandingPageConfig[] = []

  for (const group of groups) {
    for (const item of group.items) {
      if (seen.has(item.href)) continue
      seen.add(item.href)
      pages.push({
        key: item.key,
        path: item.href,
      })
    }
  }

  return pages
}

function mergePagesByPath(...lists: LandingPageConfig[][]): LandingPageConfig[] {
  const seen = new Set<string>()
  const out: LandingPageConfig[] = []
  for (const list of lists) {
    for (const page of list) {
      if (seen.has(page.path)) continue
      seen.add(page.path)
      out.push(page)
    }
  }
  return out
}

export const landingPages = mergePagesByPath(
  uniquePages([...landingNavigationGroups, ...landingFooterGroups]),
  landingStandalonePages,
)
