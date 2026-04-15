'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { Rating } from '@/components/ui/rating'

export function RatingWithEditable() {
  const [productRating, setProductRating] = useState(0)

  const handleRatingChange = (rating: number) => {
    setProductRating(rating)

    toast.success('Rated {rating} out of 5', {
      description: `Rated ${rating} out of 5`,
    })
  }

  return (
    <div className="space-y-8">
      <Rating
        rating={productRating}
        editable
        onRatingChange={handleRatingChange}
        showValue
      />
    </div>
  )
}
