import { useEffect, useState } from "react";
import { getPageHero } from "../../api/pageHeroesApi";

export default function GarageHero() {
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHero() {
      try {
        const data = await getPageHero("garage", 1);
        setHero(data);
      } catch (error) {
        console.error("Failed to load garage hero:", error);
      } finally {
        setLoading(false);
      }
    }

    loadHero();
  }, []);

  if (loading) return null;

  const heroImage = hero?.imageUrl || "/images/garage_header.png";

  return (
    <section
      className="garage-hero"
      style={{
        backgroundImage: `
        linear-gradient(
          to bottom,
          rgba(0,0,0,.08),
          rgba(0,0,0,0) 45%,
          rgba(0,0,0,.22)
        ),
        url(${heroImage})
        `,
      }}
    >
      <div className="garage-hero-content">
        <h1>THE GARAGE</h1>
      </div>

      <button
        className="scroll-arrow"
        onClick={() =>
          document
            .getElementById("inventory")
            ?.scrollIntoView({ behavior: "smooth" })
        }
        aria-label="Scroll to inventory"
      >
        ⌄
      </button>
    </section>
  );
}