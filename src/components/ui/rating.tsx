'use client'

import * as React from 'react'
import { StarIcon } from 'lucide-react'
import { type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import {
  ratingVariants,
  starIconVariants,
  starWrapVariants,
  valueVariants,
} from './rating-variants'

export type RatingProps = Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange'> &
  VariantProps<typeof ratingVariants> & {
    value?: number
    defaultValue?: number
    onValueChange?: (value: number) => void
    maxRating?: number
    showValue?: boolean
    editable?: boolean
    starClassName?: string
    valueClassName?: string
  }

function clampRating(rating: number, maxRating: number) {
  if (Number.isNaN(rating)) return 0
  return Math.min(Math.max(rating, 0), maxRating)
}

function getRatingLabel(value: number, maxRating: number) {
  return `Set rating to ${value} out of ${maxRating}`
}

export const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      value,
      defaultValue = 0,
      onValueChange,
      maxRating = 5,
      size,
      className,
      starClassName,
      valueClassName,
      showValue = false,
      editable = false,
      ...props
    },
    ref,
  ) => {
    const [hoveredRating, setHoveredRating] = React.useState<number | null>(null)
    const [internalValue, setInternalValue] = React.useState<number>(defaultValue)
    const isControlled = value !== undefined
    const selected = isControlled ? value : internalValue
    const safeRating = clampRating(selected ?? 0, maxRating)
    const displayRating = editable && hoveredRating !== null ? hoveredRating : safeRating

    const handleStarClick = (nextRating: number) => {
      if (!editable) return

      if (!isControlled) {
        setInternalValue(nextRating)
      }

      onValueChange?.(nextRating)
    }

    const handleMouseEnter = (nextRating: number) => {
      if (!editable) return
      setHoveredRating(nextRating)
    }

    const handleMouseLeave = () => {
      if (!editable) return
      setHoveredRating(null)
    }

    return (
      <div
        ref={ref}
        data-slot="rating"
        className={cn(ratingVariants({ size }), className)}
        role={editable ? 'radiogroup' : 'img'}
        aria-label={
          editable
            ? `Interactive rating, current value ${displayRating.toFixed(1)} out of ${maxRating}`
            : `Rating ${displayRating.toFixed(1)} out of ${maxRating}`
        }
        {...props}
      >
        <div className="flex items-center gap-1">
          {Array.from({ length: maxRating }, (_, index) => {
            const starValue = index + 1
            const filled = displayRating >= starValue
            const partiallyFilled = displayRating > index && displayRating < starValue
            const fillPercentage = partiallyFilled ? (displayRating - index) * 100 : 0

            const starContent = (
              <span className={cn(starWrapVariants({ size }))}>
                <StarIcon
                  aria-hidden="true"
                  className={cn(
                    starIconVariants({ size }),
                    'text-muted-foreground/25',
                    starClassName,
                  )}
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    width: filled ? '100%' : `${fillPercentage}%`,
                  }}
                >
                  <StarIcon
                    className={cn(
                      starIconVariants({ size }),
                      'fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400',
                      starClassName,
                    )}
                  />
                </span>
              </span>
            )

            if (!editable) {
              return (
                <span
                  key={starValue}
                  className="inline-flex"
                >
                  {starContent}
                </span>
              )
            }

            return (
              <button
                key={starValue}
                type="button"
                role="radio"
                aria-checked={displayRating >= starValue}
                aria-label={getRatingLabel(starValue, maxRating)}
                className="cursor-pointer rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onClick={() => handleStarClick(starValue)}
                onMouseEnter={() => handleMouseEnter(starValue)}
                onMouseLeave={handleMouseLeave}
              >
                {starContent}
              </button>
            )
          })}
        </div>
        {showValue ? (
          <span
            data-slot="rating-value"
            className={cn(valueVariants({ size }), valueClassName)}
          >
            {displayRating.toFixed(1)}
          </span>
        ) : null}
      </div>
    )
  },
)

Rating.displayName = 'Rating'
