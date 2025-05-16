import { NextResponse } from "next/server"
import { getPaginatedTickets } from "@/lib/actions"

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get("page") || "1")
  const pageSize = Number(searchParams.get("pageSize") || "100")
  const raffleId = searchParams.get("raffleId") || "default"

  try {
    const data = await getPaginatedTickets(page, pageSize, raffleId)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error al obtener boletos:", error)
    return NextResponse.json({ error: "Error al obtener boletos" }, { status: 500 })
  }
}
