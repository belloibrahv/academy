import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { InviteLinkWithCohort } from '../types'
import toast from 'react-hot-toast'
import { nanoid } from 'nanoid'

export const useInviteLinks = () => {
  const [inviteLinks, setInviteLinks] = useState<InviteLinkWithCohort[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchInviteLinks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('invite_links')
        .select('*, cohorts(*)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setInviteLinks(data as InviteLinkWithCohort[] || [])
    } catch (err) {
      const error = err as Error
      setError(error)
      toast.error('Failed to load invite links')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInviteLinks()
  }, [])

  const generateInviteLink = async (
    cohortId: string,
    expiresAt: string,
    maxUses: number | null = null
  ) => {
    try {
      const token = nanoid(32) // Generate secure random token
      
      const linkData = {
        token,
        cohort_id: cohortId,
        expires_at: expiresAt,
        max_uses: maxUses,
        used: false,
        used_at: null,
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await supabase
        .from('invite_links')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert(linkData as any)
        .select('*, cohorts(*)')
        .single()

      if (error) throw error

      toast.success('Invite link generated successfully!')
      await fetchInviteLinks()
      return { data: data as InviteLinkWithCohort, error: null }
    } catch (err) {
      const error = err as Error
      toast.error('Failed to generate invite link')
      return { data: null, error }
    }
  }

  const deleteInviteLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('invite_links')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Invite link deleted successfully!')
      await fetchInviteLinks()
      return { error: null }
    } catch (err) {
      const error = err as Error
      toast.error('Failed to delete invite link')
      return { error }
    }
  }

  const resendInviteLink = async (token: string, email: string) => {
    try {
      // This would integrate with an email service
      // For now, we'll just copy to clipboard
      const inviteUrl = `${import.meta.env.VITE_APP_URL}/register?token=${token}`
      
      await navigator.clipboard.writeText(inviteUrl)
      toast.success(`Link copied! Send to ${email}`)
      
      return { error: null }
    } catch (err) {
      const error = err as Error
      toast.error('Failed to copy link')
      return { error }
    }
  }

  return {
    inviteLinks,
    loading,
    error,
    refetch: fetchInviteLinks,
    generateInviteLink,
    deleteInviteLink,
    resendInviteLink,
  }
}

export const useInviteLink = (token: string) => {
  const [inviteLink, setInviteLink] = useState<InviteLinkWithCohort | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchInviteLink = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('invite_links')
          .select('*, cohorts(*)')
          .eq('token', token)
          .single()

        if (error) throw error
        setInviteLink(data as InviteLinkWithCohort)
      } catch (err) {
        const error = err as Error
        setError(error)
      } finally {
        setLoading(false)
      }
    }

    fetchInviteLink()
  }, [token])

  return { inviteLink, loading, error }
}

