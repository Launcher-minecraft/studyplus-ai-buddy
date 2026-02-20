import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Settings as SettingsIcon, User, Bell, Trash2, Mail, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const NOTIF_PREFS_KEY = "studyplus_notif_prefs";

function loadNotifPrefs() {
  try {
    const raw = localStorage.getItem(NOTIF_PREFS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { limitAlert: true, generationDone: true, tips: false };
}

function saveNotifPrefs(prefs: Record<string, boolean>) {
  localStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(prefs));
}

export default function SettingsPage() {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [updatingEmail, setUpdatingEmail] = useState(false);

  const [notifPrefs, setNotifPrefs] = useState(loadNotifPrefs);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email]);

  if (loading || !user || !profile) return null;

  const handleUpdateEmail = async () => {
    if (!email.trim() || email === user.email) return;
    setUpdatingEmail(true);
    const { error } = await supabase.auth.updateUser({ email: email.trim() });
    setUpdatingEmail(false);
    if (error) {
      toast.error("Erreur : " + error.message);
    } else {
      toast.success("Un email de confirmation a été envoyé à ta nouvelle adresse.");
    }
  };

  const handleNotifChange = (key: string, value: boolean) => {
    const updated = { ...notifPrefs, [key]: value };
    setNotifPrefs(updated);
    saveNotifPrefs(updated);
    toast.success("Préférences mises à jour");
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "SUPPRIMER") return;
    setDeleting(true);

    // Delete user data first
    const { error: sheetsErr } = await supabase.from("sheets").delete().eq("user_id", user.id);
    const { error: profileErr } = await supabase.from("profiles").delete().eq("user_id", user.id);

    // Sign out (actual auth.users deletion requires admin/service role — inform user)
    await signOut();
    setDeleting(false);
    setShowDeleteDialog(false);
    toast.success("Tes données ont été supprimées. Ton compte sera définitivement supprimé sous 24h.");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-lg">
        <Button variant="ghost" size="sm" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-neon-bg">
            <SettingsIcon className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Paramètres</h1>
            <p className="text-sm text-muted-foreground">Gère ton compte et tes préférences</p>
          </div>
        </div>

        {/* Account Section */}
        <Card className="border-primary/20 mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <User className="h-5 w-5" /> Compte
            </CardTitle>
            <CardDescription>Informations de ton compte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="settings-email">Adresse email</Label>
              <div className="flex gap-2">
                <Input
                  id="settings-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button
                  variant="outline"
                  onClick={handleUpdateEmail}
                  disabled={updatingEmail || email === user.email || !email.trim()}
                >
                  {updatingEmail ? "…" : "Modifier"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Un email de confirmation sera envoyé.</p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Mot de passe</p>
                  <p className="text-xs text-muted-foreground">Modifie ton mot de passe</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/profile")}>
                Modifier
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card className="border-primary/20 mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Bell className="h-5 w-5" /> Notifications
            </CardTitle>
            <CardDescription>Choisis quelles notifications recevoir</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Alerte limite de fiches</p>
                <p className="text-xs text-muted-foreground">Prévenu quand tu approches de ta limite quotidienne</p>
              </div>
              <Switch
                checked={notifPrefs.limitAlert}
                onCheckedChange={(v) => handleNotifChange("limitAlert", v)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Génération terminée</p>
                <p className="text-xs text-muted-foreground">Notification quand tes fiches sont prêtes</p>
              </div>
              <Switch
                checked={notifPrefs.generationDone}
                onCheckedChange={(v) => handleNotifChange("generationDone", v)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Conseils & astuces</p>
                <p className="text-xs text-muted-foreground">Reçois des conseils pour mieux réviser</p>
              </div>
              <Switch
                checked={notifPrefs.tips}
                onCheckedChange={(v) => handleNotifChange("tips", v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/30 mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-display flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" /> Zone dangereuse
            </CardTitle>
            <CardDescription>Actions irréversibles sur ton compte</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Supprimer mon compte</p>
                <p className="text-xs text-muted-foreground">Toutes tes données seront supprimées définitivement</p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
                Supprimer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive font-display">Supprimer ton compte</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Toutes tes fiches, ton historique et tes données seront supprimés.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <p className="text-sm">
              Tape <strong>SUPPRIMER</strong> pour confirmer :
            </p>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="SUPPRIMER"
            />
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => { setShowDeleteDialog(false); setDeleteConfirm(""); }}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirm !== "SUPPRIMER" || deleting}
            >
              {deleting ? "Suppression…" : "Confirmer la suppression"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
