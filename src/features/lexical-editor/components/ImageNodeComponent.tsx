import type { NodeKey } from 'lexical'

export type ImageNodeComponentProps = {
  altText: string
  height: 'inherit' | number
  maxWidth: number
  nodeKey: NodeKey
  src: string
  width: 'inherit' | number
}

export function ImageNodeComponent({
  altText,
  height,
  maxWidth,
  src,
  width,
}: ImageNodeComponentProps) {
  return (
    <img
      alt={altText}
      className="ImageNode__image"
      draggable={false}
      src={src}
      style={{
        height: height === 'inherit' ? undefined : height,
        maxWidth,
        width: width === 'inherit' ? '100%' : width,
      }}
    />
  )
}
