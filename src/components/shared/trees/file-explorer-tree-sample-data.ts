import type { FileExplorerTreeNode } from './file-explorer-tree.types'

export const fileExplorerTreeSampleItems: Record<string, FileExplorerTreeNode> = {
  root: {
    name: 'my-project',
    children: ['src', 'public', 'package-json', 'readme', 'tsconfig'],
  },
  src: {
    name: 'src',
    children: ['app', 'components', 'lib', 'globals-css'],
    type: 'folder',
  },
  app: {
    name: 'app',
    children: ['page-tsx', 'layout-tsx', 'loading-tsx'],
    type: 'folder',
  },
  'page-tsx': { name: 'page.tsx', type: 'tsx' },
  'layout-tsx': { name: 'layout.tsx', type: 'tsx' },
  'loading-tsx': { name: 'loading.tsx', type: 'tsx' },
  components: {
    name: 'components',
    children: ['button-tsx', 'card-tsx', 'dialog-tsx'],
    type: 'folder',
  },
  'button-tsx': { name: 'button.tsx', type: 'tsx' },
  'card-tsx': { name: 'card.tsx', type: 'tsx' },
  'dialog-tsx': { name: 'dialog.tsx', type: 'tsx' },
  lib: { name: 'lib', children: ['utils-ts', 'api-ts'], type: 'folder' },
  'utils-ts': { name: 'utils.ts', type: 'ts' },
  'api-ts': { name: 'api.ts', type: 'ts' },
  'globals-css': { name: 'globals.css', type: 'css' },
  public: { name: 'public', children: ['favicon'], type: 'folder' },
  favicon: { name: 'favicon.ico', type: 'config' },
  'package-json': { name: 'package.json', type: 'json' },
  readme: { name: 'README.md', type: 'md' },
  tsconfig: { name: 'tsconfig.json', type: 'json' },
}

export const fileExplorerTreeSampleRootItemId = 'root'

export const fileExplorerTreeSampleInitialExpandedItemIds: readonly string[] = [
  'src',
  'app',
  'components',
]
