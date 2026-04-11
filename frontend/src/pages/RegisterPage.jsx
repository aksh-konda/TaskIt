import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import AuthForm from '../components/AuthForm'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../context/useAuth'

const initialValues = {
  displayName: '',
  email: '',
  password: '',
}

export default function RegisterPage() {
  const { isAuthenticated, register } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState(initialValues)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await register({
        displayName: values.displayName.trim() || null,
        email: values.email.trim(),
        password: values.password,
      })

      navigate('/', { replace: true })
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout mode="register">
      <AuthForm
        alternateHref="/login"
        alternateLabel="Sign in"
        alternateText="Already have an account?"
        description="Create an account and start using TaskIt."
        error={error}
        fields={[
          {
            autoComplete: 'name',
            label: 'Display name',
            maxLength: 80,
            name: 'displayName',
            placeholder: 'Akash',
            required: false,
            type: 'text',
          },
          {
            autoComplete: 'email',
            label: 'Email',
            name: 'email',
            placeholder: 'you@example.com',
            required: true,
            type: 'email',
          },
          {
            autoComplete: 'new-password',
            label: 'Password',
            minLength: 8,
            name: 'password',
            placeholder: 'Use at least 8 characters',
            required: true,
            type: 'password',
          },
        ]}
        footer="Registration signs you in immediately after a successful response."
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Create Account"
        title="Register"
        values={values}
      />
    </AuthLayout>
  )
}
