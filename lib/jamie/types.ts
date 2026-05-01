// Jamie's Bach 2026 — KV data model

export type AttendeeId =
  | "jamie"
  | "hannah"
  | "ellie"
  | "erica"
  | "mahip"
  | "gwenna"
  | "zoe"
  | "daniella"
  | "abbey";

export type Trip = {
  bride: string;
  startDate: string; // "2026-07-10"
  endDate: string; // "2026-07-13"
  city: string;
  partySize: number;
};

export type Attendee = {
  id: AttendeeId;
  name: string;
  role: "bride" | "moh" | "co-planner" | "guest";
  city: string;
  phone: string;
  email?: string;
  instagram?: string;
  photoUrl: string;
  colorToken: "coral" | "tangerine" | "butter" | "lime" | "lavender" | "navySoft";
  shirtSize?: "XS" | "S" | "M" | "L" | "XL";
  pantsSize?: string;
  dietary?: string[];
  drinkLevel?: string;
  emergencyContact?: { name: string; phone: string };
};

export type Roster = Attendee[];

export type ItineraryEvent = {
  id: string;
  day: "fri" | "sat" | "sun";
  date: string;
  startTime: string; // "19:00"
  endTime?: string;
  title: string;
  emoji: string;
  location: { name: string; address: string; mapsUrl: string };
  dressCode?: string;
  bring?: string[];
  publicNote?: string;
  internalNote?: string;
  reservationId?: string;
  status: "planned" | "confirmed" | "happening" | "done";
};

export type Itinerary = ItineraryEvent[];

export type Reservation = {
  id: string;
  itineraryId?: string;
  name: string;
  emoji: string;
  when: string;
  partySize: number;
  owner: "hannah" | "ellie";
  status: "tbd" | "pending" | "booked" | "confirmed" | "paid";
  confirmationNumber?: string;
  totalCost?: number;
  deposit?: { amount: number; dueDate: string; paid: boolean };
  contact?: { phone?: string; email?: string; url?: string };
  internalNote?: string;
  guestNote?: string;
};

export type Reservations = Reservation[];

export type RoomAssignment = {
  floor: 1 | 2 | 3;
  bed: string;
  attendeeId: AttendeeId | null;
};

export type Rooms = {
  layout: {
    floor1: { full: number; queenPullout: number };
    floor2: { king: number; bunkTop: number; bunkBottom: number };
    floor3: { queen: number; queenPullout: number };
  };
  assignments: RoomAssignment[];
};

export type Flight = {
  attendeeId: AttendeeId;
  status: "tbd" | "pending" | "booked";
  airline?: string;
  flightNumber?: string;
  originAirport?: string;
  arrivalAirport?: string;
  arrivalDate?: string;
  arrivalTime?: string;
  notes?: string;
};

export type Flights = Record<string, Flight>;

export type Todo = {
  id: string;
  title: string;
  owner: "hannah" | "ellie" | "shared";
  dueDate?: string;
  done: boolean;
  notes?: string;
  createdAt: string;
};

export type Todos = Todo[];

export type PrePaidExpense = {
  label: string;
  amount: number;
  paidBy: AttendeeId;
  loggedToSplitwise: boolean;
};

export type Expenses = {
  splitwiseUrl: string;
  splitwiseJoined: Record<string, boolean>;
  prePaid: PrePaidExpense[];
  estimatedPerPerson: number;
};

export type PackCategory = {
  name: string;
  emoji: string;
  items: { id: string; label: string }[];
};

export type Packlist = PackCategory[];

export type Emergency = {
  houseAddress: string;
  houseStaffPhone: string;
  nearestHospital: { name: string; address: string; phone: string };
  planners: { name: string; phone: string }[];
};

export type ActivityEntry = {
  who: "hannah" | "ellie";
  what: string;
  when: string;
};

export type Activity = ActivityEntry[];

export type SurveyResponse = {
  attendeeId: AttendeeId;
  timestamp: string;
  shirtSize: string;
  sweatshirtSize: string;
  pantsSize: string;
  foodAllergies: string;
  dietary: string;
  otherMedical: string;
  beenToNewport: string;
  skipOrCantDo: string;
  drinkLevel: string;
  roommatePref: string;
  emergencyContact: string;
  notes?: string;
};

export type Survey = SurveyResponse[];

// Bundled state shapes for API responses
export type GuestState = {
  trip: Trip;
  roster: Roster;
  itinerary: Itinerary;
  rooms: Rooms;
  flights: Flights;
  expenses: Expenses;
  packlist: Packlist;
  photosUrl: string;
  groupChatUrl: string;
  emergency: Emergency;
  // Itinerary stripped of internalNote, reservations stripped of internalNote
  reservations: Omit<Reservation, "internalNote">[];
};

export type AdminState = GuestState & {
  reservations: Reservation[]; // with internal notes
  todos: Todos;
  survey: Survey;
  activity: Activity;
};
