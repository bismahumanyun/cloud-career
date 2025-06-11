import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { 
  Users, 
  Building2, 
  Briefcase, 
  FileText, 
  GraduationCap,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';

const quickStatsData = [
  {
    title: 'Total Applicants',
    value: '1,247',
    change: '+12%',
    changeType: 'positive' as const,
    icon: Users,
  },
  {
    title: 'Active Companies',
    value: '89',
    change: '+5%',
    changeType: 'positive' as const,
    icon: Building2,
  },
  {
    title: 'Open Positions',
    value: '156',
    change: '+18%',
    changeType: 'positive' as const,
    icon: Briefcase,
  },
  {
    title: 'Applications Today',
    value: '23',
    change: '-3%',
    changeType: 'negative' as const,
    icon: FileText,
  },
];

const quickActions = [
  {
    title: 'Manage Applicants',
    description: 'View and manage applicant profiles, education, and skills',
    href: '/applicants/profiles',
    icon: Users,
    color: 'bg-blue-500',
  },
  {
    title: 'Company Management',
    description: 'Manage company profiles, jobs, and requirements',
    href: '/companies/profiles',
    icon: Building2,
    color: 'bg-green-500',
  },
  {
    title: 'Job Postings',
    description: 'Create and manage job postings and descriptions',
    href: '/companies/jobs',
    icon: Briefcase,
    color: 'bg-purple-500',
  },
  {
    title: 'System Settings',
    description: 'Configure country codes, languages, and security',
    href: '/system/countries',
    icon: GraduationCap,
    color: 'bg-orange-500',
  },
];

const recentActivity = [
  {
    action: 'New applicant registered',
    user: 'John Smith',
    time: '2 minutes ago',
    icon: Users,
  },
  {
    action: 'Job application submitted',
    user: 'Jane Doe',
    time: '15 minutes ago',
    icon: FileText,
  },
  {
    action: 'Company profile updated',
    user: 'Tech Corp',
    time: '1 hour ago',
    icon: Building2,
  },
  {
    action: 'New job posting created',
    user: 'Startup Inc',
    time: '2 hours ago',
    icon: Briefcase,
  },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.login.fullName}!
        </h1>
        <p className="text-blue-100">
          Here's what's happening with your CareerCloud platform today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStatsData.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className={`text-sm ${
                      stat.changeType === 'positive' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-full">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <Card 
              key={action.title} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(action.href)}
            >
              <CardContent className="p-6">
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {action.description}
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Access
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                const IconComponent = activity.icon;
                return (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <IconComponent className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.user} • {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Status</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Operational</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Connected</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email Service</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Active</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">File Storage</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-yellow-600">78% Used</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
