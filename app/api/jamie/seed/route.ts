import { NextRequest, NextResponse } from "next/server";
import {
  setTrip,
  setRoster,
  setItinerary,
  setReservations,
  setRooms,
  setFlights,
  setTodos,
  setExpenses,
  setPacklist,
  setEmergency,
  setSurvey,
} from "@/lib/jamie/kv";
import {
  seedTrip,
  seedRoster,
  seedItinerary,
  seedReservations,
  seedRooms,
  seedFlights,
  seedTodos,
  seedExpenses,
  seedPacklist,
  seedEmergency,
  seedSurvey,
} from "@/lib/jamie/seed-data";

// One-shot seed: writes initial Jamie's bach data into Vercel KV.
// Protected by SYNC_SECRET. Idempotent — safe to re-run.
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-sync-secret");
  if (secret !== process.env.SYNC_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await Promise.all([
    setTrip(seedTrip),
    setRoster(seedRoster),
    setItinerary(seedItinerary),
    setReservations(seedReservations),
    setRooms(seedRooms),
    setFlights(seedFlights),
    setTodos(seedTodos),
    setExpenses(seedExpenses),
    setPacklist(seedPacklist),
    setEmergency(seedEmergency),
    setSurvey(seedSurvey),
  ]);

  return NextResponse.json({
    ok: true,
    seeded: [
      "trip",
      "roster",
      "itinerary",
      "reservations",
      "rooms",
      "flights",
      "todos",
      "expenses",
      "packlist",
      "emergency",
      "survey",
    ],
  });
}
