import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'
import { 
  Home, 
  Users, 
  UserPlus, 
  Crown, 
  Calendar, 
  CheckCircle, 
  Trophy, 
  Activity, 
  Swimming, 
  Target, 
  Users2, 
  Download, 
  Award, 
  BarChart3,
  Menu,
  X,
  Sun,
  Moon,
  LogOut
} from 'lucide-react'
import { Button } from '../ui/button'

const SidebarLink = ({ to, children, icon: Icon, isActive, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        isActive
          ? "bg-primary text-primary-foreground shadow-md"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{children}</span>
    </button>
  </motion.div>
)

const DashboardLayout = ({ 
  children, 
  title, 
  subtitle, 
  navigation = [], 
  showSidebar = true,
  onNavigate,
  currentPath 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, toggleTheme, isDark } = useTheme()

  const defaultNavigation = [
    { to: "/admin", label: "Dashboard", icon: Home },
    { to: "/admin/students", label: "All Students", icon: Users },
    { to: "/admin/captains", label: "Captains & Teams", icon: Crown },
    { to: "/admin/create-student", label: "Create Student", icon: UserPlus },
    { to: "/admin/create-teacher", label: "Create Teacher", icon: UserPlus },
    { to: "/admin/create-captain", label: "Create Captain", icon: Crown },
    { to: "/admin/session", label: "Manage Sessions", icon: Calendar },
    { to: "/admin/approvals", label: "Approve Teams", icon: CheckCircle },
    { to: "/admin/gym-attendance", label: "Gym Attendance", icon: Activity },
    { to: "/admin/swimming-attendance", label: "Swimming Attendance", icon: Swimming },
    { to: "/admin/assign-position", label: "Assign Positions", icon: Target },
    { to: "/admin/assign-team-position", label: "Team Positions", icon: Users2 },
    { to: "/admin/export", label: "Export Students", icon: Download },
    { to: "/admin/export-captains", label: "Export Captains", icon: Download },
    { to: "/admin/issue-cert", label: "Certificates", icon: Award },
    { to: "/admin/score", label: "Score Matrix", icon: BarChart3 },
  ]

  const navItems = navigation.length > 0 ? navigation : defaultNavigation

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-30 bg-card border-b border-border shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          <div className="font-semibold text-foreground">{title || 'Dashboard'}</div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <>
          {/* Mobile Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          
          {/* Sidebar */}
          <motion.aside
            initial={false}
            animate={{
              x: sidebarOpen ? 0 : '-100%',
            }}
            transition={{ type: "spring", duration: 0.3 }}
            className={`fixed top-0 left-0 h-full w-64 bg-card border-r border-border shadow-lg z-50 lg:translate-x-0 lg:static lg:z-auto ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="text-xl font-bold text-primary">Sports Admin</div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="hidden lg:flex h-8 w-8"
                  >
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => (
                  <SidebarLink
                    key={item.to}
                    to={item.to}
                    icon={item.icon}
                    isActive={currentPath === item.to}
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate(item.to)
                      }
                      setSidebarOpen(false)
                    }}
                  >
                    {item.label}
                  </SidebarLink>
                ))}
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </motion.aside>
        </>
      )}

      {/* Main Content */}
      <div className={showSidebar ? "lg:ml-64" : ""}>
        <main className="min-h-screen">
          <div className="p-6">
            {/* Page Header */}
            {(title || subtitle) && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
                {subtitle && (
                  <p className="text-muted-foreground text-lg">{subtitle}</p>
                )}
              </motion.div>
            )}

            {/* Page Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
