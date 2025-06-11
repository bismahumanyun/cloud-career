import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from '../ui/sidebar';
import { 
  Briefcase, 
  Users, 
  Building2, 
  GraduationCap, 
  FileText, 
  User, 
  Settings, 
  Shield, 
  Globe, 
  LogOut,
  Menu,
  ChevronDown,
  Home
} from 'lucide-react';
import type { NavigationItem } from '../../types/entities';

const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'Home',
  },
  {
    label: 'Applicants',
    href: '/applicants',
    icon: 'Users',
    children: [
      { label: 'Profiles', href: '/applicants/profiles', icon: 'User' },
      { label: 'Education', href: '/applicants/education', icon: 'GraduationCap' },
      { label: 'Skills', href: '/applicants/skills', icon: 'Settings' },
      { label: 'Work History', href: '/applicants/work-history', icon: 'Briefcase' },
      { label: 'Resumes', href: '/applicants/resumes', icon: 'FileText' },
      { label: 'Job Applications', href: '/applicants/applications', icon: 'FileText' },
    ],
  },
  {
    label: 'Companies',
    href: '/companies',
    icon: 'Building2',
    children: [
      { label: 'Profiles', href: '/companies/profiles', icon: 'Building2' },
      { label: 'Descriptions', href: '/companies/descriptions', icon: 'FileText' },
      { label: 'Locations', href: '/companies/locations', icon: 'Globe' },
      { label: 'Jobs', href: '/companies/jobs', icon: 'Briefcase' },
      { label: 'Job Descriptions', href: '/companies/job-descriptions', icon: 'FileText' },
      { label: 'Job Education', href: '/companies/job-education', icon: 'GraduationCap' },
      { label: 'Job Skills', href: '/companies/job-skills', icon: 'Settings' },
    ],
  },
  {
    label: 'Security',
    href: '/security',
    icon: 'Shield',
    roles: ['Admin'],
    children: [
      { label: 'Logins', href: '/security/logins', icon: 'User' },
      { label: 'Roles', href: '/security/roles', icon: 'Shield' },
      { label: 'Login Roles', href: '/security/login-roles', icon: 'Users' },
      { label: 'Login Logs', href: '/security/login-logs', icon: 'FileText' },
    ],
  },
  {
    label: 'System',
    href: '/system',
    icon: 'Settings',
    roles: ['Admin'],
    children: [
      { label: 'Country Codes', href: '/system/countries', icon: 'Globe' },
      { label: 'Language Codes', href: '/system/languages', icon: 'Globe' },
    ],
  },
];

const iconMap = {
  Home,
  Users,
  Building2,
  GraduationCap,
  FileText,
  User,
  Settings,
  Shield,
  Globe,
  Briefcase,
};

function NavigationMenu() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  const renderNavigationItem = (item: NavigationItem) => {
    const IconComponent = iconMap[item.icon as keyof typeof iconMap];
    const isActive = location.pathname === item.href;
    const isExpanded = expandedItems.includes(item.href);
    
    // Check role permissions
    if (item.roles && !item.roles.some(role => hasRole(role))) {
      return null;
    }

    if (item.children && item.children.length > 0) {
      return (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            onClick={() => toggleExpanded(item.href)}
            className={`w-full justify-between ${isActive ? 'bg-blue-100 text-blue-700' : ''}`}
          >
            <div className="flex items-center">
              <IconComponent className="h-4 w-4 mr-3" />
              {item.label}
            </div>
            <ChevronDown 
              className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            />
          </SidebarMenuButton>
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children.map(child => (
                <div key={child.href}>
                  <SidebarMenuButton
                    onClick={() => navigate(child.href)}
                    className={`w-full ${location.pathname === child.href ? 'bg-blue-100 text-blue-700' : ''}`}
                  >
                    <div className="flex items-center">
                      {iconMap[child.icon as keyof typeof iconMap] && (
                        React.createElement(iconMap[child.icon as keyof typeof iconMap], { 
                          className: "h-4 w-4 mr-3" 
                        })
                      )}
                      {child.label}
                    </div>
                  </SidebarMenuButton>
                </div>
              ))}
            </div>
          )}
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton
          onClick={() => navigate(item.href)}
          className={`w-full ${isActive ? 'bg-blue-100 text-blue-700' : ''}`}
        >
          <div className="flex items-center">
            <IconComponent className="h-4 w-4 mr-3" />
            {item.label}
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <SidebarMenu className="space-y-1">
      {navigationItems.map(renderNavigationItem)}
    </SidebarMenu>
  );
}

export function DashboardLayout() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar className="border-r bg-white">
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">CareerCloud</h1>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <NavigationMenu />
          </SidebarContent>
          
          <SidebarFooter className="border-t p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-2">
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarFallback>
                      {user?.login.fullName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{user?.login.fullName}</p>
                    <p className="text-xs text-gray-600">{user?.roles.join(', ')}</p>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <SidebarTrigger>
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
              <h2 className="text-lg font-semibold text-gray-900">
                Dashboard
              </h2>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
