import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Users, 
  Pill, 
  Calendar,
  Settings,
  Bell,
  Menu,
  X 
} from "lucide-react";

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'medication', label: 'Medications', icon: Pill },
    { id: 'caregiver', label: 'Caregiver Portal', icon: Users },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-background/80 backdrop-blur-sm"
        >
          {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-background/95 backdrop-blur-sm border-r transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8 mt-8 lg:mt-0">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg bg-gradient-primary bg-clip-text text-transparent">
                InhaleSync
              </h1>
              <p className="text-xs text-muted-foreground">Smart Inhaler Care</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-2 flex-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    isActive 
                      ? 'bg-gradient-primary text-white shadow-medical' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => {
                    onPageChange(item.id);
                    setIsOpen(false);
                  }}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                  {item.id === 'caregiver' && (
                    <Badge variant="secondary" className="ml-auto bg-accent/10 text-accent text-xs">
                      2
                    </Badge>
                  )}
                </Button>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="space-y-2 pt-4 border-t">
            <Button variant="ghost" className="w-full justify-start">
              <Bell className="w-4 h-4 mr-3" />
              Notifications
              <Badge variant="destructive" className="ml-auto text-xs">
                3
              </Badge>
            </Button>
            
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </Button>
          </div>

          {/* Patient Info */}
          <div className="mt-4 p-3 rounded-lg bg-muted/50">
            <p className="text-sm font-medium">John Smith</p>
            <p className="text-xs text-muted-foreground">Asthma Patient</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-accent rounded-full" />
              <span className="text-xs text-accent">Device Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 lg:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}