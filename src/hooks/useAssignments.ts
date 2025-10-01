import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Assignment, AssignmentWithCohort } from '../types'
import toast from 'react-hot-toast'

export const useAssignments = () => {
  const [assignments, setAssignments] = useState<AssignmentWithCohort[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchAssignments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('assignments')
        .select('*, cohorts(*)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAssignments(data as AssignmentWithCohort[] || [])
    } catch (err) {
      const error = err as Error
      setError(error)
      toast.error('Failed to load assignments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssignments()
  }, [])

  const createAssignment = async (assignmentData: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await supabase
        .from('assignments')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert(assignmentData as any)
        .select('*, cohorts(*)')
        .single()

      if (error) throw error

      toast.success('Assignment created successfully!')
      await fetchAssignments()
      return { data: data as AssignmentWithCohort, error: null }
    } catch (err) {
      const error = err as Error
      toast.error('Failed to create assignment')
      return { data: null, error }
    }
  }

  const updateAssignment = async (id: string, updates: Partial<Assignment>) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase
        .from('assignments') as any)
        .update(updates)
        .eq('id', id)
        .select('*, cohorts(*)')
        .single()

      if (error) throw error

      toast.success('Assignment updated successfully!')
      await fetchAssignments()
      return { data: data as AssignmentWithCohort, error: null }
    } catch (err) {
      const error = err as Error
      toast.error('Failed to update assignment')
      return { data: null, error }
    }
  }

  const deleteAssignment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Assignment deleted successfully!')
      await fetchAssignments()
      return { error: null }
    } catch (err) {
      const error = err as Error
      toast.error('Failed to delete assignment')
      return { error }
    }
  }

  return {
    assignments,
    loading,
    error,
    refetch: fetchAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
  }
}

export const useAssignment = (id: string) => {
  const [assignment, setAssignment] = useState<AssignmentWithCohort | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('assignments')
          .select('*, cohorts(*)')
          .eq('id', id)
          .single()

        if (error) throw error
        setAssignment(data as AssignmentWithCohort)
      } catch (err) {
        const error = err as Error
        setError(error)
        toast.error('Failed to load assignment')
      } finally {
        setLoading(false)
      }
    }

    fetchAssignment()
  }, [id])

  return { assignment, loading, error }
}

export const useCohortAssignments = (cohortId: string) => {
  const [assignments, setAssignments] = useState<AssignmentWithCohort[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchCohortAssignments = async () => {
      if (!cohortId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('assignments')
          .select('*, cohorts(*)')
          .eq('cohort_id', cohortId)
          .order('due_date', { ascending: true })

        if (error) throw error
        setAssignments(data as AssignmentWithCohort[] || [])
      } catch (err) {
        const error = err as Error
        setError(error)
      } finally {
        setLoading(false)
      }
    }

    fetchCohortAssignments()
  }, [cohortId])

  return { assignments, loading, error }
}

