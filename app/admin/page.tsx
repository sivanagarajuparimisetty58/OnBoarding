/* eslint-disable react/no-unescaped-entities */
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { getOnboardingConfig, updateOnboardingConfig } from '@/lib/onboarding'
import { ComponentType } from '@/lib/supabase'
import { Settings, Save, ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const COMPONENT_LABELS: Record<ComponentType, string> = {
  about_me: 'About Me',
  address: 'Address Information',
  birthdate: 'Date of Birth',
}

const COMPONENT_DESCRIPTIONS: Record<ComponentType, string> = {
  about_me: 'Large text area for users to describe themselves',
  address: 'Address collection fields (street, city, state, zip)',
  birthdate: 'Date picker for birth date selection',
}

export default function AdminPanel() {
  const [config, setConfig] = useState<Record<number, ComponentType[]>>({ 2: [], 3: [] })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    setLoading(true)
    const onboardingConfig = await getOnboardingConfig()
    setConfig(onboardingConfig)
    setLoading(false)
  }

  const moveComponent = (component: ComponentType, fromPage: number, toPage: number) => {
    setConfig(prev => {
      const newConfig = { ...prev }
      
      // Remove from source page
      newConfig[fromPage] = newConfig[fromPage].filter(c => c !== component)
      
      // Add to destination page
      if (!newConfig[toPage].includes(component)) {
        newConfig[toPage] = [...newConfig[toPage], component]
      }
      
      return newConfig
    })
  }

  const removeComponent = (component: ComponentType, page: number) => {
    setConfig(prev => {
      const newConfig = { ...prev }
      
      // Don't allow removing if it would leave the page empty
      if (newConfig[page].length <= 1) {
        toast({
          title: "Cannot remove component",
          description: "Each page must have at least one component.",
          variant: "destructive",
        })
        return prev
      }
      
      newConfig[page] = newConfig[page].filter(c => c !== component)
      return newConfig
    })
  }

  const addComponent = (component: ComponentType, page: number) => {
    setConfig(prev => {
      const newConfig = { ...prev }
      
      // Remove from other pages first
      Object.keys(newConfig).forEach(p => {
        const pageNum = parseInt(p)
        if (pageNum !== page) {
          newConfig[pageNum] = newConfig[pageNum].filter(c => c !== component)
        }
      })
      
      // Add to target page if not already there
      if (!newConfig[page].includes(component)) {
        newConfig[page] = [...newConfig[page], component]
      }
      
      return newConfig
    })
  }

  const saveConfig = async () => {
    // Validate that each page has at least one component
    if (config[2].length === 0 || config[3].length === 0) {
      toast({
        title: "Invalid configuration",
        description: "Each page must have at least one component.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    const success = await updateOnboardingConfig(config)
    
    if (success) {
      toast({
        title: "Configuration saved",
        description: "Onboarding flow has been updated successfully.",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      })
    }
    
    setSaving(false)
  }

  const getAllComponents = (): ComponentType[] => {
    return ['about_me', 'address', 'birthdate']
  }

  const getUnassignedComponents = (): ComponentType[] => {
    const assigned = [...config[2], ...config[3]]
    return getAllComponents().filter(comp => !assigned.includes(comp))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading configuration...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600">Configure the onboarding flow components</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Onboarding
            </Button>
            <Button onClick={saveConfig} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Page 2 Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Page 2 - Personal Information
                <Badge variant="secondary">{config[2].length} component{config[2].length !== 1 ? 's' : ''}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {config[2].map((component) => (
                  <div key={component} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <h4 className="font-medium text-blue-900">{COMPONENT_LABELS[component]}</h4>
                      <p className="text-sm text-blue-700">{COMPONENT_DESCRIPTIONS[component]}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moveComponent(component, 2, 3)}
                      >
                        Move to Page 3
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeComponent(component, 2)}
                        disabled={config[2].length <= 1}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                
                {config[2].length === 0 && (
                  <p className="text-center text-gray-500 py-4">No components assigned to this page</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Page 3 Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Page 3 - Additional Details
                <Badge variant="secondary">{config[3].length} component{config[3].length !== 1 ? 's' : ''}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {config[3].map((component) => (
                  <div key={component} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div>
                      <h4 className="font-medium text-emerald-900">{COMPONENT_LABELS[component]}</h4>
                      <p className="text-sm text-emerald-700">{COMPONENT_DESCRIPTIONS[component]}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moveComponent(component, 3, 2)}
                      >
                        Move to Page 2
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeComponent(component, 3)}
                        disabled={config[3].length <= 1}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                
                {config[3].length === 0 && (
                  <p className="text-center text-gray-500 py-4">No components assigned to this page</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Unassigned Components */}
        {getUnassignedComponents().length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Available Components</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {getUnassignedComponents().map((component) => (
                  <div key={component} className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium mb-2">{COMPONENT_LABELS[component]}</h4>
                    <p className="text-sm text-gray-600 mb-4">{COMPONENT_DESCRIPTIONS[component]}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => addComponent(component, 2)}
                        className="flex-1"
                      >
                        Add to Page 2
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addComponent(component, 3)}
                        className="flex-1"
                      >
                        Add to Page 3
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Use the "Move" buttons to transfer components between pages</li>
              <li>• Use "Remove" to unassign a component from a page</li>
              <li>• Click "Save Changes" to apply the new configuration to the onboarding flow</li>
              <li>• Changes will immediately affect new users going through onboarding</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}