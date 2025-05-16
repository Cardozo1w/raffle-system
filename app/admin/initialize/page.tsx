import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { checkAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import InitializeTicketsForm from "./initialize-form"

export default async function InitializeTicketsPage() {
  // Verificar autenticación
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) {
    redirect("/admin/login")
  }

  return (
    <main className="container max-w-2xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Inicializar Boletos</h1>
        <Button asChild variant="outline">
          <Link href="/admin">Volver al panel</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Crear Boletos en Supabase</CardTitle>
          <CardDescription>
            Esta acción inicializará los boletos en la base de datos. Solo es necesario hacerlo una vez.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Cargando...</div>}>
            <InitializeTicketsForm />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  )
}
