import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Submission } from '../types'
import toast from 'react-hot-toast'

export const useSubmissions = (assignmentId?: string) => {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('submissions')
        .select('*')
        .order('submitted_at', { ascending: false })

      if (assignmentId) {
        query = query.eq('assignment_id', assignmentId)
      }

      const { data, error } = await query

      if (error) throw error
      setSubmissions(data as Submission[] || [])
    } catch (err) {
      const error = err as Error
      setError(error)
      toast.error('Failed to load submissions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [assignmentId])

  const createSubmission = async (submissionData: {
    assignment_id: string
    student_id: string
    submission_text?: string
    file_url?: string
  }) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await supabase
        .from('submissions')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert({
          ...submissionData,
          submitted_at: new Date().toISOString(),
          status: 'pending'
        } as any)
        .select()
        .single()

      if (error) throw error

      toast.success('Submission submitted successfully!')
      await fetchSubmissions()
      return { data: data as Submission, error: null }
    } catch (err) {
      const error = err as Error
      toast.error('Failed to submit assignment')
      return { data: null, error }
    }
  }

  const gradeSubmission = async (
    id: string,
    score: number,
    feedback?: string
  ) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase
        .from('submissions') as any)
        .update({
          score,
          feedback: feedback || null,
          status: 'graded',
          graded_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      toast.success('Submission graded successfully!')
      await fetchSubmissions()
      return { data: data as Submission, error: null }
    } catch (err) {
      const error = err as Error
      toast.error('Failed to grade submission')
      return { data: null, error }
    }
  }

  return {
    submissions,
    loading,
    error,
    refetch: fetchSubmissions,
    createSubmission,
    gradeSubmission,
  }
}

export const useStudentSubmissions = (studentId: string) => {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchStudentSubmissions = async () => {
      if (!studentId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('submissions')
          .select('*')
          .eq('student_id', studentId)
          .order('submitted_at', { ascending: false })

        if (error) throw error
        setSubmissions(data as Submission[] || [])
      } catch (err) {
        const error = err as Error
        setError(error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudentSubmissions()
  }, [studentId])

  return { submissions, loading, error }
}

export const useSubmission = (assignmentId: string, studentId: string) => {
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchSubmission = async () => {
      if (!assignmentId || !studentId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('submissions')
          .select('*')
          .eq('assignment_id', assignmentId)
          .eq('student_id', studentId)
          .maybeSingle()

        if (error) throw error
        setSubmission(data as Submission | null)
      } catch (err) {
        const error = err as Error
        setError(error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubmission()
  }, [assignmentId, studentId])

  return { submission, loading, error }
}

