import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Cohort } from '../types'
import toast from 'react-hot-toast'

export const useCohorts = () => {
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCohorts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('cohorts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCohorts(data as Cohort[] || [])
    } catch (err) {
      const error = err as Error
      setError(error)
      toast.error('Failed to load cohorts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCohorts()
  }, [])

  const createCohort = async (cohortData: Omit<Cohort, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await supabase
        .from('cohorts')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert(cohortData as any)
        .select()
        .single()

      if (error) throw error
      
      toast.success('Cohort created successfully!')
      await fetchCohorts()
      return { data: data as Cohort, error: null }
    } catch (err) {
      const error = err as Error
      toast.error('Failed to create cohort')
      return { data: null, error }
    }
  }

  const updateCohort = async (id: string, updates: Partial<Cohort>) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase
        .from('cohorts') as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      toast.success('Cohort updated successfully!')
      await fetchCohorts()
      return { data: data as Cohort, error: null }
    } catch (err) {
      const error = err as Error
      toast.error('Failed to update cohort')
      return { data: null, error }
    }
  }

  const deleteCohort = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cohorts')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Cohort deleted successfully!')
      await fetchCohorts()
      return { error: null }
    } catch (err) {
      const error = err as Error
      toast.error('Failed to delete cohort')
      return { error }
    }
  }

  return {
    cohorts,
    loading,
    error,
    refetch: fetchCohorts,
    createCohort,
    updateCohort,
    deleteCohort,
  }
}

export const useCohort = (id: string) => {
  const [cohort, setCohort] = useState<Cohort | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchCohort = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('cohorts')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        setCohort(data as Cohort)
      } catch (err) {
        const error = err as Error
        setError(error)
        toast.error('Failed to load cohort')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchCohort()
    }
  }, [id])

  return { cohort, loading, error }
}

