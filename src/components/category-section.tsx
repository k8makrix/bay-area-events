import { EventCard } from "./event-card";

interface Event {
  id: string;
  title: string;
  url: string;
  imageUrl?: string | null;
  startTime: string;
  endTime?: string | null;
  venueName?: string | null;
  city?: string | null;
  category: string;
  tags: string[];
  isFree: boolean;
  price?: string | null;
  relevanceScore: number;
  matchReason: string;
  source: string;
}

interface CategorySectionProps {
  category: string;
  events: Event[];
}

export function CategorySection({ category, events }: CategorySectionProps) {
  if (events.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="mb-4 text-xl font-bold text-foreground">{category}</h2>
      <div className="grid gap-3">
        {events.map((event) => (
          <EventCard key={event.id} {...event} />
        ))}
      </div>
    </section>
  );
}
