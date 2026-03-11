export interface NormalizedEvent {
  externalId: string;
  source: string;
  title: string;
  description?: string;
  url: string;
  imageUrl?: string;
  startTime: Date;
  endTime?: Date;
  venueName?: string;
  venueAddress?: string;
  city?: string;
  lat?: number;
  lng?: number;
  tags: string[];
  isFree: boolean;
  price?: string;
}
