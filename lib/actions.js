"use server"
import { redirect } from "next/navigation"
import { supabase } from "./supabase"
import { checkAuth } from "./auth"

// Obtener todos los boletos
export async function getTickets(raffleId = "default") {
  try {
    const { data, error } = await supabase.from("tickets").select("*").order("number", { ascending: true })

    if (error) {
      console.error("Error al obtener boletos:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error al obtener boletos:", error)
    return []
  }
}

// Obtener boletos paginados
export async function getPaginatedTickets(page = 1, pageSize = 100, raffleId = "default") {
  try {
    // Calcular el rango para la paginación
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    // Obtener el total de boletos para calcular el número total de páginas
    const { count } = await supabase.from("tickets").select("*", { count: "exact", head: true })

    // Obtener los boletos de la página actual
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .order("number", { ascending: true })
      .range(from, to)

    if (error) {
      console.error("Error al obtener boletos paginados:", error)
      return { tickets: [], pagination: { total: 0, pageSize, currentPage: page, totalPages: 0 } }
    }

    return {
      tickets: data || [],
      pagination: {
        total: count || 0,
        pageSize,
        currentPage: page,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    }
  } catch (error) {
    console.error("Error al obtener boletos paginados:", error)
    return { tickets: [], pagination: { total: 0, pageSize, currentPage: page, totalPages: 0 } }
  }
}

// Vender un boleto (protegido)
// Tipa el argumento como un objeto plano
export async function sellTicket({
  name,
  phone,
  status = "No pagado",
  ticketNumbers = [],
}) {
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) {
    redirect("/admin/login")
  }

  if (!ticketNumbers.length || !name || !phone) {
    throw new Error("Todos los campos son requeridos")
  }

  try {
    for (const ticketNumber of ticketNumbers) {
      const { data: existingTicket, error: checkError } = await supabase
        .from("tickets")
        .select("sold")
        .eq("number", ticketNumber)
        .single()

      if (checkError) {
        console.error("Error al verificar boleto:", checkError)
        throw new Error("Error al verificar disponibilidad del boleto")
      }

      if (existingTicket && existingTicket.sold) {
        throw new Error(`El boleto ${ticketNumber} ya ha sido vendido`)
      }

      const { error: updateError } = await supabase
        .from("tickets")
        .update({
          sold: true,
          name,
          phone,
          status,
          sold_date: new Date().toISOString(),
        })
        .eq("number", ticketNumber)

      if (updateError) {
        console.error("Error al vender boleto:", updateError)
        throw new Error("Error al vender el boleto")
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error al vender boleto:", error)
    throw error
  }
}


// Eliminar venta de boleto (protegido)
export async function deleteTicket(formData) {
  // Verificar autenticación
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) {
    redirect("/admin/login")
  }

  const ticketNumber = Number.parseInt(formData.get("ticketNumber"))

  if (!ticketNumber) {
    throw new Error("Número de boleto requerido")
  }

  try {
    // Actualizar el boleto como no vendido
    const { error } = await supabase
      .from("tickets")
      .update({
        sold: false,
        name: null,
        phone: null,
        sold_date: null,
      })
      .eq("number", ticketNumber)

    if (error) {
      console.error("Error al eliminar venta de boleto:", error)
      throw new Error("Error al eliminar la venta del boleto")
    }

    return { success: true }
  } catch (error) {
    console.error("Error al eliminar venta de boleto:", error)
    throw error
  }
}

// Inicializar boletos si no existen
export async function initializeTickets(totalTickets = 1000) {
  // Verificar autenticación
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) {
    redirect("/admin/login")
  }

  try {
    // Verificar si ya existen boletos
    const { count, error: countError } = await supabase.from("tickets").select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Error al verificar boletos existentes:", countError)
      throw new Error("Error al verificar boletos existentes")
    }

    // Si ya hay boletos, no hacer nada
    if (count && count > 0) {
      return { success: true, message: "Los boletos ya están inicializados" }
    }

    // Crear boletos en lotes para evitar límites de API
    const batchSize = 100
    const batches = Math.ceil(totalTickets / batchSize)

    for (let batch = 0; batch < batches; batch++) {
      const start = batch * batchSize + 1
      const end = Math.min((batch + 1) * batchSize, totalTickets)

      const tickets = []
      for (let i = start; i <= end; i++) {
        tickets.push({
          number: i,
          sold: false,
        })
      }

      const { error: insertError } = await supabase.from("tickets").insert(tickets)

      if (insertError) {
        console.error(`Error al insertar lote ${batch + 1}:`, insertError)
        throw new Error(`Error al inicializar boletos (lote ${batch + 1})`)
      }
    }

    return { success: true, message: `Se inicializaron ${totalTickets} boletos correctamente` }
  } catch (error) {
    console.error("Error al inicializar boletos:", error)
    throw error
  }
}
