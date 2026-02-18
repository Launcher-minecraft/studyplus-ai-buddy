import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, Crown, Calendar, FileText, ArrowLeft } from "lucide-react";

const subscriptionLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  free: { label: "Gratuit", variant: "secondary" },
  premium: { label: "Premium", variant: "default" },
  vip: { label: "VIP", variant: "default" },
};

export default function Profile() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  if (loading || !user || !profile) return null;

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
      </div>
    </div>
  );
}
