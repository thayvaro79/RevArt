import "../../styles/ClassicMarketEmbed.css";

export default function ClassicMarketEmbed({ embedUrl }) {
  if (!embedUrl) {
    return (
      <p className="classic-market-unavailable">
        Market data is not currently available for this vehicle.
      </p>
    );
  }

  return (
    <div className="classic-market-embed">
      <div className="classic-market-embed-frame">
        <iframe
          src={embedUrl}
          title="Collector car market data from CLASSIC.COM"
          loading="lazy"
        />
      </div>

      <p className="classic-market-attribution">
        Market data via{" "}
        <a href="https://www.classic.com" target="_blank" rel="noreferrer">
          CLASSIC.COM
        </a>
      </p>
    </div>
  );
}
