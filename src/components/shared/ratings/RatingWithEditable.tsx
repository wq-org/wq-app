'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { Rating } from '@/components/ui/rating'

type RatingWithEditableProps = {
  initialRating?: number
  maxRating?: number
  showValue?: boolean
  toastTitle?: string
}

export function RatingWithEditable({
  initialRating = 0,
  maxRating = 5,
  showValue = true,
  toastTitle = 'Rated {rating} out of 5',
}: RatingWithEditableProps) {
  const [productRating, setProductRating] = useState(initialRating)

  const handleRatingChange = (rating: number) => {
    setProductRating(rating)

    toast.success(toastTitle.replace('{rating}', String(rating)), {
      description: `Rated ${rating} out of ${maxRating}`,
    })
  }

  return (
    <div className="space-y-8">
      <Rating
        rating={productRating}
        maxRating={maxRating}
        editable
        onRatingChange={handleRatingChange}
        showValue={showValue}
      />
    </div>
  )
}
