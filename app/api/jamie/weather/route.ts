import { NextResponse } from "next/server";
import { fetchNewportWeather } from "@/lib/jamie/weather";
import { getTrip } from "@/lib/jamie/kv";

export async function GET() {
  const trip = await getTrip();
  const weather = await fetchNewportWeather(trip.startDate, trip.endDate);
  return NextResponse.json(weather);
}
