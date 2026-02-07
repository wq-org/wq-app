import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import * as followApi from '../api/followApi'

export function useFollow(teacherId: string | null) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!teacherId) {
      setIsFollowing(false)
      setChecking(false)
      return
    }

    let cancelled = false
    setChecking(true)

    followApi
      .isFollowing(teacherId)
      .then((following) => {
        if (!cancelled) setIsFollowing(following)
      })
      .catch(() => {
        if (!cancelled) setIsFollowing(false)
      })
      .finally(() => {
        if (!cancelled) setChecking(false)
      })

    return () => {
      cancelled = true
    }
  }, [teacherId])

  const toggleFollow = useCallback(async () => {
    if (!teacherId) return
    setLoading(true)
    try {
      if (isFollowing) {
        await followApi.unfollow(teacherId)
        setIsFollowing(false)
        toast.success('Unfollowed')
      } else {
        await followApi.follow(teacherId)
        setIsFollowing(true)
        toast.success('Following')
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [teacherId, isFollowing])

  return { isFollowing, loading: loading || checking, toggleFollow }
}
