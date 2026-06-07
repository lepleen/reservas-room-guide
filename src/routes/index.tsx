import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Roomr — Event reservations made simple" },
      { name: "description", content: "Plan rooms, AV, schedules, and registrations in one minimalist workspace." },
      { property: "og:title", content: "Roomr — Event reservations" },
      { property: "og:description", content: "Plan rooms, AV, schedules, and registrations in one place." },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  const { user, login } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    login(email.trim(), name.trim() || undefined);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-secondary border-r border-border">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-md bg-primary flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-base font-semibold tracking-tight">Roomr</span>
        </div>
        <div className="max-w-md">
          <h2 className="text-3xl font-semibold tracking-tight leading-tight">
            A calmer way to plan every event detail.
          </h2>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Rooms, AV, catering, schedules, speakers, broadcasts — captured in
            one structured workspace, so nothing slips through the cracks.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-xs text-muted-foreground">
            <div><div className="text-foreground font-medium text-sm">120+</div>setups managed</div>
            <div><div className="text-foreground font-medium text-sm">8 min</div>avg. to plan an event</div>
            <div><div className="text-foreground font-medium text-sm">100%</div>checklist coverage</div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">© Roomr. Minimalist event ops.</p>
      </div>

      <div className="flex items-center justify-center p-8">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Use any email to enter your demo workspace.
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Rivera" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>
          </div>
          <Button type="submit" className="w-full">Continue</Button>
          <p className="text-xs text-muted-foreground text-center">
            Demo auth — connect Lovable Cloud to enable real accounts.
          </p>
        </form>
      </div>
    </div>
  );
}
