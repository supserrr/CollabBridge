"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth-firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Shield, 
  CreditCard, 
  Globe, 
  Eye, 
  Smartphone, 
  Download,
  Upload,
  Settings as SettingsIcon,
  Save,
  Camera,
  MapPin,
  Phone,
  Calendar
} from "lucide-react"

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{
    username: string
  }>
}

export default function SettingsPage({ params }: PageProps) {
  const { username } = use(params)
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('profile')

  useEffect(() => {
    if (!loading && user) {
      // Verify the username matches the logged-in user
      if (user.username !== username) {
        router.push(`/${user.username}/dashboard/settings`)
        return
      }
    } else if (!loading && !user) {
      router.push('/signin')
    }
  }, [user, loading, router, username])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                  Manage your account preferences and profile settings
                </p>
              </div>
              <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-min">
        
        {/* Settings Navigation - First Row */}
        <Card className="md:col-span-4 lg:col-span-4">
          <CardHeader>
            <CardTitle>Quick Settings</CardTitle>
            <CardDescription>Jump to different settings sections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <Button 
                variant={activeSection === 'profile' ? 'default' : 'outline'} 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => setActiveSection('profile')}
              >
                <User className="h-5 w-5" />
                <span className="text-sm">Profile</span>
              </Button>
              <Button 
                variant={activeSection === 'security' ? 'default' : 'outline'} 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => setActiveSection('security')}
              >
                <Shield className="h-5 w-5" />
                <span className="text-sm">Security</span>
              </Button>
              <Button 
                variant={activeSection === 'notifications' ? 'default' : 'outline'} 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => setActiveSection('notifications')}
              >
                <Bell className="h-5 w-5" />
                <span className="text-sm">Notifications</span>
              </Button>
              <Button 
                variant={activeSection === 'privacy' ? 'default' : 'outline'} 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => setActiveSection('privacy')}
              >
                <Eye className="h-5 w-5" />
                <span className="text-sm">Privacy</span>
              </Button>
              <Button 
                variant={activeSection === 'billing' ? 'default' : 'outline'} 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => setActiveSection('billing')}
              >
                <CreditCard className="h-5 w-5" />
                <span className="text-sm">Billing</span>
              </Button>
              <Button 
                variant={activeSection === 'data' ? 'default' : 'outline'} 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => setActiveSection('data')}
              >
                <Download className="h-5 w-5" />
                <span className="text-sm">Data</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information - Second Row */}
        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile Information</span>
            </CardTitle>
            <CardDescription>Update your public profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="" />
                <AvatarFallback>{(user?.username?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()}</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">
                <Camera className="mr-2 h-4 w-4" />
                Change Photo
              </Button>
            </div>
            <div className="space-y-3">
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input id="displayName" defaultValue={user?.username || ''} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={user?.email || ''} />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue={user?.username || ''} />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" placeholder="Tell us about yourself..." rows={3} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Contact Information</span>
            </CardTitle>
            <CardDescription>Manage your contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" type="url" placeholder="https://yourwebsite.com" />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="City, State, Country" />
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" defaultValue="Pacific Time (PT)" />
            </div>
            <div className="pt-2">
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-950/20">
                <Globe className="mr-1 h-3 w-3" />
                Public Profile
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings - Third Row */}
        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Security & Privacy</span>
            </CardTitle>
            <CardDescription>Protect your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Login Notifications</Label>
                <p className="text-sm text-muted-foreground">Get notified of new logins</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Lock className="mr-2 h-4 w-4" />
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Smartphone className="mr-2 h-4 w-4" />
                Manage Devices
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notification Preferences</span>
            </CardTitle>
            <CardDescription>Choose what to be notified about</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Get instant notifications</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">Receive promotional content</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">Get weekly analytics</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Account Management - Fourth Row */}
        <Card className="md:col-span-4 lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <SettingsIcon className="h-5 w-5" />
              <span>Account Management</span>
            </CardTitle>
            <CardDescription>Manage your account data and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium">Data & Privacy</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    Privacy Settings
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">Billing & Plans</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing History
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upgrade Plan
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">Support</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Phone className="mr-2 h-4 w-4" />
                    Contact Support
                  </Button>
                  <Button variant="destructive" className="w-full justify-start" size="sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
