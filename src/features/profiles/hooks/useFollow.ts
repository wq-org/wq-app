import { useState } from 'react'

export function useFollow() {
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(false)

  const toggleFollow = async (userId: string) => {
    setLoading(true)
    try {
      // TODO: Implement follow/unfollow API call
      console.log(isFollowing ? 'Unfollow' : 'Follow', userId)
      setIsFollowing(!isFollowing)
    } catch (error) {
      console.error('Error toggling follow:', error)
    } finally {
      setLoading(false)
    }
  }

  return { isFollowing, loading, toggleFollow }
}

