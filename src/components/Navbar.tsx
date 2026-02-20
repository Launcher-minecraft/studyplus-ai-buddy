import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Menu, X, Zap, LogOut, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationCenter } from "@/components/NotificationCenter";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAdmin, signOut, profile } = useAuth();

  const navItems = [
    { label: "Accueil", path: "/" },
    ...(user ? [
      { label: "Dashboard", path: "/dashboard" },
      { label: "Historique", path: "/history" },
    ] : []),
    { label: "Tarifs", path: "/pricing" },
    ...(isAdmin ? [{ label: "Admin", path: "/admin" }] : []),
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-neon-bg">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold gradient-neon-text">Study+</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}
              className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === item.path ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}>
              {location.pathname === item.path && (
                <motion.div layoutId="nav-active" className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
              )}
              <span className="relative z-10">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          {user && <NotificationCenter />}
          {user ? (
            <>
              <Link to="/profile">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4" />
                  {profile?.first_name || "Profil"}
                </Button>
              </Link>
              <Link to="/settings">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm">Connexion</Button></Link>
              <Link to="/register">
                <Button variant="neon" size="sm"><Zap className="h-4 w-4" />S'inscrire</Button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="md:hidden glass border-t border-border px-4 pb-4">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
              className={`block py-3 text-sm font-medium ${location.pathname === item.path ? "text-primary" : "text-muted-foreground"}`}>
              {item.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-3 items-center">
            <ThemeToggle />
            {user ? (
              <Button variant="ghost" size="sm" className="w-full" onClick={() => { signOut(); setMobileOpen(false); }}>
                <LogOut className="h-4 w-4" />Déconnexion
              </Button>
            ) : (
              <>
                <Link to="/login" className="flex-1"><Button variant="ghost" size="sm" className="w-full">Connexion</Button></Link>
                <Link to="/register" className="flex-1"><Button variant="neon" size="sm" className="w-full">S'inscrire</Button></Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </header>
  );
}
