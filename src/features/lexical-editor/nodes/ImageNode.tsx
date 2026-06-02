import './ImageNode.css'

import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical'
import type { JSX } from 'react'

import { $applyNodeReplacement, DecoratorNode } from 'lexical'

import { ImageNodeComponent } from './ImageNodeComponent'

export type SerializedImageNode = Spread<
  {
    altText: string
    height?: number
    maxWidth: number
    src: string
    filepath: string | null
    cloudFileId: string | null
    width?: number
  },
  SerializedLexicalNode
>

export type ImagePayload = {
  altText: string
  height?: number
  key?: NodeKey
  maxWidth?: number
  src: string
  filepath?: string | null
  cloudFileId?: string | null
  width?: number
}

function $convertImageElement(domNode: Node): DOMConversionOutput | null {
  const img = domNode as HTMLImageElement
  const src = img.getAttribute('src')
  if (!src || src.startsWith('file:///')) return null

  const altText = img.getAttribute('alt') ?? ''
  const widthAttr = img.getAttribute('width')
  const heightAttr = img.getAttribute('height')
  const width = widthAttr ? Number.parseInt(widthAttr, 10) : undefined
  const height = heightAttr ? Number.parseInt(heightAttr, 10) : undefined

  return {
    node: $createImageNode({
      altText,
      height: Number.isFinite(height) ? height : undefined,
      maxWidth: 720,
      src,
      width: Number.isFinite(width) ? width : undefined,
    }),
  }
}

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string
  __altText: string
  __maxWidth: number
  __width: 'inherit' | number
  __height: 'inherit' | number
  __filepath: string | null
  __cloudFileId: string | null

  static getType(): string {
    return 'image'
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__maxWidth,
      node.__width,
      node.__height,
      node.__filepath,
      node.__cloudFileId,
      node.__key,
    )
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { altText, height, maxWidth, src, width, filepath, cloudFileId } = serializedNode
    return $createImageNode({
      altText,
      height,
      maxWidth,
      src,
      width,
      filepath: filepath ?? null,
      cloudFileId: cloudFileId ?? null,
    }).updateFromJSON(serializedNode)
  }

  constructor(
    src: string,
    altText: string,
    maxWidth: number,
    width: 'inherit' | number = 'inherit',
    height: 'inherit' | number = 'inherit',
    filepath: string | null = null,
    cloudFileId: string | null = null,
    key?: NodeKey,
  ) {
    super(key)
    this.__src = src
    this.__altText = altText
    this.__maxWidth = maxWidth
    this.__width = width
    this.__height = height
    this.__filepath = filepath
    this.__cloudFileId = cloudFileId
  }

  exportJSON(): SerializedImageNode {
    return {
      ...super.exportJSON(),
      altText: this.__altText,
      height: this.__height === 'inherit' ? undefined : this.__height,
      maxWidth: this.__maxWidth,
      src: this.__src,
      width: this.__width === 'inherit' ? undefined : this.__width,
      filepath: this.__filepath,
      cloudFileId: this.__cloudFileId,
    }
  }

  exportDOM(): DOMExportOutput {
    const img = document.createElement('img')
    img.setAttribute('src', this.__src)
    img.setAttribute('alt', this.__altText)
    if (this.__width !== 'inherit') img.setAttribute('width', String(this.__width))
    if (this.__height !== 'inherit') img.setAttribute('height', String(this.__height))
    return { element: img }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        conversion: $convertImageElement,
        priority: 0,
      }),
    }
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span')
    const className = config.theme.image
    if (className !== undefined) {
      span.className = className
    }
    return span
  }

  updateDOM(): false {
    return false
  }

  setSrc(src: string): this {
    const writable = this.getWritable()
    writable.__src = src
    return writable
  }

  setAltText(altText: string): this {
    const writable = this.getWritable()
    writable.__altText = altText
    return writable
  }

  setCloudReference(filepath: string | null, cloudFileId: string | null): this {
    const writable = this.getWritable()
    writable.__filepath = filepath
    writable.__cloudFileId = cloudFileId
    return writable
  }

  getCloudFileId(): string | null {
    return this.__cloudFileId
  }

  getFilepath(): string | null {
    return this.__filepath
  }

  decorate(): JSX.Element {
    return (
      <ImageNodeComponent
        altText={this.__altText}
        height={this.__height}
        maxWidth={this.__maxWidth}
        nodeKey={this.getKey()}
        src={this.__src}
        width={this.__width}
      />
    )
  }
}

export function $createImageNode({
  altText,
  height,
  maxWidth = 720,
  src,
  width,
  filepath = null,
  cloudFileId = null,
  key,
}: ImagePayload): ImageNode {
  const resolvedWidth = width === undefined ? 'inherit' : width
  const resolvedHeight = height === undefined ? 'inherit' : height
  return $applyNodeReplacement(
    new ImageNode(
      src,
      altText,
      maxWidth,
      resolvedWidth,
      resolvedHeight,
      filepath,
      cloudFileId,
      key,
    ),
  )
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode
}
