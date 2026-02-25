import { auth, currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";
import { ConvexHttpClient } from "convex/browser";
import { NextResponse, type NextRequest } from "next/server";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(req: NextRequest) {
  // ✅ IMPORTANT: await auth()
  const { userId, orgId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const { room } = await req.json();

  const board = await convex.query(api.board.get, { id: room });

  if (!board) {
    return new NextResponse("Board not found", { status: 404 });
  }

  if (board.orgId && board.orgId !== orgId) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const session = liveblocks.prepareSession(userId, {
    userInfo: {
      name: user.firstName || "Teammate",
      picture: user.imageUrl,
    },
  });

  session.allow(room, session.FULL_ACCESS);

  const { status, body } = await session.authorize();

  return new Response(body, { status });
}