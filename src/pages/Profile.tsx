import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Crown, Calendar, FileText, ArrowLeft, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const subscriptionLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  free: { label: "Gratuit", variant: "secondary" },
  premium: { label: "Premium", variant: "default" },
  vip: { label: "VIP", variant: "default" },
};

export default function Profile() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  if (loading || !user || !profile) return null;

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) {
      toast.error("Erreur : " + error.message);
    } else {
      toast.success("Mot de passe mis à jour avec succès");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const sub = subscriptionLabels[profile.subscription_status] ?? subscriptionLabels.free;

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-lg">
        <Button variant="ghost" size="sm" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>

        <Card className="border-primary/20">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full gradient-neon-bg">
              <User className="h-10 w-10 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-display">
              {profile.first_name || "Utilisateur"}
            </CardTitle>
            <Badge className={`mt-2 ${profile.subscription_status === "vip" ? "bg-amber-500 text-white" : ""}`} variant={sub.variant}>
              <Crown className="h-3 w-3 mr-1" />
              {sub.label}
            </Badge>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Fiches générées aujourd'hui</p>
                <p className="text-sm font-medium">{profile.sheets_generated_today}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Membre depuis</p>
                <p className="text-sm font-medium">
                  {new Date(user.created_at).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Lock className="h-5 w-5" /> Changer le mot de passe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 6 caractères" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
              <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Retapez le mot de passe" />
            </div>
            <Button onClick={handleChangePassword} disabled={changingPassword || !newPassword} className="w-full">
              {changingPassword ? "Mise à jour…" : "Mettre à jour"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
