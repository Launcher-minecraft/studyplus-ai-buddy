import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, FileText, Key, BarChart3, Trash2, Shield, Crown, Download,
  Copy, CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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

interface AdminUser {
  user_id: string;
  first_name: string | null;
  subscription_status: string;
  email?: string;
  role?: string;
  sheets_count?: number;
}

interface VipKey {
  id: string;
  key: string;
  used: boolean;
  used_by: string | null;
  created_at: string;
}

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [allSheets, setAllSheets] = useState<any[]>([]);
  const [vipKeys, setVipKeys] = useState<VipKey[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [stats, setStats] = useState({ totalUsers: 0, totalSheets: 0, premiumUsers: 0, vipUsers: 0, sheetsToday: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (!isAdmin) { navigate("/dashboard"); return; }
    loadData();
  }, [user, isAdmin]);

  const loadData = async () => {
    // Load profiles
    const { data: profiles } = await supabase.from("profiles").select("*");
    // Load all sheets
    const { data: sheets } = await supabase.from("sheets").select("*").order("created_at", { ascending: false });
    // Load vip keys
    const { data: keys } = await supabase.from("vip_keys").select("*").order("created_at", { ascending: false });
    // Load roles
    const { data: roles } = await supabase.from("user_roles").select("*");

    const today = new Date().toISOString().split("T")[0];

    if (profiles) {
      const usersData = profiles.map((p: any) => ({
        user_id: p.user_id,
        first_name: p.first_name,
        subscription_status: p.subscription_status,
        role: roles?.find((r: any) => r.user_id === p.user_id)?.role || "user",
        sheets_count: sheets?.filter((s: any) => s.user_id === p.user_id).length || 0,
      }));
      setUsers(usersData);
      setStats({
        totalUsers: profiles.length,
        totalSheets: sheets?.length || 0,
        premiumUsers: profiles.filter((p: any) => p.subscription_status === "premium").length,
        vipUsers: profiles.filter((p: any) => p.subscription_status === "vip").length,
        sheetsToday: sheets?.filter((s: any) => s.created_at?.startsWith(today)).length || 0,
      });
    }
    if (sheets) setAllSheets(sheets);
    if (keys) setVipKeys(keys as VipKey[]);
    setLoading(false);
  };

  const generateVipKeys = async () => {
    const keys = Array.from({ length: 5 }, () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const rand = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
      return `VIP-${rand(4)}-${rand(4)}`;
    });

    for (const key of keys) {
      await supabase.from("vip_keys").insert({ key });
    }
    toast({ title: "Clés générées", description: "5 nouvelles clés VIP créées." });
    loadData();
  };

  const changeRole = async (userId: string, newRole: string) => {
    if (newRole === "admin") {
      await supabase.from("user_roles").upsert({ user_id: userId, role: "admin" as any }, { onConflict: "user_id,role" });
    } else {
      await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
    }
    toast({ title: "Rôle mis à jour" });
    loadData();
  };

  const deleteSheet = async (sheetId: string) => {
    await supabase.from("sheets").delete().eq("id", sheetId);
    toast({ title: "Fiche supprimée" });
    loadData();
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const exportCsv = () => {
    const csv = "Prénom,Statut,Rôle,Fiches\n" +
      users.map((u) => `${u.first_name || ""},${u.subscription_status},${u.role},${u.sheets_count}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "users.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="min-h-screen bg-background pt-24 text-center text-muted-foreground">Chargement...</div>;

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

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            {[
              { label: "Utilisateurs", value: stats.totalUsers, icon: Users },
              { label: "Fiches générées", value: stats.totalSheets, icon: FileText },
              { label: "Premium", value: stats.premiumUsers, icon: Crown },
              { label: "VIP", value: stats.vipUsers, icon: Shield },
              { label: "Fiches aujourd'hui", value: stats.sheetsToday, icon: BarChart3 },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
                <stat.icon className="h-4 w-4 text-primary mb-2" />
                <p className="text-2xl font-display font-bold">{stat.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

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
                      {users.map((u) => (
                        <tr key={u.user_id} className="border-b border-border last:border-0">
                          <td className="p-3">
                            <p className="font-medium">{u.first_name || "Sans nom"}</p>
                          </td>
                          <td className="p-3">
                            <Badge variant={u.role === "admin" ? "default" : "secondary"} className="text-xs">{u.role}</Badge>
                          </td>
                          <td className="p-3">{statusBadge(u.subscription_status)}</td>
                          <td className="p-3 text-muted-foreground">{u.sheets_count}</td>
                          <td className="p-3 text-right">
                            <Select defaultValue={u.role} onValueChange={(v) => changeRole(u.user_id, v)}>
                              <SelectTrigger className="h-8 w-24 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">user</SelectItem>
                                <SelectItem value="admin">admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button variant="outline" size="sm" onClick={exportCsv}>
                  <Download className="h-4 w-4" />Export CSV
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="sheets">
              <div className="space-y-3">
                {allSheets.length === 0 ? (
                  <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                    <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>Aucune fiche générée.</p>
                  </div>
                ) : allSheets.map((sheet) => (
                  <div key={sheet.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{sheet.title}</p>
                      <p className="text-xs text-muted-foreground">{sheet.subject} • {sheet.level} • {new Date(sheet.created_at).toLocaleDateString("fr-FR")}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteSheet(sheet.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="vip">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-display font-semibold">Clés VIP</h3>
                  <Button variant="neon" size="sm" onClick={generateVipKeys}>
                    <Key className="h-4 w-4" />Générer 5 clés
                  </Button>
                </div>
                <div className="space-y-2">
                  {vipKeys.map((vk) => (
                    <div key={vk.id}
                      className={`rounded-lg border p-3 flex items-center justify-between ${vk.used ? "border-border bg-muted/20 opacity-60" : "border-primary/30 bg-primary/5"}`}>
                      <div>
                        <code className="text-sm font-mono">{vk.key}</code>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {vk.used ? "Utilisée" : "Disponible"} • {new Date(vk.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      {!vk.used && (
                        <Button variant="ghost" size="icon" onClick={() => copyKey(vk.key)} className="h-8 w-8">
                          {copiedKey === vk.key ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      )}
                    </div>
                  ))}
                  {vipKeys.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Aucune clé VIP générée.</p>}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
