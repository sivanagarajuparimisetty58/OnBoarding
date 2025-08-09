'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getAllUsers } from '@/lib/onboarding'
import { User } from '@/lib/supabase'
import { Database, RefreshCw, ArrowLeft, User as UserIcon } from 'lucide-react'
import { format } from 'date-fns'

export default function DataTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    const allUsers = await getAllUsers()
    setUsers(allUsers)
    setLoading(false)
  }

  const refreshData = async () => {
    setRefreshing(true)
    await loadUsers()
    setRefreshing(false)
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch {
      return 'N/A'
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm')
    } catch {
      return 'N/A'
    }
  }

  const getStepLabel = (step: number, completed: boolean) => {
    if (completed) return 'Completed'
    
    switch (step) {
      case 1: return 'Email & Password'
      case 2: return 'Personal Info'
      case 3: return 'Additional Details'
      default: return 'Unknown'
    }
  }

  const getStepBadgeVariant = (step: number, completed: boolean) => {
    if (completed) return 'default'
    if (step === 1) return 'destructive'
    if (step === 2) return 'secondary'
    return 'outline'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading user data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Data</h1>
              <p className="text-gray-600">View all user onboarding data</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Onboarding
            </Button>
            <Button onClick={refreshData} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <UserIcon className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{users.length}</p>
                  <p className="text-sm text-gray-600">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                </div>
                <div>
                  <p className="text-2xl font-bold">{users.filter(u => u.completed).length}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                </div>
                <div>
                  <p className="text-2xl font-bold">{users.filter(u => !u.completed).length}</p>
                  <p className="text-sm text-gray-600">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {users.length > 0 ? Math.round((users.filter(u => u.completed).length / users.length) * 100) : 0}%
                  </p>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-12">
                <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users yet</h3>
                <p className="text-gray-600 mb-4">Users who complete the onboarding flow will appear here.</p>
                <Button onClick={() => window.location.href = '/'}>
                  Start Onboarding
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>About Me</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Birth Date</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={getStepBadgeVariant(user.current_step, user.completed)}>
                            {getStepLabel(user.current_step, user.completed)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            {user.about_me ? (
                              <p className="text-sm truncate" title={user.about_me}>
                                {user.about_me}
                              </p>
                            ) : (
                              <span className="text-gray-400">Not provided</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.street_address || user.city || user.state || user.zip ? (
                            <div className="text-sm">
                              {user.street_address && <div>{user.street_address}</div>}
                              {(user.city || user.state || user.zip) && (
                                <div>
                                  {user.city}{user.city && user.state ? ', ' : ''}{user.state} {user.zip}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">Not provided</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.birthdate ? formatDate(user.birthdate) : (
                            <span className="text-gray-400">Not provided</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDateTime(user.created_at)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDateTime(user.updated_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}