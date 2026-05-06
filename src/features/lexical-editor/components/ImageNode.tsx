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

import {
  $applyNodeReplacement,
  DecoratorNode,
} from 'lexical'

import { ImageNodeComponent } from './ImageNodeComponent'

export type SerializedImageNode = Spread<
  {
    altText: string
    height?: number
    maxWidth: number
    src: string
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
      node.__key,
    )
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { altText, height, maxWidth, src, width } = serializedNode
    return $createImageNode({
      altText,
      height,
      maxWidth,
      src,
      width,
    }).updateFromJSON(serializedNode)
  }

  constructor(
    src: string,
    altText: string,
    maxWidth: number,
    width: 'inherit' | number = 'inherit',
    height: 'inherit' | number = 'inherit',
    key?: NodeKey,
  ) {
    super(key)
    this.__src = src
    this.__altText = altText
    this.__maxWidth = maxWidth
    this.__width = width
    this.__height = height
  }

  exportJSON(): SerializedImageNode {
    return {
      ...super.exportJSON(),
      altText: this.__altText,
      height: this.__height === 'inherit' ? undefined : this.__height,
      maxWidth: this.__maxWidth,
      src: this.__src,
      width: this.__width === 'inherit' ? undefined : this.__width,
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
  key,
}: ImagePayload): ImageNode {
  const resolvedWidth = width === undefined ? 'inherit' : width
  const resolvedHeight = height === undefined ? 'inherit' : height
  return $applyNodeReplacement(
    new ImageNode(src, altText, maxWidth, resolvedWidth, resolvedHeight, key),
  )
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode
}
