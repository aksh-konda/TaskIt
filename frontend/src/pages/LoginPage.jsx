import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import AuthForm from '../components/AuthForm'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../context/useAuth'

const initialValues = {
  email: '',
  password: '',
}

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [values, setValues] = useState(initialValues)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const from = location.state?.from?.pathname || '/'

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
      await login({
        email: values.email.trim(),
        password: values.password,
      })

      navigate(from, { replace: true })
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout mode="login">
      <AuthForm
        alternateHref="/register"
        alternateLabel="Create one"
        alternateText="Need an account?"
        description="Sign in to open your workspace."
        error={error}
        fields={[
          {
            autoComplete: 'email',
            label: 'Email',
            name: 'email',
            placeholder: 'you@example.com',
            required: true,
            type: 'email',
          },
          {
            autoComplete: 'current-password',
            label: 'Password',
            name: 'password',
            placeholder: 'Enter your password',
            required: true,
            type: 'password',
          },
        ]}
        footer="If this fails with a connection message, start the app stack with `make dev`."
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Sign In"
        title="Login"
        values={values}
      />
    </AuthLayout>
  )
}
