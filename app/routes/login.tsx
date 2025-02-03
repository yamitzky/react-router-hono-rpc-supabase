import { Button } from '@heroui/button'
import { Checkbox } from '@heroui/checkbox'
import { Form } from '@heroui/form'
import { Input } from '@heroui/input'
import { InputOtp } from '@heroui/input-otp'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useSupabase } from '~/root'

type EmailFormData = {
  email: string
}
type OtpFormData = {
  otp: string
}

type TocFormData = {
  accepted?: 'accepted'
}

type FormState =
  | {
      type: 'initial'
      error?: string
    }
  | {
      type: 'otp'
      email: string
      error?: string
    }
  | {
      type: 'toc'
      error?: string
    }

const OTP_DIGITS = 6

export default function Login() {
  const supabase = useSupabase()
  const [formState, setFormState] = useState<FormState>({ type: 'initial' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onSubmitEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = Object.fromEntries(new FormData(e.currentTarget)) as EmailFormData
    const email = formData.email
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    })
    setLoading(false)

    if (error) {
      setFormState({ type: 'initial', error: error.message })
    } else {
      setFormState({ type: 'otp', email })
    }
  }

  const onSubmitOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = Object.fromEntries(new FormData(e.currentTarget)) as OtpFormData

    if (formState.type === 'otp') {
      setLoading(true)
      const { error, data } = await supabase.auth.verifyOtp({
        email: formState.email,
        token: formData.otp,
        type: 'email',
      })
      setLoading(false)
      if (error) {
        setFormState({ type: 'otp', email: formState.email, error: error.message })
      } else if (!data.user?.user_metadata?.['toc_accepted']) {
        setFormState({ type: 'toc' })
      } else {
        navigate('/')
      }
    }
  }

  const onSubmitToc = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = Object.fromEntries(new FormData(e.currentTarget)) as TocFormData
    if (formData.accepted !== 'accepted') {
      setFormState({ type: 'toc', error: 'Please accept the terms of use' })
    } else {
      const { error } = await supabase.auth.updateUser({
        data: {
          toc_accepted: true,
        },
      })
      if (error) {
        setFormState({ type: 'toc', error: error.message })
      } else {
        navigate('/')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            {formState.type !== 'toc' ? 'Sign in with Email' : 'Sign up'}
          </h2>
        </div>
        {formState.type === 'initial' ? (
          <Form onSubmit={onSubmitEmail} validationBehavior="native" className="space-y-4">
            <Input label="Email" type="email" isRequired name="email" errorMessage="Please enter a valid email"></Input>
            <p className="text-center text-sm text-danger">{formState.error}</p>
            <Button
              type="submit"
              color="primary"
              className="group relative w-full flex justify-center"
              isLoading={loading}
            >
              Sign in
            </Button>
          </Form>
        ) : formState.type === 'otp' ? (
          <Form className="space-y-4 flex-col items-center" onSubmit={onSubmitOTP}>
            <p className="text-center">Please enter the One-Time login code sent to {formState.email}</p>
            <InputOtp
              name="otp"
              label="OTP"
              errorMessage="Invalid OTP code"
              isRequired
              size="lg"
              length={OTP_DIGITS}
              isDisabled={loading}
            />
            <p className="text-center text-sm text-danger">{formState.error}</p>
            <Button
              type="submit"
              color="primary"
              className="group relative w-full flex justify-center"
              isLoading={loading}
            >
              Verify
            </Button>
          </Form>
        ) : formState.type === 'toc' ? (
          <Form className="space-y-4 flex-col items-center" onSubmit={onSubmitToc}>
            <p className="text-center">Please accept the Terms and Conditions to continue.</p>
            <Checkbox name="accepted" isRequired value="accepted">
              I read and accept the Terms and Conditions
            </Checkbox>
            <p className="text-center text-sm text-danger">{formState.error}</p>
            <Button
              type="submit"
              color="primary"
              className="group relative w-full flex justify-center"
              isLoading={loading}
            >
              Sign up
            </Button>
          </Form>
        ) : null}
      </div>
    </div>
  )
}
