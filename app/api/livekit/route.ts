import { AccessToken } from "livekit-server-sdk";
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const room = searchParams.get("room");

    if (!room) {
        return NextResponse.json(
            { error: "Missing 'room' query parameter" },
            { status: 400 }
        );
    }

    const clerkAuth = await auth();
    const user = await currentUser();

    if (!clerkAuth.userId) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
        return NextResponse.json(
            { error: "LiveKit server credentials not configured" },
            { status: 500 }
        );
    }

    // Determine participant details
    // If user's name is null, we use Guest
    const participantName = user?.fullName || `Guest (${clerkAuth.userId.slice(-4)})`;
    const participantIdentity = clerkAuth.userId;

    const at = new AccessToken(apiKey, apiSecret, {
        identity: participantIdentity,
        name: participantName,
    });

    at.addGrant({ roomJoin: true, room: room });

    return NextResponse.json({ token: await at.toJwt() });
}
