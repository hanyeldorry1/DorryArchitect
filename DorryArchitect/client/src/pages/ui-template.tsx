import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronRight, 
  Home, 
  LayoutDashboard, 
  Settings, 
  User, 
  Bell, 
  FileText, 
  LogOut, 
  Moon, 
  Sun,
  Search,
  Sliders,
  BarChart4,
  Cpu,
  Zap,
  Layers,
  Database,
  HardDrive
} from "lucide-react";

export default function UITemplate() {
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  return (
    <div className="min-h-screen bg-background tech-bg">
      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} h-screen bg-black border-r border-primary/30 neon-border transition-all duration-300 ease-in-out fixed`}>
          <div className="p-4 border-b border-primary/30 flex items-center justify-between">
            {!sidebarCollapsed && (
              <h1 className="text-primary font-bold text-xl font-mono cyberpunk-text">NEXUS</h1>
            )}
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-primary hover:bg-primary/10"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            </Button>
          </div>
          <nav className="py-4">
            <ul className="space-y-1 px-2">
              {[
                { text: 'Home', icon: <Home className="h-5 w-5" /> },
                { text: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
                { text: 'Profile', icon: <User className="h-5 w-5" /> },
                { text: 'Documents', icon: <FileText className="h-5 w-5" /> },
                { text: 'Settings', icon: <Settings className="h-5 w-5" /> },
              ].map((item, index) => (
                <li key={index}>
                  <a 
                    href="#" 
                    className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-3'} py-2 rounded-md hover:bg-primary/10 transition-colors text-primary/80 hover:text-primary group`}
                  >
                    <span className="group-hover:cyberpunk-text">{item.icon}</span>
                    {!sidebarCollapsed && (
                      <span className="ml-3 font-medium">{item.text}</span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
            
            <div className="mx-2 my-4 border-t border-primary/20"></div>
            
            <ul className="space-y-1 px-2">
              <li>
                <a 
                  href="#" 
                  className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-3'} py-2 rounded-md hover:bg-primary/10 transition-colors text-primary/80 hover:text-primary group`}
                >
                  <span className="group-hover:cyberpunk-text"><LogOut className="h-5 w-5" /></span>
                  {!sidebarCollapsed && (
                    <span className="ml-3 font-medium">Logout</span>
                  )}
                </a>
              </li>
              <li>
                <div 
                  className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-3'} py-2 rounded-md text-primary/80`}
                >
                  <span className={darkMode ? "cyberpunk-text" : ""}>
                    {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  </span>
                  {!sidebarCollapsed && (
                    <Switch 
                      checked={darkMode}
                      onCheckedChange={setDarkMode}
                      className="ml-3 data-[state=checked]:bg-primary"
                    />
                  )}
                </div>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          {/* Header/Topbar */}
          <header className="border-b border-primary/30 h-16 flex items-center px-6 bg-black/70 sticky top-0 z-10">
            <div className="flex items-center w-full justify-between">
              <h1 className="text-primary font-bold text-xl font-mono cyberpunk-text">UI Components</h1>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search..."
                    className="pl-9 w-44 bg-black border-primary/40 focus:border-primary"
                  />
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-primary/60" />
                </div>
                
                <div className="relative">
                  <Button variant="ghost" size="icon" className="text-primary/80 hover:text-primary">
                    <Bell className="h-5 w-5" />
                  </Button>
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] border-none bg-primary text-primary-foreground">3</Badge>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-8 h-8 rounded-full border border-primary text-primary cyberpunk-text"
                >
                  <User className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Stat Cards */}
              {[
                { title: 'System Energy', value: '87.4%', icon: <Zap className="h-6 w-6" />, trend: '+2.5%' },
                { title: 'Core Processes', value: '24/36', icon: <Cpu className="h-6 w-6" />, trend: '-3.1%' },
                { title: 'Memory Usage', value: '12.4 GB', icon: <Database className="h-6 w-6" />, trend: '+0.8%' }
              ].map((stat, index) => (
                <Card key={index} className="border-primary/20 bg-black/60 neon-border overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full"></div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-primary/70">{stat.title}</p>
                        <p className="text-2xl font-bold mt-1 text-primary cyberpunk-text">{stat.value}</p>
                        <Badge className="mt-2 bg-primary/10 text-primary border-primary/20">{stat.trend}</Badge>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-md text-primary">
                        {stat.icon}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Main Card */}
              <Card className="col-span-2 border-primary/20 bg-black/60 neon-border">
                <CardHeader className="border-b border-primary/10 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-primary cyberpunk-text">System Performance</CardTitle>
                    <Button variant="ghost" size="sm" className="text-primary/70 hover:text-primary">
                      <Sliders className="h-4 w-4 mr-1" /> Filter
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-64 flex items-center justify-center border border-dashed border-primary/20 rounded-md">
                    <div className="text-center">
                      <BarChart4 className="h-12 w-12 text-primary/50 mx-auto mb-4" />
                      <p className="text-primary/70">Performance Chart Data</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {['CPU', 'GPU', 'Network'].map((label, i) => (
                      <div key={i} className="bg-black/40 p-3 rounded-md border border-primary/10">
                        <p className="text-xs text-primary/70">{label} Load</p>
                        <p className="text-lg font-mono font-bold text-primary">{Math.floor(Math.random() * 100)}%</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Secondary Card */}
              <Card className="border-primary/20 bg-black/60 neon-border">
                <CardHeader className="border-b border-primary/10 pb-3">
                  <CardTitle className="text-lg text-primary cyberpunk-text">Storage Status</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {['System', 'Data', 'Backup'].map((drive, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <HardDrive className="h-5 w-5 text-primary/70" />
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-xs text-primary/70">{drive} Drive</span>
                            <span className="text-xs text-primary/90 font-mono">{Math.floor(30 + Math.random() * 60)}%</span>
                          </div>
                          <div className="h-1.5 bg-black/40 rounded-full w-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full" 
                              style={{ width: `${Math.floor(30 + Math.random() * 60)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="mt-6 w-full neon-button">Optimize</Button>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* UI Elements Card */}
              <Card className="border-primary/20 bg-black/60 neon-border">
                <CardHeader className="border-b border-primary/10 pb-3">
                  <CardTitle className="text-lg text-primary cyberpunk-text">UI Elements</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {/* Buttons */}
                  <div className="space-y-2">
                    <Label className="text-primary/70">Buttons</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button className="neon-button">Primary</Button>
                      <Button variant="outline" className="border-primary/60 text-primary hover:bg-primary/10 hover:text-primary">Outline</Button>
                      <Button variant="ghost" className="text-primary hover:bg-primary/10 hover:text-primary">Ghost</Button>
                      <Button variant="destructive">Destructive</Button>
                    </div>
                  </div>

                  {/* Toggle & Inputs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="toggle-1" className="text-primary/70 mb-2 block">Toggle Switch</Label>
                      <div className="flex items-center space-x-2">
                        <Switch id="toggle-1" className="data-[state=checked]:bg-primary" />
                        <Label htmlFor="toggle-1" className="text-primary/80">Power Saving Mode</Label>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="input-1" className="text-primary/70 mb-2 block">Input Field</Label>
                      <Input id="input-1" placeholder="Enter value" className="bg-black/60 border-primary/40 focus:border-primary" />
                    </div>
                  </div>

                  {/* Badges */}
                  <div>
                    <Label className="text-primary/70 mb-2 block">Status Badges</Label>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-primary/20 text-primary border-primary/20">Online</Badge>
                      <Badge variant="outline" className="border-primary/40 text-primary">System</Badge>
                      <Badge variant="secondary" className="bg-secondary/20 text-secondary border-secondary/20">Warning</Badge>
                      <Badge variant="destructive">Critical</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Typography Card */}
              <Card className="border-primary/20 bg-black/60 neon-border">
                <CardHeader className="border-b border-primary/10 pb-3">
                  <CardTitle className="text-lg text-primary cyberpunk-text">Typography</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold text-primary cyberpunk-text mb-1">Main Heading</h1>
                    <h2 className="text-xl font-semibold text-primary mb-1">Subheading</h2>
                    <h3 className="text-lg font-medium text-primary/90 mb-1">Section Title</h3>
                    <h4 className="text-base font-medium text-primary/80 mb-2">Subsection</h4>
                    <p className="text-sm text-primary/70 mb-3">Regular paragraph text that shows standard content styling. The text should be readable while maintaining the cyberpunk aesthetic with the neon yellow on black.</p>
                    <p className="text-xs text-primary/60">Small footer text or caption with lower emphasis.</p>
                  </div>

                  <div className="border-t border-primary/20 pt-4">
                    <div className="font-mono text-primary/90 text-sm">
                      <p>{'>'} system.status<span className="blink">_</span></p>
                      <p className="cyberpunk-text mt-1">{'>'} ONLINE</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}