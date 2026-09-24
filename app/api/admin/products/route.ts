import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdminRequest(req))) return unauthorized();

  const body = await req.json();

  if (!body.slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("products")
    .insert({
      title: body.title,
      slug: body.slug,
      description: body.description ?? null,
      price: body.price,
      image_url: body.image_url ?? null,
      category: body.category,
      sizes: body.sizes ?? [],
      stock: body.stock ?? 0,
      in_stock: body.in_stock ?? true,
      is_new: body.is_new ?? false,
    })
    .select()
    .single();

  if (error) {
    // Postgres unique_violation on the slug index — give a specific,
    // actionable message instead of a raw constraint-name dump.
    const message =
      error.code === "23505"
        ? "That slug is already in use by another product — try a different one."
        : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  if (!(await verifyAdminRequest(req))) return unauthorized();

  const body = await req.json();
  const { id, ...fields } = body;
  if (!id) return NextResponse.json({ error: "Missing product id" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("products")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    const message =
      error.code === "23505"
        ? "That slug is already in use by another product — try a different one."
        : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  if (!(await verifyAdminRequest(req))) return unauthorized();

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing product id" }, { status: 400 });

  const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
