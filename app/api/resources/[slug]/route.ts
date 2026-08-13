import { NextResponse } from "next/server";

import { getAllResources } from "@/lib/content";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const resource = getAllResources().find((item) => item.slug === slug); if (!resource) return NextResponse.json({ error: "Not found" }, { status: 404 }); const extension = resource.format === "markdown" ? "md" : "csv"; return new NextResponse(resource.body, { headers: { "Content-Type": resource.format === "markdown" ? "text/markdown; charset=utf-8" : "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${resource.slug}.${extension}"`, "Cache-Control": "public, max-age=3600" } }); }
