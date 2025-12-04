import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { User, Bell, Shield, Palette } from 'lucide-react'

export default async function SettingsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">Settings</h1>
        <p className="text-lg text-muted-foreground">
          Manage your account preferences and settings
        </p>
      </div>

      {/* Settings Sections */}
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Profile Section */}
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold">Profile</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Name
              </label>
              <p className="mt-1 text-lg">{session.user.name || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Email
              </label>
              <p className="mt-1 text-lg">{session.user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Authentication Provider
              </label>
              <p className="mt-1 text-lg capitalize">
                {session.user.provider || 'Webex'}
              </p>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold">Notifications</h2>
          </div>
          <p className="text-muted-foreground">
            Notification preferences coming soon...
          </p>
        </div>

        {/* Privacy Section */}
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold">Privacy & Security</h2>
          </div>
          <p className="text-muted-foreground">
            Privacy and security settings coming soon...
          </p>
        </div>

        {/* Appearance Section */}
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <Palette className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold">Appearance</h2>
          </div>
          <p className="text-muted-foreground">
            Theme and appearance settings coming soon...
          </p>
        </div>
      </div>
    </div>
  )
}
