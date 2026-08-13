import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getProgressForUser } from "@/lib/progress/store";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const records = await getProgressForUser(session.user.id);
  return NextResponse.json({ records });
}
