// Babymoon trip data — single source of truth.
// Reconciled against Gmail/Calendar booking confirmations (authoritative) rather
// than the older "V4" Google Doc, which had a few stale entries (e.g. Flora Farms
// listed on Aug 11; the booking confirmation puts it on Aug 12).

export const trip = {
  title: "Babymoon",
  destination: "Cabo San Lucas, Mexico",
  travelers: ["Hannah", "Sam"],
  // Local dates (America/Mazatlan, which matches PDT offset in August).
  startDate: "2026-08-09",
  endDate: "2026-08-15",
  nights: 6,
  timezone: "America/Mazatlan",
  weather: { lat: 22.89, lon: -109.91, label: "Cabo San Lucas" },
  // Real photo of Park Hyatt Cabo del Sol (served from the Cabo del Sol
  // community site; verified to hotlink without referrer protection).
  heroImage:
    "https://cabodelsol.com/wp-content/uploads/2026/07/Park-Hyatt-Cabo-del-Sol1231x692-WebP.webp",
};

export type FlightSeg = {
  label: string;
  airline: string;
  flightNo: string;
  fromCode: string;
  fromCity: string;
  toCode: string;
  toCity: string;
  date: string;
  departTime: string;
  arriveTime: string;
  note?: string;
};

export const flights: FlightSeg[] = [
  {
    label: "Outbound",
    airline: "United",
    flightNo: "UA 1189",
    fromCode: "SFO",
    fromCity: "San Francisco",
    toCode: "SJD",
    toCity: "San José del Cabo",
    date: "2026-08-09",
    departTime: "8:46 AM",
    arriveTime: "12:00 PM",
    note: "Nonstop. Arrive SJD around noon — private transfer meets you at the airport.",
  },
  {
    label: "Return",
    airline: "United",
    flightNo: "UA 1931",
    fromCode: "SJD",
    fromCity: "San José del Cabo",
    toCode: "SFO",
    toCity: "San Francisco",
    date: "2026-08-15",
    departTime: "1:02 PM",
    arriveTime: "4:06 PM",
    note: "Tight morning: 12 PM checkout and SJD is ~35 min away. Arrange early checkout / bag hold and leave the resort by ~9:45 AM.",
  },
];

export const lodging = {
  name: "Park Hyatt Cabo Del Sol",
  confirmation: "46824420",
  checkIn: { date: "2026-08-09", time: "3:00 PM" },
  checkOut: { date: "2026-08-15", time: "12:00 PM" },
  room: "1 King Deluxe Suite · Partial Ocean View",
  roomDetails: "Soaking tub, walk-in shower, private terrace, minibar",
  guest: "Samuel Giddins · 2 adults",
  address: "Carretera Transpeninsular Km 10.3, Cabo Del Sol, Cabo San Lucas, BCS 23455, Mexico",
  phone: "+52 624 124 1234",
  email: "cabph.reservations@hyatt.com",
  mapQuery: "Park Hyatt Cabo Del Sol, Cabo San Lucas",
  dining: [
    { name: "Mesa Madre", desc: "Traditional Mexican" },
    { name: "Silán", desc: "Middle Eastern" },
    { name: "Costamar Beach Club", desc: "Coastal California, beachside" },
    { name: "Dátil Coffee Shop", desc: "Coffee & pastries" },
  ],
};

export const transfer = {
  name: "Private airport transfer",
  provider: "Viator",
  route: "SJD Airport → Park Hyatt Cabo Del Sol",
  date: "2026-08-09",
  pax: "2 adults",
  price: "$74 (paid)",
  bookingRef: "1429428451",
  confirmation: "1811642205",
  note: "One-way, private. Driver meets you after customs at Los Cabos Airport (SJD).",
};

export type Reservation = {
  name: string;
  date: string;
  time: string;
  party?: string;
  confirmation?: string;
  address?: string;
  phone?: string;
  mapQuery?: string;
  note?: string;
  tentative?: boolean;
  conflict?: string;
  kind: "dining" | "activity" | "spa";
};

