import { useEffect, useState } from "react";
import { getPageHero } from "../../api/pageHeroesApi";

export default function PageHero({
  pageKey,
  title,
  fallbackImage = "/images/garage_header.png",
}) {
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHero() {
      try {
        const data = await getPageHero(pageKey, 1);
        setHero(data);
      } catch (error) {
        console.error(`Failed to load ${pageKey} hero:`, error);
      } finally {
        setLoading(false);
      }
    }

    loadHero();
  }, [pageKey]);

  if (loading) return null;

  const heroImage = hero?.imageUrl || fallbackImage;

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
        <h1>{title}</h1>
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
