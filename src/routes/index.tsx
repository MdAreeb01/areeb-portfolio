import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "@/components/portfolio/HeroSection";
import { MarqueeSection } from "@/components/portfolio/MarqueeSection";
import { AboutSection } from "@/components/portfolio/AboutSection";
import { ServicesSection } from "@/components/portfolio/ServicesSection";
import { ProjectsSection } from "@/components/portfolio/ProjectsSection";
import { ContactSection } from "@/components/portfolio/ContactSection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Areeb's Portfolio" },
      {
        name: "description",
        content:
          "Areeb is a Data Analyst and AI/ML enthusiast creating data-driven solutions, interactive dashboards, machine learning models, and AI applications.",
      },
      { property: "og:title", content: "Areeb's Portfolio" },
      {
        property: "og:description",
        content:
          "Data analysis, machine learning, and AI applications by Areeb.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main style={{ overflowX: "clip", backgroundColor: "#0C0C0C" }}>
      <HeroSection />
      <MarqueeSection />
      <AboutSection />
      <ServicesSection />
      <ProjectsSection />
      <ContactSection />
    </main>
  );
}
