export type NavigationSubItemConfig = {
  key: string
  href: string
}

export type NavigationGroupConfig = {
  key: string
  sectionId: string
  items: NavigationSubItemConfig[]
}

export type LandingPageConfig = {
  key: string
  path: string
}

export const landingContactPath = '/contact'
export const landingLoginPath = '/auth/login'
export const landingDocsPath = '/docs'

export const landingStandalonePages: LandingPageConfig[] = [
  { key: 'impressum', path: '/legal/impressum' },
  { key: 'agb', path: '/legal/agb' },
]

export const landingNavigationGroups: NavigationGroupConfig[] = [
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
    key: 'mission',
    sectionId: 'mission',
    items: [
      { key: 'vision', href: '/mission/vision' },
      { key: 'partners', href: '/mission/partners' },
    ],
  },
  {
    key: 'docs',
    sectionId: 'docs',
    items: [{ key: 'docs', href: landingDocsPath }],
  },
]

export const landingFooterGroups: NavigationGroupConfig[] = [
  {
    key: 'pages',
    sectionId: 'pages',
    items: [
      { key: 'home', href: '/' },
      { key: 'changelog', href: '/changelog' },
      { key: 'docs', href: landingDocsPath },
    ],
  },
  {
    key: 'trust',
    sectionId: 'trust',
    items: [
      { key: 'security', href: '/trust/security' },
      { key: 'privacy', href: '/trust/privacy' },
      { key: 'compliance', href: '/trust/compliance' },
    ],
  },
  {
    key: 'legal',
    sectionId: 'legal',
    items: [
      { key: 'impressum', href: '/legal/impressum' },
      { key: 'agb', href: '/legal/agb' },
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
