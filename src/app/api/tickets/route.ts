import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// Obtener todos los tickets con datos del usuario
export async function GET() {
  const { data, error } = await supabase
    .from("tickets")
    .select(`
      id,
      user_id,
      description,
      category,
      suggested_reply,
      suggestion,
      severity,
      status,
      created_at,
      updated_at,
      users ( name, email )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formatted = data.map((ticket) => {
    const user = Array.isArray(ticket.users) ? ticket.users[0] : ticket.users;
    const { users, ...rest } = ticket; // descartamos 'users'
    return {
      ...rest,
      name: user?.name ?? null,
      email: user?.email ?? null,
    };
  });

  return NextResponse.json(formatted);
}

// Crear un nuevo ticket
export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, description } = body;

  const { data, error } = await supabase
    .from("tickets")
    .insert([{ name, email, description }])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data?.[0], { status: 201 });
}