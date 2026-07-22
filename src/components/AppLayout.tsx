import { useAuth } from "@/hooks/use-auth";
import { useNavigate, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Ticket,
  LayoutDashboard,
  PlusCircle,
  Settings,
  LogOut,
  Menu,
  X,
  MessageSquare,
  ShieldCheck,
  ChevronDown,
  Layers,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, signOut, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    { href: "/dashboard", label: "Meus Chamados", icon: LayoutDashboard },
    { href: "/tickets/new", label: "Abrir Chamado", icon: PlusCircle },
  ];

  const adminNavItems = [
    { href: "/admin", label: "Painel Admin", icon: ShieldCheck },
    { href: "/admin/tickets", label: "Todos Chamados", icon: Ticket },
    { href: "/admin/categories", label: "Categorias", icon: Layers },
  ];

  const isActive = (path: string) => location.pathname === path;

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border/50 transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-5 border-b border-border/40">
            <div className="flex items-center gap-2.5" onClick={() => navigate("/")}>
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center cursor-pointer">
                <Ticket className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-base tracking-tight">HelpDesk</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-3">
                Geral
              </p>
              <div className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => { navigate(item.href); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive(item.href)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {isAdmin && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-3">
                  Administrativo
                </p>
                <div className="space-y-1">
                  {adminNavItems.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => { navigate(item.href); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive(item.href)
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </nav>

          {/* User Area */}
          <div className="p-4 border-t border-border/40">
            <div className="flex items-center gap-3 px-3 py-2">
              <Avatar className="w-8 h-8 ring-2 ring-border">
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name || "Usuário"}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {isAdmin ? "Administrador" : "Cliente"}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-2 px-3 py-2 mt-1 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-xl border-b border-border/30">
          <div className="flex items-center justify-between h-full px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-base font-semibold tracking-tight">
                {isActive("/dashboard") && "Meus Chamados"}
                {isActive("/tickets/new") && "Abrir Chamado"}
                {location.pathname.startsWith("/tickets/") && !location.pathname.includes("/new") && "Detalhes do Chamado"}
                {isActive("/admin") && "Painel Administrativo"}
                {isActive("/admin/tickets") && "Gerenciar Chamados"}
              </h1>
            </div>
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-accent transition-colors"
              >
                <Avatar className="w-7 h-7">
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 w-48 p-1.5 rounded-xl bg-card border border-border/50 shadow-lg shadow-black/5">
                    <div className="px-3 py-2 border-b border-border/30 mb-1">
                      <p className="text-sm font-medium">{user.name || "Usuário"}</p>
                      <p className="text-xs text-muted-foreground">{user.email || ""}</p>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => { navigate("/admin"); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Administração
                      </button>
                    )}
                    <button
                      onClick={() => { signOut(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
