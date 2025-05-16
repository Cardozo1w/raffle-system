// app/api/tickets/[number]/status/route.ts
import { supabase } from "@/lib/supabase" // ajusta esta importación a tu proyecto

export async function PATCH(request: { json: () => PromiseLike<{ status: any }> | { status: any } }, { params }: any) {
  const { status } = await request.json()
  const number = parseInt(params.number)

  const { error } = await supabase
    .from("tickets")
    .update({ status })
    .eq("number", number)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ success: true }))
}
