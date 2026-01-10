'use client'

import { useEffect, useState } from 'react'
import { X, Check, Bell } from 'lucide-react'

type Notification = {
  id: string
  type: string
  priority: string
  title: string
  message: string
  action_url?: string
  action_label?: string
  is_read: boolean
  created_at: string
}

export default function NotificationCenter({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (userId) {
      loadNotifications()
      loadUnreadCount()
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [userId])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/notifications?userId=${userId}`)
      const data = await response.json()
      setNotifications(data.notifications || [])
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUnreadCount = async () => {
    try {
      const response = await fetch(`/api/notifications/unread-count?userId=${userId}`)
      const data = await response.json()
      setUnreadCount(data.count || 0)
    } catch (error) {
      console.error('Failed to load unread count:', error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      })
      
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch(`/api/notifications/mark-all-read?userId=${userId}`, {
        method: 'POST',
      })
      
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-500 bg-red-900/20'
      case 'high':
        return 'border-amber-500 bg-amber-900/20'
      case 'medium':
        return 'border-blue-500 bg-blue-900/20'
      default:
        return 'border-slate-600 bg-slate-900/20'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'opportunity_match':
        return '🎯'
      case 'proposal_status':
        return '📄'
      case 'deadline_reminder':
        return '⏰'
      case 'ai_insight':
        return '🤖'
      default:
        return '📢'
    }
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-slate-800 rounded-lg transition"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 w-96 max-h-[600px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="font-semibold text-lg">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-emerald-400 hover:text-emerald-300"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-slate-800 rounded"
                  aria-label="Close notifications"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto max-h-[500px]">
              {loading ? (
                <div className="p-8 text-center text-slate-400">
                  Loading...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No notifications
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-slate-800/50 transition ${
                        !notification.is_read ? 'bg-slate-800/30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl flex-shrink-0">
                          {getTypeIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-sm">
                              {notification.title}
                            </h4>
                            {!notification.is_read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-emerald-400 hover:text-emerald-300 flex-shrink-0"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-slate-300 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                              {new Date(notification.created_at).toLocaleString()}
                            </span>
                            {notification.action_url && (
                              <a
                                href={notification.action_url}
                                className="text-xs text-emerald-400 hover:text-emerald-300"
                                onClick={() => {
                                  markAsRead(notification.id)
                                  setIsOpen(false)
                                }}
                              >
                                {notification.action_label || 'View'} →
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
