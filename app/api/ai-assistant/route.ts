import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { Liveblocks } from "@liveblocks/node";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const liveblocks = new Liveblocks({
    secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(req: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json();
        const { boardId, message, role, boardState } = body;

        if (!boardId || !message || !role) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        if (role !== "student" && role !== "teacher") {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }

        let boardTitle = "General Dashboard";
        let extractedShapes = boardState || "";

        if (boardId && boardId !== "dashboard") {
            try {
                const board = await convex.query(api.board.get, { id: boardId as any });
                if (!board) {
                    return NextResponse.json({ error: "Board not found" }, { status: 404 });
                }
                boardTitle = board.title;
            } catch (err) {
                return NextResponse.json({ error: "Board not found" }, { status: 404 });
            }

            if (!extractedShapes) {
                try {
                    const storage = await liveblocks.getStorageDocument(boardId, "json");
                    const shapes = storage.shapes || storage.layers || {};

                    extractedShapes = Object.values(shapes)
                        .map((shape: any) => {
                            const type = shape?.type;
                            const text = shape?.value || shape?.text || "";
                            const pos = shape?.x !== undefined ? `(x: ${shape.x}, y: ${shape.y})` : "";
                            if (text) {
                                return `[Type: ${type}, Pos: ${pos}] Text: ${text}`;
                            }
                            return "";
                        })
                        .filter(Boolean)
                        .join("\n");
                } catch (error) {
                    // Fallback if unable to get storage document
                }
            }
        }

        let roleInstructions = "";
        if (role === "student") {
            roleInstructions = `
- Explain simply.
- Give examples.
- Provide structured answers (5-mark / 7-mark if academic topic).
`;
        } else if (role === "teacher") {
            roleInstructions = `
- Suggest quiz questions.
- Suggest improvements.
- Suggest flowchart ideas.
- Detect topic from board automatically.
`;
        }

        const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{ text: `You are an intelligent real-time classroom assistant integrated inside a collaborative whiteboard application. ${roleInstructions}` }]
                },
                contents: [
                    {
                        role: "user",
                        parts: [{ text: `Board Title: ${boardTitle}\nCurrent User Role: ${role}\n\nWhiteboard Content (Text from Shapes):\n${extractedShapes || "(No text on board)"}\n\nUser Question:\n${message}` }]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                }
            }),
        });

        if (!aiResponse.ok) {
            const errorMsg = await aiResponse.text();
            console.error("Gemini error:", errorMsg);
            return NextResponse.json(
                { error: "Failed to fetch AI response", details: errorMsg },
                { status: 502 }
            );
        }

        const data = await aiResponse.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        return NextResponse.json({ reply });
    } catch (error) {
        console.error("AI Assistant Route Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
