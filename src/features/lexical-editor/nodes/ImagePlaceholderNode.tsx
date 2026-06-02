import {
  $applyNodeReplacement,
  DecoratorNode,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
} from 'lexical'
import type { JSX } from 'react'

import { ImageNodeFrame } from '../components/ImageNodeFrame'

export type SerializedImagePlaceholderNode = SerializedLexicalNode

export class ImagePlaceholderNode extends DecoratorNode<JSX.Element> {
  static getType(): string {
    return 'image-placeholder'
  }

  static clone(node: ImagePlaceholderNode): ImagePlaceholderNode {
    return new ImagePlaceholderNode(node.__key)
  }

  static importJSON(): ImagePlaceholderNode {
    return $createImagePlaceholderNode()
  }

  exportJSON(): SerializedImagePlaceholderNode {
    return super.exportJSON()
  }

  createDOM(): HTMLElement {
    return document.createElement('span')
  }

  updateDOM(): false {
    return false
  }

  decorate(): JSX.Element {
    return (
      <ImageNodeFrame
        variant="loading"
        ariaLabel="Uploading image"
      />
    )
  }
}

export function $createImagePlaceholderNode(key?: NodeKey): ImagePlaceholderNode {
  return $applyNodeReplacement(new ImagePlaceholderNode(key))
}

export function $isImagePlaceholderNode(
  node: LexicalNode | null | undefined,
): node is ImagePlaceholderNode {
  return node instanceof ImagePlaceholderNode
}
