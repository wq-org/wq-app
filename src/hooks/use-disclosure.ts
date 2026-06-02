import { useState } from 'react'

type UseDisclosureOptions = {
  defaultIsOpen?: boolean
}

export function useDisclosure({ defaultIsOpen = false }: UseDisclosureOptions = {}) {
  const [isOpen, setIsOpen] = useState(defaultIsOpen)

  const onOpen = () => setIsOpen(true)
  const onClose = () => setIsOpen(false)
  const onToggle = (nextOpen?: boolean) => {
    if (typeof nextOpen === 'boolean') {
      setIsOpen(nextOpen)
      return
    }

    setIsOpen((currentValue) => !currentValue)
  }

  return { isOpen, setIsOpen, onOpen, onClose, onToggle }
}
