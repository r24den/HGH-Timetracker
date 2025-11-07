import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Clock, Users, BarChart3, Calendar, FolderKanban, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function AdminSidebar() {
  const location = useLocation();
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  
  const menuItems = [
    { title: 'Übersicht', icon: BarChart3, href: '/dashboard' },
    { title: 'Mitarbeiter', icon: Users, href: '/employees' },
    { title: 'Zeiterfassung', icon: Clock, href: '/time-tracking' },
    { title: 'Projekte', icon: FolderKanban, href: '/projects' },
    { title: 'Urlaub', icon: Calendar, href: '/absences' },
    { title: 'Einstellungen', icon: Settings, href: '/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Clock className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold">HGH</h1>
            <p className="text-xs text-muted-foreground">Stundenerfassung</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.href}>
                    <Link to={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <div className="p-4">
          <div className="mb-3">
            <p className="text-sm font-medium">{currentUser?.name}</p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Abmelden
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}