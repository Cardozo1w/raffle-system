import { NextResponse } from "next/server"
import { deleteTicket } from "@/lib/actions"
import { checkAuth } from "@/lib/auth"

export async function POST(request) {
  // Verificar autenticación
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    await deleteTicket(formData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar venta de boleto:", error)
    return NextResponse.json({ error: error.message || "Error al eliminar venta de boleto" }, { status: 500 })
  }
}
