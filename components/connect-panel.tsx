"use client";

import { X, Video, Loader2, Maximize2, Minimize2 } from "lucide-react";
import { useConnectModal } from "@/store/use-connect-modal";
import { useParams } from "next/navigation";
import {
    LiveKitRoom,
    VideoConference,
    RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { useEffect, useState, useRef } from "react";
import { Rnd } from "react-rnd";

export const ConnectPanel = () => {
    const { isOpen, onClose } = useConnectModal();
    const params = useParams<{ boardId?: string }>();
    const [token, setToken] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [isMaximized, setIsMaximized] = useState(false);

    const roomId = params?.boardId || "general-dashboard";

    const originalRoomIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        // Lock to the initial room ID where the call was started from so it persists
        if (!originalRoomIdRef.current) {
            originalRoomIdRef.current = roomId;
        }

        const activeRoomId = originalRoomIdRef.current;
        let ignore = false;

        const fetchToken = async () => {
            // ONLY fetch if we don't already have one
            if (token) return;

            try {
                const resp = await fetch(`/api/livekit?room=${activeRoomId}`);
                const data = await resp.json();

                if (!resp.ok) {
                    throw new Error(data.error || "Failed to fetch token");
                }

                if (!ignore) {
                    setToken(data.token);
                }
            } catch (e: any) {
                if (!ignore) setError(e.message);
            }
        };

        fetchToken();

        return () => {
            ignore = true;
        };
    }, [isOpen]); // ONLY run on `isOpen` changes. Don't re-run just because URL changed.

    useEffect(() => {
        if (!isOpen) {
            // reset when fully closed
            originalRoomIdRef.current = null;
            setToken("");
            setIsMaximized(false);
            setError("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <Rnd
            default={{
                x: typeof window !== "undefined" ? window.innerWidth - 520 : 0,
                y: typeof window !== "undefined" ? window.innerHeight - 440 : 0,
                width: 500,
                height: 420,
            }}
            minWidth={480}
            minHeight={400}
            bounds="window"
            dragHandleClassName="drag-handle"
            disableDragging={isMaximized}
            enableResizing={!isMaximized}
            className={`fixed bg-white text-neutral-900 shadow-xl rounded-xl border border-neutral-200 z-[9999] flex flex-col overflow-hidden ${isMaximized ? "!left-4 !top-4 !right-4 !bottom-4 !w-[calc(100vw-2rem)] !h-[calc(100vh-2rem)] !transform-none transition-all duration-300" : ""
                }`}
            style={isMaximized ? { position: "fixed" } : { position: "fixed" }}
        >
            <div className="flex justify-between items-center p-3 border-b border-neutral-100 bg-neutral-50/90 backdrop-blur-md drag-handle cursor-move w-full">
                <div className="flex items-center gap-x-2 text-neutral-500">
                    <Video className="w-5 h-5 text-blue-600" />
                    <h2 className="text-sm font-bold text-neutral-700">Native Video Call</h2>
                </div>
                <div className="flex items-center gap-x-2">
                    <button
                        onClick={() => setIsMaximized(!isMaximized)}
                        className="text-neutral-400 hover:text-neutral-600 transition bg-neutral-100 p-1.5 rounded hover:bg-neutral-200"
                        title={isMaximized ? "Restore window" : "Maximize window"}
                    >
                        {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </button>
                    <button
                        onClick={onClose}
                        className="text-neutral-400 hover:text-red-600 transition bg-neutral-100 p-1.5 rounded hover:bg-red-100"
                        title="Leave & Close meeting panel"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 w-full bg-[#111] relative isolate overflow-y-auto overflow-x-hidden flex flex-col">
                {!token && !error && (
                    <div className="absolute inset-0 flex items-center justify-center flex-col gap-y-2 text-neutral-400">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                        <p className="text-sm">Connecting to secure room...</p>
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-red-500 bg-red-50">
                        <p>Error connecting: {error}. Check LiveKit Environment Variables.</p>
                    </div>
                )}

                {token && (
                    <LiveKitRoom
                        video={true}
                        audio={true}
                        token={token}
                        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
                        data-lk-theme="default"
                        style={{ display: "flex", flexDirection: "column", flex: 1, height: "100%" }}
                        className="min-h-0"
                        onDisconnected={onClose}
                    >
                        <VideoConference />
                        <RoomAudioRenderer />
                    </LiveKitRoom>
                )}
            </div>
        </Rnd>
    );
};
