import { Redis } from "@upstash/redis";
import type {
  Trip,
  Roster,
  Itinerary,
  Reservations,
  Rooms,
  Flights,
  Todos,
  Expenses,
  Packlist,
  Emergency,
  Activity,
  Survey,
  ActivityEntry,
  GuestState,
  AdminState,
} from "./types";

const PREFIX = "jamie";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    throw new Error("Missing KV credentials");
  }
  return new Redis({ url, token });
}

async function getKey<T>(key: string, fallback: T): Promise<T> {
  const redis = getRedis();
  const raw = await redis.get<string>(`${PREFIX}:${key}`);
  if (raw === null || raw === undefined) return fallback;
  if (typeof raw === "object") return raw as T;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function setKey<T>(key: string, value: T): Promise<void> {
  const redis = getRedis();
  await redis.set(`${PREFIX}:${key}`, JSON.stringify(value));
}

// ─── reads ───
export const getTrip = () =>
  getKey<Trip>("trip", {
    bride: "Jamie Schlacter",
    startDate: "2026-07-10",
    endDate: "2026-07-13",
    city: "Newport, RI",
    partySize: 9,
  });

export const getRoster = () => getKey<Roster>("roster", []);
export const getItinerary = () => getKey<Itinerary>("itinerary", []);
export const getReservations = () => getKey<Reservations>("reservations", []);
export const getRooms = () =>
  getKey<Rooms>("rooms", {
    layout: {
      floor1: { full: 1, queenPullout: 2 },
      floor2: { king: 1, bunkTop: 1, bunkBottom: 1 },
      floor3: { queen: 1, queenPullout: 2 },
    },
    assignments: [],
  });
export const getFlights = () => getKey<Flights>("flights", {});
export const getTodos = () => getKey<Todos>("todos", []);
export const getExpenses = () =>
  getKey<Expenses>("expenses", {
    splitwiseUrl: "",
    splitwiseJoined: {},
    prePaid: [],
    estimatedPerPerson: 716.71,
  });
export const getPacklist = () => getKey<Packlist>("packlist", []);
export const getEmergency = () =>
  getKey<Emergency>("emergency", {
    houseAddress: "111 Memorial Blvd W, Newport, RI 02840",
    houseStaffPhone: "(401) 688-7958",
    nearestHospital: {
      name: "Newport Hospital",
      address: "11 Friendship St, Newport, RI 02840",
      phone: "(401) 846-6400",
    },
    planners: [
      { name: "Hannah Schlacter (MOH)", phone: "847-404-8501" },
      { name: "Ellie Schneider (co-planner)", phone: "816-507-9355" },
    ],
  });
export const getActivity = () => getKey<Activity>("activity", []);
export const getSurvey = () => getKey<Survey>("survey", []);
export const getPhotosUrl = () => getKey<string>("photosUrl", "");
export const getGroupChatUrl = () => getKey<string>("groupChatUrl", "");

// ─── writes ───
export const setTrip = (t: Trip) => setKey("trip", t);
export const setRoster = (r: Roster) => setKey("roster", r);
export const setItinerary = (i: Itinerary) => setKey("itinerary", i);
export const setReservations = (r: Reservations) => setKey("reservations", r);
export const setRooms = (r: Rooms) => setKey("rooms", r);
export const setFlights = (f: Flights) => setKey("flights", f);
export const setTodos = (t: Todos) => setKey("todos", t);
export const setExpenses = (e: Expenses) => setKey("expenses", e);
export const setPacklist = (p: Packlist) => setKey("packlist", p);
export const setEmergency = (e: Emergency) => setKey("emergency", e);
export const setSurvey = (s: Survey) => setKey("survey", s);
export const setPhotosUrl = (url: string) => setKey("photosUrl", url);
export const setGroupChatUrl = (url: string) => setKey("groupChatUrl", url);

// ─── activity log (capped at 50) ───
export async function appendActivity(entry: ActivityEntry): Promise<void> {
  const log = await getActivity();
  const updated = [entry, ...log].slice(0, 50);
  await setKey("activity", updated);
}

// ─── bundled fetches ───
export async function getGuestState(): Promise<GuestState> {
  const [
    trip,
    roster,
    itinerary,
    reservations,
    rooms,
    flights,
    expenses,
    packlist,
    photosUrl,
    groupChatUrl,
    emergency,
  ] = await Promise.all([
    getTrip(),
    getRoster(),
    getItinerary(),
    getReservations(),
    getRooms(),
    getFlights(),
    getExpenses(),
    getPacklist(),
    getPhotosUrl(),
    getGroupChatUrl(),
    getEmergency(),
  ]);

  // strip internal notes from guest-visible data
  const stripInternal = <T extends { internalNote?: string }>(
    items: T[]
  ): Omit<T, "internalNote">[] =>
    items.map(({ internalNote: _omit, ...rest }) => rest);

  return {
    trip,
    roster,
    itinerary: stripInternal(itinerary) as Itinerary,
    reservations: stripInternal(reservations),
    rooms,
    flights,
    expenses,
    packlist,
    photosUrl,
    groupChatUrl,
    emergency,
  };
}

export async function getAdminState(): Promise<AdminState> {
  const guest = await getGuestState();
  const [todos, survey, activity, fullItinerary, fullReservations] =
    await Promise.all([
      getTodos(),
      getSurvey(),
      getActivity(),
      getItinerary(),
      getReservations(),
    ]);

  return {
    ...guest,
    itinerary: fullItinerary,
    reservations: fullReservations,
    todos,
    survey,
    activity,
  };
}
