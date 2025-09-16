import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// GET /api/tickets/:id
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> } // params es ahora una Promise
) {
  const { id } = await params; // ✅ Esperar los params como indica Next.js 14+
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

// PATCH para actualizar estado o severidad del ticket
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> } // ⬅️ params ahora es una Promise
) {
  const { id } = await context.params; // ⬅️ Espera la resolución de params
  const body = await req.json();
  const { status, severity } = body;

  const { data, error } = await supabase
    .from("tickets")
    .update({
      ...(status && { status }),
      ...(severity && { severity }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data?.[0], { status: 200 });
}
