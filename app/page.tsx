import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import TicketGrid from "@/components/ticket-grid";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPaginatedTickets } from "@/lib/actions";
import TicketGridClient from "@/components/ticket-grid-client";

// Información de la rifa como un objeto configurable
const raffleConfig = {
  id: "default",
  title: "Gran Rifa Benéfica de un Dron DJI Neo",
  description:
    "Participa en nuestra rifa benéfica y gana un increíble premio mientras apoyas una buena causa. Cada boleto tiene la misma oportunidad de ganar.",
  price: "$20.00",
  date: "10 de Junio",
  imageUrl: "/dji.jpg",
  totalTickets: 1000,
  pageSize: 100,
};

export default async function Home({ searchParams }: { searchParams: any }) {
  const searchParamsValue = await searchParams;
  const page = Number.parseInt(searchParamsValue.page) || 1;

  const initialData = await getPaginatedTickets(
    page,
    raffleConfig.pageSize,
    raffleConfig.id
  );

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Sistema de Rifas</h1>
        <Button asChild>
          <Link href="/admin/login">Área Administrativa</Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <Card className="overflow-hidden">
          <div className="relative w-full h-64">
            <Image
              src={
                raffleConfig.imageUrl || "/placeholder.svg?height=256&width=512"
              }
              alt="Premio de la rifa"
              fill
              className="object-cover"
              priority
            />
          </div>
          <CardHeader>
            <CardTitle>{raffleConfig.title}</CardTitle>
            <CardDescription>
              Precio por boleto: {raffleConfig.price}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{raffleConfig.description}</p>
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Fecha del sorteo:</span>
              <span>{raffleConfig.date}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Boletos Disponibles</CardTitle>
            <CardDescription>
              Visualiza todos los boletos y su estado actual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Cargando boletos...</div>}>
              <TicketGridClient
                initialData={initialData}
                showOwnerInfo={false} // No mostrar información del comprador en la vista pública
              />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
