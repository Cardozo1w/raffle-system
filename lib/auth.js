"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// Credenciales hardcodeadas (en producción, usar variables de entorno)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"

// Función para iniciar sesión
export async function login(username, password) {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Crear una cookie de sesión más robusta
    const cookieStore = cookies()

    // Generar un token simple (en producción, usar algo más seguro como JWT)
    const sessionToken = Buffer.from(`${username}:${Date.now()}`).toString("base64")

    cookieStore.set("auth_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 días (aumentado de 1 día)
      path: "/",
      sameSite: "lax", // Ayuda con problemas de CSRF mientras permite navegación normal
    })

    return true
  }

  return false
}

// Función para verificar autenticación
export async function checkAuth() {
  const cookieStore = cookies()
  const session = cookieStore.get("auth_session")

  // Si hay una cookie de sesión, consideramos al usuario autenticado
  // En un sistema real, verificaríamos la validez del token
  return !!session?.value
}

// Función para cerrar sesión
export async function logout() {
  const cookieStore = cookies()
  cookieStore.delete("auth_session")

  redirect("/admin/login")
}

// Middleware para proteger rutas
export async function withAuth(callback) {
  const isAuthenticated = await checkAuth()

  if (!isAuthenticated) {
    return redirect("/admin/login")
  }

  return callback()
}
