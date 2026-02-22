import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import type { FollowStatus } from '../api/followApi'
import * as followApi from '../api/followApi'

export interface UseFollowOptions {
  onFollowSuccess?: () => void
}

export function useFollow(teacherId: string | null, options?: UseFollowOptions) {
  const { onFollowSuccess } = options ?? {}
  const [followStatus, setFollowStatus] = useState<FollowStatus>('none')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  const isFollowing = followStatus === 'accepted'

  const refetch = useCallback(async () => {
    if (!teacherId) return
    setChecking(true)
    try {
      const status = await followApi.getFollowStatus(teacherId)
      setFollowStatus(status)
    } catch {
      setFollowStatus('none')
    } finally {
      setChecking(false)
    }
  }, [teacherId])

  useEffect(() => {
    if (!teacherId) {
      setFollowStatus('none')
      setChecking(false)
      return
    }

    let cancelled = false
    setChecking(true)

    followApi
      .getFollowStatus(teacherId)
      .then((status) => {
        if (!cancelled) setFollowStatus(status)
      })
      .catch(() => {
        if (!cancelled) setFollowStatus('none')
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
      if (followStatus === 'accepted') {
        await followApi.unfollow(teacherId)
        setFollowStatus('none')
        toast.success('Unfollowed')
      } else {
        await followApi.follow(teacherId)
        setFollowStatus('accepted')
        toast.success('Followed')
        onFollowSuccess?.()
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
      const errorMessage =
        typeof error === 'object' && error !== null && 'message' in error
          ? String(error.message)
          : 'Something went wrong'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [teacherId, followStatus, onFollowSuccess])

  return {
    isFollowing,
    followStatus,
    loading: loading || checking,
    toggleFollow,
    refetch,
  }
}