export const reservations: Reservation[] = [
  {
    name: "Manta by Enrique Olvera",
    date: "2026-08-10",
    time: "6:30 PM",
    party: "2",
    kind: "dining",
    mapQuery: "Manta by Enrique Olvera, The Cape Cabo",
    note: "Arrive before the ~7:15 PM sunset for views of Land's End and the Arch. Request outdoor seating.",
  },
  {
    name: "Couples massage · Suzanne Morel (mobile spa)",
    date: "2026-08-10",
    time: "TBD",
    party: "2",
    kind: "spa",
    tentative: true,
    note: "Inquiry in progress — mobile spa comes to the Park Hyatt. Not yet confirmed; day (Aug 10 or 11) and time still to be locked.",
  },
  {
    name: "Flora Farms",
    date: "2026-08-12",
    time: "11:30 AM",
    party: "2",
    kind: "dining",
    mapQuery: "Flora Farms, San José del Cabo",
    note: "Farm-to-table in San José del Cabo. Uber from the resort.",
    conflict:
      "Overlaps the Cabo taco tasting (12:30 PM) the same day — confirm which one to keep.",
  },
  {
    name: "Cabo San Lucas Downtown Food & Tacos Tasting",
    date: "2026-08-12",
    time: "12:30 PM",
    kind: "activity",
    note: "Walking food tour in downtown Cabo San Lucas.",
    conflict:
      "Overlaps Flora Farms (11:30 AM) the same day — confirm which one to keep.",
  },
  {
    name: "SAGE (Sage Baja)",
    date: "2026-08-13",
    time: "7:30 PM",
    party: "2",
    confirmation: "29068",
    kind: "dining",
    address: "Jose María Morelos #133, Esq. Ignacio Comonfort, 23400 San José del Cabo",
    phone: "624 184 8628",
    mapQuery: "Sage Baja, San José del Cabo",
  },
  {
    name: "Arch & Snorkeling Boat Tour",
    date: "2026-08-14",
    time: "10:00 AM",
    kind: "activity",
    mapQuery: "Cabo San Lucas Marina",
    note: "Boat tour to Los Arcos (Land's End) with snorkeling.",
  },
];

export type DayPlan = { date: string; title: string; subtitle?: string };

export const days: DayPlan[] = [
  { date: "2026-08-09", title: "Arrival", subtitle: "Fly in, transfer, check in" },
  { date: "2026-08-10", title: "Resort day", subtitle: "Beach, pool & Manta dinner" },
  { date: "2026-08-11", title: "Open day", subtitle: "Resort, spa or town" },
  { date: "2026-08-12", title: "San José del Cabo", subtitle: "Flora Farms, art walk & shopping" },
  { date: "2026-08-13", title: "Cabo & SAGE", subtitle: "Free day, dinner in San José" },
  { date: "2026-08-14", title: "On the water", subtitle: "Arch & snorkeling tour" },
  { date: "2026-08-15", title: "Departure", subtitle: "Checkout & fly home" },
];

export const dayNotes: Record<string, string[]> = {
  "2026-08-09": ["Evening open — dinner at the resort (Mesa Madre or Costamar)."],
  "2026-08-11": [
    "Nothing booked — pool, beach, or spa day.",
    "Optional: walk the town of Cabo San Lucas (very walkable). Mother Flower for lunch + the pottery shop next door. Sunset Mona Lisa for sunset views.",
  ],
  "2026-08-12": ["San José del Cabo art walk & shopping in the afternoon."],
  "2026-08-13": ["Day open — relax at the resort or explore before dinner."],
  "2026-08-14": ["Final evening — dinner open (Silán at the resort, or back into town)."],
};

export const info = {
  currency: {
    title: "Money",
    lines: [
      "Currency: Mexican Peso (MXN). USD is widely accepted at the resort and tourist spots.",
      "Carry small USD bills for tips. Cards work most places; tell your bank you're traveling.",
    ],
  },
  tipping: {
    title: "Tipping guide",
    rows: [
      ["Private airport driver (>30 min)", "$15–20 / $300–400 MXN"],
      ["Restaurant dinner", "$5–10 / $100–200 MXN"],
      ["Bartender / waiter", "$1 per round"],
      ["Spa", "20% total"],
      ["Pool server", "$5 to start, $5 to end"],
      ["Housekeeping", "$2–5 / day"],
      ["Butler / concierge", "$10–20 / day"],
      ["Porter", "$1 per bag"],
      ["Private tour guide", "$10–25 / $200–500 MXN"],
    ],
  },
  recommendations: {
    title: "If you have time",
    lines: [
      "Sunset Mona Lisa — dinner with the best sunset views over the bay.",
      "Acre — jungle restaurant + treehouse, Uber from the resort.",
      "Town of Cabo San Lucas — walkable; Mother Flower for lunch, pottery shop next door.",
      "Half-day to Todos Santos + El Pescadero — galleries, cafés, slower Baja town vibe.",
    ],
  },
  emergency: {
    title: "Good to have",
    lines: [
      "Emergency (Mexico): 911",
      "Park Hyatt Cabo Del Sol: +52 624 124 1234",
      "Passports required — keep photos saved offline.",
    ],
  },
  packing: {
    title: "Packing checklist",
    items: [
      "Passports + travel docs",
      "Prenatal vitamins & any meds",
      "Reef-safe sunscreen (high SPF)",
      "Sun hats & sunglasses",
      "Swimwear (incl. maternity)",
      "Cover-ups & light layers for AC",
      "Comfortable sandals + one nicer pair",
      "Refillable water bottle",
      "Small USD bills for tips",
      "Phone charger + portable battery",
      "Light dinner outfits (resort-casual)",
      "Aloe / after-sun",
    ],
  },
};
