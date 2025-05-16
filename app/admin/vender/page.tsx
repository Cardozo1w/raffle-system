import { Suspense } from "react"
import Link from "next/link"
import { checkAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import SellTicketForm from "@/components/sell-ticket-form"
import { redirect } from "next/navigation"

export default async function SellTicketPage() {
  // Verificar autenticación
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) {
    redirect("/admin/login")
  }

  return (
    <main className="container max-w-2xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Vender Boleto</h1>
        <Button asChild variant="outline">
          <Link href="/admin">Volver al panel</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registrar Venta de Boleto</CardTitle>
          <CardDescription>Selecciona un boleto disponible y completa los datos del comprador</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Cargando formulario...</div>}>
            <SellTicketForm />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  )
}
