interface Source {
  name: string;
  url: string;
  region: string;
}

interface SourceLinksProps {
  sources: Source[];
  isStale?: boolean;
}

export function SourceLinks({ sources, isStale }: SourceLinksProps) {
  return (
    <div className={`rounded-xl border p-4 ${isStale ? "border-accent bg-accent/5" : "border-card-border bg-card-bg"}`}>
      {isStale && (
        <p className="mb-3 text-sm font-medium text-accent">
          Event data may be outdated. Browse sources directly:
        </p>
      )}
      <h3 className="mb-2 text-sm font-semibold text-foreground">
        Event Sources
      </h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {sources.map((source) => (
          <a
            key={source.name}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-category-pill px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent-light hover:text-white"
          >
            {source.name}
          </a>
        ))}
      </div>
    </div>
  );
}
