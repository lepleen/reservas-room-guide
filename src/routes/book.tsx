import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { RoleGateway } from "@/components/landing/RoleGateway";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book a Space — Roomr" },
      {
        name: "description",
        content:
          "Choose between external or internal reservation flows to request a corporate space on Roomr.",
      },
    ],
  }),
  component: BookGateway,
});

function BookGateway() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <RoleGateway />
      </main>
      <SiteFooter />
    </div>
  );
}
