import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, FileText, Key, BarChart3, Trash2, Shield, Crown, Download,
  Copy, CheckCircle2,
} from "lucide-react";

// Mock data
const mockStats = {
  totalUsers: 1247,
  totalSheets: 8934,
  premiumUsers: 89,
  vipUsers: 23,
  sheetsToday: 156,
};

const mockUsers = [
  { id: "1", name: "Alice Martin", email: "alice@email.com", role: "user", status: "premium", sheetsCount: 45 },
  { id: "2", name: "Lucas Dupont", email: "lucas@email.com", role: "user", status: "free", sheetsCount: 12 },
  { id: "3", name: "Emma Bernard", email: "emma@email.com", role: "user", status: "vip", sheetsCount: 78 },
  { id: "4", name: "Admin", email: "admin@studyplus.com", role: "admin", status: "vip", sheetsCount: 0 },
];

const mockVipKeys = [
  { key: "VIP-XXXX-1234", used: false, createdAt: "2026-02-14" },
  { key: "VIP-XXXX-5678", used: true, usedBy: "emma@email.com", createdAt: "2026-02-10" },
];

const statusBadge = (status: string) => {
  switch (status) {
    case "premium":
      return <span className="inline-flex items-center gap-1 rounded-full gradient-neon-bg text-primary-foreground px-2 py-0.5 text-xs font-medium"><Crown className="h-3 w-3" />Premium</span>;
    case "vip":
      return <span className="inline-flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground px-2 py-0.5 text-xs font-medium"><Shield className="h-3 w-3" />VIP</span>;
    default:
      return <span className="rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-xs">Gratuit</span>;
  }
};

export default function Admin() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-neon-bg">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Panel Admin</h1>
              <p className="text-sm text-muted-foreground">Gestion de Study+</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            {[
              { label: "Utilisateurs", value: mockStats.totalUsers, icon: Users },
              { label: "Fiches générées", value: mockStats.totalSheets, icon: FileText },
              { label: "Premium", value: mockStats.premiumUsers, icon: Crown },
              { label: "VIP", value: mockStats.vipUsers, icon: Shield },
              { label: "Fiches aujourd'hui", value: mockStats.sheetsToday, icon: BarChart3 },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
                <stat.icon className="h-4 w-4 text-primary mb-2" />
                <p className="text-2xl font-display font-bold">{stat.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="users">
            <TabsList className="bg-muted mb-6">
              <TabsTrigger value="users">Utilisateurs</TabsTrigger>
              <TabsTrigger value="sheets">Fiches</TabsTrigger>
              <TabsTrigger value="vip">Clés VIP</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left p-3 font-medium text-muted-foreground">Utilisateur</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Rôle</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Statut</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Fiches</th>
                        <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockUsers.map((user) => (
                        <tr key={user.id} className="border-b border-border last:border-0">
                          <td className="p-3">
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </td>
                          <td className="p-3">
                            <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs">
                              {user.role}
                            </Badge>
                          </td>
                          <td className="p-3">{statusBadge(user.status)}</td>
                          <td className="p-3 text-muted-foreground">{user.sheetsCount}</td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Select defaultValue={user.role}>
                                <SelectTrigger className="h-8 w-24 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">user</SelectItem>
                                  <SelectItem value="admin">admin</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="sheets">
              <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>Les fiches seront affichées ici une fois le backend connecté.</p>
              </div>
            </TabsContent>

            <TabsContent value="vip">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-display font-semibold">Clés VIP</h3>
                  <Button variant="neon" size="sm">
                    <Key className="h-4 w-4" />
                    Générer des clés
                  </Button>
                </div>
                <div className="space-y-2">
                  {mockVipKeys.map((vk) => (
                    <div
                      key={vk.key}
                      className={`rounded-lg border p-3 flex items-center justify-between ${
                        vk.used ? "border-border bg-muted/20 opacity-60" : "border-primary/30 bg-primary/5"
                      }`}
                    >
                      <div>
                        <code className="text-sm font-mono">{vk.key}</code>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {vk.used ? `Utilisée par ${vk.usedBy}` : "Disponible"} • {new Date(vk.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      {!vk.used && (
                        <Button variant="ghost" size="icon" onClick={() => copyKey(vk.key)} className="h-8 w-8">
                          {copiedKey === vk.key ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
