import { useState, useEffect, useRef } from 'react'
import { monitoringService, MonitoredUser, AlertMessage } from '@/services/monitoring.service'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, Clock, Shield, User, Bell } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const AdminMonitoring = () => {
  // Monitored users state
  const [monitoredUsers, setMonitoredUsers] = useState<MonitoredUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [loading, setLoading] = useState(false)

  // Alert state
  const [recentAlerts, setRecentAlerts] = useState<MonitoredUser[]>([])
  const [alertHours, setAlertHours] = useState(24)
  const [alertsLoading, setAlertsLoading] = useState(false)

  // Dialog state
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<MonitoredUser | null>(null)
  const [notesValue, setNotesValue] = useState('')
  const [severityValue, setSeverityValue] = useState<string>('medium')

  // Real-time WebSocket
  const wsRef = useRef<WebSocket | null>(null)
  const [realTimeAlerts, setRealTimeAlerts] = useState<AlertMessage[]>([])

  // Load monitored users on mount and when page changes
  useEffect(() => {
    loadMonitoredUsers()
  }, [page])

  // Load recent alerts on mount and when alert hours change
  useEffect(() => {
    loadRecentAlerts()
  }, [alertHours])

  // Initialize WebSocket connection
  useEffect(() => {
    try {
      wsRef.current = monitoringService.createWebSocketConnection()

      wsRef.current.onmessage = event => {
        const message = JSON.parse(event.data) as AlertMessage
        if (message.type === 'suspicious_activity') {
          // Add new alert to real-time list
          setRealTimeAlerts(prev => [message, ...prev].slice(0, 20)) // Keep most recent 20

          // Show toast notification
          toast.error(`Suspicious activity detected for user ${message.activity.username}`, {
            description: message.activity.description,
            action: {
              label: 'View',
              onClick: () => loadMonitoredUsers()
            }
          })
        }
      }

      // Clean up WebSocket on unmount
      return () => {
        if (wsRef.current) {
          wsRef.current.close()
        }
      }
    } catch (error) {
      console.error('WebSocket initialization error:', error)
      toast.error('Failed to connect to real-time monitoring')
    }
  }, [])

  const loadMonitoredUsers = async () => {
    try {
      setLoading(true)
      const response = await monitoringService.getMonitoredUsers(page, pageSize)
      setMonitoredUsers(response.data)
      setTotal(response.total)
    } catch (error) {
      toast.error('Failed to load monitored users')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const loadRecentAlerts = async () => {
    try {
      setAlertsLoading(true)
      const alerts = await monitoringService.getRecentAlerts(alertHours)
      setRecentAlerts(alerts)
    } catch (error) {
      toast.error('Failed to load recent alerts')
      console.error(error)
    } finally {
      setAlertsLoading(false)
    }
  }

  const handleRemoveFromMonitored = async (userId: number) => {
    if (!confirm('Are you sure you want to remove this user from monitoring?')) {
      return
    }

    try {
      await monitoringService.removeFromMonitored(userId)
      toast.success('User removed from monitoring')
      loadMonitoredUsers() // Reload the list
    } catch (error) {
      toast.error('Failed to remove user from monitoring')
      console.error(error)
    }
  }

  const openUserDetails = (user: MonitoredUser) => {
    setSelectedUser(user)
    setNotesValue(user.notes || '')
    setSeverityValue(user.severity || 'medium')
    setDetailsOpen(true)
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return

    try {
      await monitoringService.updateMonitoredUser(selectedUser.user_id, {
        notes: notesValue,
        severity: severityValue
      })

      toast.success('User monitoring details updated')
      setDetailsOpen(false)
      loadMonitoredUsers() // Reload the list
    } catch (error) {
      toast.error('Failed to update user monitoring details')
      console.error(error)
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant='destructive'>High</Badge>
      case 'medium':
        return (
          <Badge variant='default' className='bg-orange-500'>
            Medium
          </Badge>
        )
      case 'low':
        return <Badge variant='outline'>Low</Badge>
      default:
        return <Badge variant='outline'>Unknown</Badge>
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className='container py-10'>
      <h1 className='mb-6 text-2xl font-bold'>Monitoring Dashboard</h1>

      <Tabs defaultValue='monitored'>
        <TabsList className='mb-6'>
          <TabsTrigger value='monitored' className='flex items-center gap-1'>
            <Shield className='h-4 w-4' />
            <span>Monitored Users</span>
          </TabsTrigger>
          <TabsTrigger value='alerts' className='flex items-center gap-1'>
            <Bell className='h-4 w-4' />
            <span>Recent Alerts</span>
          </TabsTrigger>
          <TabsTrigger value='realtime' className='flex items-center gap-1'>
            <Clock className='h-4 w-4' />
            <span>Real-time Activity</span>
          </TabsTrigger>
        </TabsList>

        {/* Monitored Users Tab */}
        <TabsContent value='monitored'>
          <Card>
            <CardHeader>
              <CardTitle>Monitored Users</CardTitle>
              <CardDescription>
                Users currently being monitored for suspicious activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Alert Count</TableHead>
                      <TableHead>Last Alert</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monitoredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className='h-24 text-center'>
                          No users are currently being monitored
                        </TableCell>
                      </TableRow>
                    ) : (
                      monitoredUsers.map(user => (
                        <TableRow key={user.id}>
                          <TableCell className='font-medium'>{user.username}</TableCell>
                          <TableCell>{user.reason}</TableCell>
                          <TableCell>{getSeverityBadge(user.severity)}</TableCell>
                          <TableCell>{user.alert_count}</TableCell>
                          <TableCell>{formatDateTime(user.last_alert_at)}</TableCell>
                          <TableCell>
                            <div className='flex gap-2'>
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() => openUserDetails(user)}
                              >
                                Details
                              </Button>
                              <Button
                                size='sm'
                                variant='destructive'
                                onClick={() => handleRemoveFromMonitored(user.user_id)}
                              >
                                Remove
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination controls */}
              {total > pageSize && (
                <div className='mt-4 flex items-center justify-between'>
                  <div>
                    Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of{' '}
                    {total} users
                  </div>
                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1 || loading}
                    >
                      Previous
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() => setPage(p => p + 1)}
                      disabled={page * pageSize >= total || loading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Alerts Tab */}
        <TabsContent value='alerts'>
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription className='flex items-center justify-between'>
                <span>Alerts triggered in the last</span>
                <Select
                  value={alertHours.toString()}
                  onValueChange={value => setAlertHours(parseInt(value))}
                >
                  <SelectTrigger className='w-32'>
                    <SelectValue placeholder='Select hours' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='6'>6 hours</SelectItem>
                    <SelectItem value='12'>12 hours</SelectItem>
                    <SelectItem value='24'>24 hours</SelectItem>
                    <SelectItem value='48'>48 hours</SelectItem>
                    <SelectItem value='72'>72 hours</SelectItem>
                  </SelectContent>
                </Select>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Alert Count</TableHead>
                      <TableHead>Last Alert</TableHead>
                      <TableHead>First Detected</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alertsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className='h-24 text-center'>
                          Loading alerts...
                        </TableCell>
                      </TableRow>
                    ) : recentAlerts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className='h-24 text-center'>
                          No alerts in the selected time period
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentAlerts.map(alert => (
                        <TableRow key={alert.id}>
                          <TableCell className='font-medium'>{alert.username}</TableCell>
                          <TableCell>{alert.reason}</TableCell>
                          <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                          <TableCell>{alert.alert_count}</TableCell>
                          <TableCell>{formatDateTime(alert.last_alert_at)}</TableCell>
                          <TableCell>{formatDateTime(alert.first_detected_at)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Real-time Activity Tab */}
        <TabsContent value='realtime'>
          <Card>
            <CardHeader>
              <CardTitle>Real-time Activity Monitoring</CardTitle>
              <CardDescription>Live suspicious activity alerts (last 20 events)</CardDescription>
            </CardHeader>
            <CardContent>
              {realTimeAlerts.length === 0 ? (
                <div className='flex h-40 items-center justify-center rounded-md border p-4'>
                  <div className='text-muted-foreground text-center'>
                    <Clock className='mx-auto mb-2 h-8 w-8' />
                    <p>No activity detected yet. The system is actively monitoring.</p>
                  </div>
                </div>
              ) : (
                <div className='space-y-4'>
                  {realTimeAlerts.map((alert, index) => (
                    <div
                      key={index}
                      className='flex rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950'
                    >
                      <AlertCircle className='mr-3 mt-0.5 h-5 w-5 text-red-600 dark:text-red-400' />
                      <div>
                        <div className='font-medium text-red-800 dark:text-red-300'>
                          {alert.activity.activity_type} -{' '}
                          {getSeverityBadge(alert.activity.severity)}
                        </div>
                        <div className='mt-1 text-sm'>
                          User <strong>{alert.activity.username}</strong>:{' '}
                          {alert.activity.description}
                        </div>
                        <div className='text-muted-foreground mt-1 text-xs'>
                          {formatDateTime(alert.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Monitored User Details</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className='space-y-4'>
              <div className='flex items-center gap-3'>
                <User className='bg-muted h-10 w-10 rounded-full p-2' />
                <div>
                  <h3 className='font-medium'>{selectedUser.username}</h3>
                  <p className='text-muted-foreground text-sm'>User ID: {selectedUser.user_id}</p>
                </div>
              </div>

              <div className='grid gap-4'>
                <div>
                  <label className='text-sm font-medium'>Reason for Monitoring</label>
                  <p className='text-sm'>{selectedUser.reason}</p>
                </div>

                <div>
                  <label className='text-sm font-medium'>Severity</label>
                  <Select value={severityValue} onValueChange={setSeverityValue}>
                    <SelectTrigger>
                      <SelectValue placeholder='Select severity' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='low'>Low</SelectItem>
                      <SelectItem value='medium'>Medium</SelectItem>
                      <SelectItem value='high'>High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className='text-sm font-medium'>Notes</label>
                  <Textarea
                    value={notesValue}
                    onChange={e => setNotesValue(e.target.value)}
                    placeholder='Add notes about this monitored user'
                    className='mt-1'
                    rows={3}
                  />
                </div>

                <div>
                  <label className='text-sm font-medium'>Activity Statistics</label>
                  <div className='mt-1 grid grid-cols-2 gap-2 text-sm'>
                    <div className='bg-muted rounded-md p-2'>
                      <span className='text-muted-foreground block'>First Detected</span>
                      <span>{formatDateTime(selectedUser.first_detected_at)}</span>
                    </div>
                    <div className='bg-muted rounded-md p-2'>
                      <span className='text-muted-foreground block'>Last Alert</span>
                      <span>{formatDateTime(selectedUser.last_alert_at)}</span>
                    </div>
                    <div className='bg-muted rounded-md p-2'>
                      <span className='text-muted-foreground block'>Alert Count</span>
                      <span>{selectedUser.alert_count}</span>
                    </div>
                    <div className='bg-muted rounded-md p-2'>
                      <span className='text-muted-foreground block'>Added By</span>
                      <span>{selectedUser.added_by_name}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant='outline' onClick={() => setDetailsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminMonitoring
