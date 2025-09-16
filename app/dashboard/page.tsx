import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { getUserStats, getUsageLimits } from '@/lib/usage'
import { getOrCreateUser } from '@/lib/get-or-create-user'
import Link from 'next/link'
import { Calendar, Download, Eye, TrendingUp, CreditCard, Settings } from 'lucide-react'

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getOrCreateUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  const userPlan = (user.subscription?.plan === 'PRO' && user.subscription?.status === 'active') ? 'PRO' : 'FREE'
  const stats = await getUserStats(user.id)
  const limits = await getUsageLimits(userPlan)

  const parseUsagePercent = (stats.currentMonth.parses / limits.monthlyParses) * 100
  const downloadUsagePercent = limits.monthlyDownloads > 0 
    ? (stats.currentMonth.downloads / limits.monthlyDownloads) * 100 
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500">Monitor your usage and manage your account</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={userPlan === 'PRO' ? 'default' : 'secondary'}>
                {userPlan} Plan
              </Badge>
              <Link href="/app/parse">
                <Button>Parse Video</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subscription Status */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Subscription Status
                </CardTitle>
                <CardDescription>
                  Current plan: {userPlan}
                  {user.subscription?.currentPeriodEnd && (
                    <span className="ml-2">
                      • Renews {new Date(user.subscription.currentPeriodEnd).toLocaleDateString()}
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="space-x-2">
                {userPlan === 'FREE' && (
                  <Link href="/pricing">
                    <Button>Upgrade to PRO</Button>
                  </Link>
                )}
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Usage Stats */}
        <div className="grid gap-6 mb-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Parse Usage This Month
              </CardTitle>
              <CardDescription>
                {stats.currentMonth.parses} of {limits.monthlyParses} parses used
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={parseUsagePercent} className="mb-2" />
              <p className="text-sm text-gray-600">
                {limits.monthlyParses - stats.currentMonth.parses} parses remaining
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="h-5 w-5 mr-2" />
                Download Usage This Month
              </CardTitle>
              <CardDescription>
                {userPlan === 'FREE' ? 'Upgrade to PRO for downloads' : 
                 `${stats.currentMonth.downloads} of ${limits.monthlyDownloads} downloads used`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userPlan === 'PRO' ? (
                <>
                  <Progress value={downloadUsagePercent} className="mb-2" />
                  <p className="text-sm text-gray-600">
                    {limits.monthlyDownloads - stats.currentMonth.downloads} downloads remaining
                  </p>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-4">Download functionality requires PRO plan</p>
                  <Link href="/pricing">
                    <Button size="sm">Upgrade Now</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* All-Time Stats */}
        <div className="grid gap-6 mb-8 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Parses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                {stats.allTime.totalParses.toLocaleString()}
              </p>
              {stats.allTime.firstParse && (
                <p className="text-sm text-gray-500 mt-1">
                  Since {new Date(stats.allTime.firstParse).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Downloads</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {stats.allTime.totalDownloads.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Compliant downloads only
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Plan:</span>
                  <Badge variant={userPlan === 'PRO' ? 'default' : 'secondary'}>
                    {userPlan}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Status:</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest parse requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <p className="font-medium">{activity.title || 'Untitled Video'}</p>
                      <p className="text-sm text-gray-500">
                        {activity.platform} • {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline">{activity.platform}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No activity yet</p>
                <Link href="/app/parse">
                  <Button>Parse Your First Video</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}