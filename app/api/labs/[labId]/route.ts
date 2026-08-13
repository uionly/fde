import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getAllLabs } from "@/lib/content";
import { getLabProgress } from "@/lib/labs/store";

export async function GET(_: Request, { params }: { params: Promise<{ labId: string }> }) {
  const session = await auth(); if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { labId } = await params; if (!getAllLabs().some((lab) => lab.id === labId)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ progress: await getLabProgress(session.user.id, labId) });
}
