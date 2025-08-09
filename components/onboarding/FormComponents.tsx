'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { User } from 'lucide-react'
import { ComponentType } from '@/lib/supabase'

interface FormComponentProps {
  component: ComponentType
  value: any
  onChange: (component: ComponentType, value: any) => void
  error?: string
}

export function FormComponent({ component, value, onChange, error }: FormComponentProps) {
  switch (component) {
    case 'about_me':
      return <AboutMeComponent value={value} onChange={onChange} error={error} />
    case 'address':
      return <AddressComponent value={value} onChange={onChange} error={error} />
    case 'birthdate':
      return <BirthdateComponent value={value} onChange={onChange} error={error} />
    default:
      return null
  }
}

function AboutMeComponent({ value, onChange, error }: Omit<FormComponentProps, 'component'>) {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">About Me</h3>
        </div>
        <div className="space-y-2">
          <Label htmlFor="about-me">Tell us about yourself</Label>
          <Textarea
            id="about-me"
            placeholder="Share a bit about yourself, your interests, and what makes you unique..."
            value={value || ''}
            onChange={(e) => onChange('about_me', e.target.value)}
            className="min-h-[120px] resize-none"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground">
            {(value || '').length}/500 characters
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

function AddressComponent({ value, onChange, error }: Omit<FormComponentProps, 'component'>) {
  const [address, setAddress] = useState(value || {
    street_address: '',
    city: '',
    state: '',
    zip: ''
  })

  const updateAddress = (field: string, newValue: string) => {
    const updatedAddress = { ...address, [field]: newValue }
    setAddress(updatedAddress)
    onChange('address', updatedAddress)
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Address Information</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              placeholder="123 Main Street"
              value={address.street_address}
              onChange={(e) => updateAddress('street_address', e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="New York"
                value={address.city}
                onChange={(e) => updateAddress('city', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                placeholder="NY"
                value={address.state}
                onChange={(e) => updateAddress('state', e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="zip">ZIP Code</Label>
            <Input
              id="zip"
              placeholder="10001"
              value={address.zip}
              onChange={(e) => updateAddress('zip', e.target.value)}
            />
          </div>
          
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

function BirthdateComponent({ value, onChange, error }: Omit<FormComponentProps, 'component'>) {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Date of Birth</h3>
        <div className="space-y-2">
          <Label htmlFor="birthdate">Select your birth date</Label>
          <Input
            id="birthdate"
            type="date"
            value={value || ''}
            onChange={(e) => onChange('birthdate', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </CardContent>
    </Card>
  )
}