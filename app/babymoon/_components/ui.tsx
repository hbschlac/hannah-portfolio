import Link from "next/link";

export function eventIcon(kind: string): string {
  switch (kind) {
    case "flight":
      return "✈️";
    case "transfer":
      return "🚙";
    case "lodging":
      return "🏨";
    case "dining":
      return "🍽️";
    case "activity":
      return "🐠";
    case "spa":
      return "💆";
    default:
      return "•";
  }
}

export function mapsHref(query: string): string {
  return `https://maps.google.com/?q=${encodeURIComponent(query)}`;
}

export function MapLink({ query, label }: { query: string; label?: string }) {
  return (
    <a className="btn ghost" href={mapsHref(query)} target="_blank" rel="noreferrer">
      📍 {label || "Open in Maps"}
    </a>
  );
}

export function SectionHead({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="section-head">
      <h1 className="serif">{title}</h1>
      {subtitle ? <p>{subtitle}</p> : null}
    </div>
  );
}

export { Link };
