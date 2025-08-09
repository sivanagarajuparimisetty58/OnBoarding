/* eslint-disable react/no-unescaped-entities */
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressIndicator } from '@/components/onboarding/ProgressIndicator'
import { FormComponent } from '@/components/onboarding/FormComponents'
import { createUser, getUserByEmail, updateUser, getOnboardingConfig } from '@/lib/onboarding'
import { User, ComponentType } from '@/lib/supabase'
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(1)
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [config, setConfig] = useState<Record<number, ComponentType[]>>({ 2: [], 3: [] })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  useEffect(() => {
    loadConfig()
  }, [])

  useEffect(() => {
    // Check for existing user session
    const savedEmail = localStorage.getItem('onboarding_email')
    if (savedEmail) {
      checkExistingUser(savedEmail)
    }
  }, [])

  const loadConfig = async () => {
    const onboardingConfig = await getOnboardingConfig()
    setConfig(onboardingConfig)
  }

  const checkExistingUser = async (emailToCheck: string) => {
    const existingUser = await getUserByEmail(emailToCheck)
    if (existingUser && !existingUser.completed) {
      setUser(existingUser)
      setEmail(existingUser.email)
      setCurrentStep(existingUser.current_step)
      setFormData({
        about_me: existingUser.about_me,
        address: {
          street_address: existingUser.street_address,
          city: existingUser.city,
          state: existingUser.state,
          zip: existingUser.zip,
        },
        birthdate: existingUser.birthdate,
      })
      toast({
        title: "Welcome back!",
        description: "We've restored your progress.",
      })
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = 'Please enter a valid email address'
      }
      if (!password || password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters long'
      }
    } else if (step === 2 || step === 3) {
      const pageComponents = config[step] || []

      pageComponents.forEach((component) => {
        if (component === 'about_me') {
          if (!formData.about_me || formData.about_me.trim().length === 0) {
            newErrors.about_me = 'Please tell us about yourself'
          }
        } else if (component === 'address') {
          const address = formData.address || {}
          if (!address.street_address || !address.city || !address.state || !address.zip) {
            newErrors.address = 'Please fill in all address fields'
          }
        } else if (component === 'birthdate') {
          if (!formData.birthdate) {
            newErrors.birthdate = 'Please select your birth date'
          }
        }
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      return
    }

    setLoading(true)

    try {
      if (currentStep === 1) {
        // Create or get user
        let currentUser = await getUserByEmail(email)

        if (!currentUser) {
          currentUser = await createUser(email, password)
          if (!currentUser) {
            toast({
              title: "Error",
              description: "Failed to create account. Please try again.",
              variant: "destructive",
            })
            setLoading(false)
            return
          }
        }

        setUser(currentUser)
        localStorage.setItem('onboarding_email', email)

        // Move to next step
        const updatedUser = await updateUser(currentUser.id, { current_step: 2 })
        if (updatedUser) {
          setUser(updatedUser)
          setCurrentStep(2)
        }
      } else if (currentStep === 2) {
        // Save step 2 data and move to step 3
        if (user) {
          const updates: any = { current_step: 3 }

          if (formData.about_me) updates.about_me = formData.about_me
          if (formData.address) {
            updates.street_address = formData.address.street_address
            updates.city = formData.address.city
            updates.state = formData.address.state
            updates.zip = formData.address.zip
          }
          if (formData.birthdate) updates.birthdate = formData.birthdate

          const updatedUser = await updateUser(user.id, updates)
          if (updatedUser) {
            setUser(updatedUser)
            setCurrentStep(3)
          }
        }
      } else if (currentStep === 3) {
        // Complete onboarding
        if (user) {
          const updates: any = { current_step: 4, completed: true }

          if (formData.about_me) updates.about_me = formData.about_me
          if (formData.address) {
            updates.street_address = formData.address.street_address
            updates.city = formData.address.city
            updates.state = formData.address.state
            updates.zip = formData.address.zip
          }
          if (formData.birthdate) updates.birthdate = formData.birthdate

          const updatedUser = await updateUser(user.id, updates)
          if (updatedUser) {
            setUser(updatedUser)
            setCurrentStep(4)
            localStorage.removeItem('onboarding_email')
            toast({
              title: "Welcome!",
              description: "Your onboarding has been completed successfully.",
            })
          }
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFormChange = (component: ComponentType, value: any) => {
    setFormData(prev => ({ ...prev, [component]: value }))
    // Clear errors when user starts typing
    if (errors[component]) {
      setErrors(prev => ({ ...prev, [component]: '' }))
    }
  }

  if (currentStep === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome aboard!</h1>
            <p className="text-gray-600 mb-6">
              Your onboarding has been completed successfully.
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => window.location.href = '/admin'}
                variant="outline"
                className="w-full"
              >
                Admin Panel
              </Button>
              <Button
                onClick={() => window.location.href = '/data'}
                variant="outline"
                className="w-full"
              >
                View Data
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Zealthy</h1>
          <p className="text-gray-600">Let's get you set up with a personalized experience</p>
        </div>

        <ProgressIndicator currentStep={currentStep} totalSteps={3} />

        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Create Your Account"}
              {currentStep === 2 && "Personal Information"}
              {currentStep === 3 && "Additional Details"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!!user}
                  />
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={!!user}
                  />
                  {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
                </div>
              </div>
            )}

            {(currentStep === 2 || currentStep === 3) && (
              <div className="space-y-6">
                {config[currentStep]?.map((component) => (
                  <FormComponent
                    key={component}
                    component={component}
                    value={formData[component]}
                    onChange={handleFormChange}
                    error={errors[component]}
                  />
                ))}
              </div>
            )}

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || loading}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  "Loading..."
                ) : (
                  <>
                    {currentStep === 3 ? "Complete" : "Next"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-600">
          <p>Need help? <a href="/admin" className="text-blue-600 hover:underline">Admin Panel</a> | <a href="/data" className="text-blue-600 hover:underline">View Data</a></p>
        </div>
      </div>
    </div>
  )
}