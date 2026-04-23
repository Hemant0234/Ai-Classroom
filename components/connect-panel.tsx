"use client";

import {
  ConnectionState,
  ControlBar,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useLocalParticipant,
  useTracks,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import {
  Loader2,
  Maximize2,
  Minimize2,
  PictureInPicture2,
  Video,
  X,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Rnd, type RndResizeCallback } from "react-rnd";

import { useConnectModal } from "@/store/use-connect-modal";

type PanelRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const PANEL_MARGIN = 16;

const getViewport = () => {
  if (typeof window === "undefined") {
    return { width: 1280, height: 800 };
  }

  return {
    width: document.documentElement.clientWidth || window.innerWidth,
    height: document.documentElement.clientHeight || window.innerHeight,
  };
};

const getDefaultPanelRect = (): PanelRect => {
  const viewport = getViewport();
  const width = Math.min(460, Math.max(340, viewport.width - 32));
  const height = Math.min(680, Math.max(520, viewport.height - 48));

  return {
    width,
    height,
    x: Math.max(PANEL_MARGIN, viewport.width - width - PANEL_MARGIN),
    y: Math.max(PANEL_MARGIN, viewport.height - height - PANEL_MARGIN),
  };
};

const getMaximizedPanelRect = (): PanelRect => {
  const viewport = getViewport();

  return {
    x: PANEL_MARGIN,
    y: PANEL_MARGIN,
    width: Math.max(320, viewport.width - PANEL_MARGIN * 2),
    height: Math.max(320, viewport.height - PANEL_MARGIN * 2),
  };
};

const getMinimizedPanelRect = (): PanelRect => {
  const viewport = getViewport();
  const width = Math.min(360, Math.max(280, viewport.width - 24));
  const height = 78;

  return {
    width,
    height,
    x: Math.max(12, viewport.width - width - 12),
    y: Math.max(12, viewport.height - height - 12),
  };
};

const getTrackKey = (identity: string, source: Track.Source, sid?: string) =>
  `${identity}-${source}-${sid ?? "placeholder"}`;

const CallStage = ({ roomId }: { roomId: string }) => {
  const tracks = useTracks([
    { source: Track.Source.ScreenShare, withPlaceholder: false },
    { source: Track.Source.Camera, withPlaceholder: true },
  ]);
  const { localParticipant } = useLocalParticipant();

  const localIdentity = localParticipant.identity;
  const localCameraTrack = tracks.find(
    (track) =>
      track.participant.identity === localIdentity &&
      track.source === Track.Source.Camera
  );
  const remoteTracks = tracks.filter(
    (track) => track.participant.identity !== localIdentity
  );
  const primaryTrack =
    remoteTracks.find((track) => track.source === Track.Source.ScreenShare) ??
    remoteTracks.find((track) => track.source === Track.Source.Camera) ??
    localCameraTrack;
  const thumbnailTracks = remoteTracks
    .filter(
      (track) =>
        track !== primaryTrack && track.source !== Track.Source.ScreenShare
    )
    .slice(0, 3);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,#1f3d73,transparent_38%),linear-gradient(180deg,#101725_0%,#06080f_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        {primaryTrack ? (
          <ParticipantTile
            trackRef={primaryTrack}
            className="call-stage-tile h-full w-full"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center">
            <div className="max-w-xs space-y-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <Video className="h-7 w-7 text-sky-300" />
              </div>
              <div>
                <p className="text-base font-semibold text-white">
                  Ready to start the call
                </p>
                <p className="mt-1 text-sm text-white/65">
                  Joiners will appear here in a cleaner picture-in-picture
                  layout.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute left-4 top-4 right-4 flex items-start justify-between gap-3">
          <div className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 backdrop-blur-md">
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">
              Room
            </p>
            <p className="mt-1 text-sm font-semibold text-white">{roomId}</p>
          </div>

          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 backdrop-blur-md">
            <ConnectionState className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200" />
          </div>
        </div>

        {localCameraTrack && primaryTrack?.participant.identity !== localIdentity && (
          <div className="absolute bottom-4 right-4 h-28 w-40 overflow-hidden rounded-2xl border border-white/15 bg-black/40 shadow-2xl backdrop-blur-md">
            <ParticipantTile
              trackRef={localCameraTrack}
              className="call-stage-tile h-full w-full"
            />
            <div className="pointer-events-none absolute left-2 right-2 top-2 flex items-center justify-between">
              <span className="rounded-full bg-black/50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/85">
                You
              </span>
              <PictureInPicture2 className="h-3.5 w-3.5 text-white/70" />
            </div>
          </div>
        )}

        {thumbnailTracks.length > 0 && (
          <div className="absolute bottom-4 left-4 flex max-w-[calc(100%-12rem)] gap-3 overflow-x-auto pr-2">
            {thumbnailTracks.map((track) => (
              <div
                key={getTrackKey(
                  track.participant.identity,
                  track.source,
                  track.publication?.trackSid
                )}
                className="h-20 w-28 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/35 shadow-lg backdrop-blur-md"
              >
                <ParticipantTile
                  trackRef={track}
                  className="call-stage-tile h-full w-full"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/5 p-2 backdrop-blur-xl">
        <ControlBar
          variation="minimal"
          controls={{
            chat: false,
            settings: false,
            leave: true,
            microphone: true,
            camera: true,
            screenShare: true,
          }}
          className="pip-control-bar"
        />
      </div>
    </div>
  );
};

export const ConnectPanel = () => {
  const { isOpen, onClose } = useConnectModal();
  const params = useParams<{ boardId?: string }>();

  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [panelRect, setPanelRect] = useState<PanelRect>(getDefaultPanelRect);

  const roomId = params?.boardId || "general-dashboard";
  const originalRoomIdRef = useRef<string | null>(null);
  const lastExpandedRectRef = useRef<PanelRect>(getDefaultPanelRect());

  useEffect(() => {
    if (!isOpen) return;

    if (!originalRoomIdRef.current) {
      originalRoomIdRef.current = roomId;
    }

    const activeRoomId = originalRoomIdRef.current;
    let ignore = false;

    const fetchToken = async () => {
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
        if (!ignore) {
          setError(e.message);
        }
      }
    };

    fetchToken();

    return () => {
      ignore = true;
    };
  }, [isOpen, roomId, token]);

  useEffect(() => {
    if (!isOpen) {
      originalRoomIdRef.current = null;
      setToken("");
      setError("");
      setIsMaximized(false);
      setIsMinimized(false);
      const defaultRect = getDefaultPanelRect();
      lastExpandedRectRef.current = defaultRect;
      setPanelRect(defaultRect);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return;

    const handleResize = () => {
      if (isMaximized) {
        setPanelRect(getMaximizedPanelRect());
        return;
      }

      if (isMinimized) {
        setPanelRect(getMinimizedPanelRect());
        return;
      }

      const viewport = getViewport();
      const nextRect = {
        ...lastExpandedRectRef.current,
        x: Math.min(
          lastExpandedRectRef.current.x,
          viewport.width - lastExpandedRectRef.current.width - PANEL_MARGIN
        ),
        y: Math.min(
          lastExpandedRectRef.current.y,
          viewport.height - lastExpandedRectRef.current.height - PANEL_MARGIN
        ),
      };

      lastExpandedRectRef.current = nextRect;
      setPanelRect(nextRect);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isMaximized, isMinimized, isOpen]);

  if (!isOpen) return null;

  const handleToggleMaximize = () => {
    if (isMinimized) {
      setIsMinimized(false);
    }

    if (isMaximized) {
      setIsMaximized(false);
      setPanelRect(lastExpandedRectRef.current);
      return;
    }

    lastExpandedRectRef.current = panelRect;
    setIsMaximized(true);
    setPanelRect(getMaximizedPanelRect());
  };

  const handleToggleMinimize = () => {
    if (isMinimized) {
      setIsMinimized(false);
      setPanelRect(lastExpandedRectRef.current);
      return;
    }

    if (!isMaximized) {
      lastExpandedRectRef.current = panelRect;
    }

    setIsMaximized(false);
    setIsMinimized(true);
    setPanelRect(getMinimizedPanelRect());
  };

  const handleDragStop = (_e: unknown, data: { x: number; y: number }) => {
    const nextRect = { ...panelRect, x: data.x, y: data.y };
    setPanelRect(nextRect);

    if (!isMaximized && !isMinimized) {
      lastExpandedRectRef.current = nextRect;
    }
  };

  const handleResizeStop: RndResizeCallback = (
    _e,
    _direction,
    ref,
    _delta,
    position
  ) => {
    const nextRect = {
      x: position.x,
      y: position.y,
      width: parseInt(ref.style.width, 10),
      height: parseInt(ref.style.height, 10),
    };

    setPanelRect(nextRect);

    if (!isMaximized && !isMinimized) {
      lastExpandedRectRef.current = nextRect;
    }
  };

  return (
    <Rnd
      size={{ width: panelRect.width, height: panelRect.height }}
      position={{ x: panelRect.x, y: panelRect.y }}
      minWidth={isMinimized ? 280 : 340}
      minHeight={isMinimized ? 78 : 520}
      bounds="window"
      dragHandleClassName="drag-handle"
      disableDragging={isMaximized}
      enableResizing={!isMaximized && !isMinimized}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      className={`fixed z-[9999] overflow-hidden rounded-[28px] border border-white/50 bg-[rgba(9,13,24,0.88)] text-white shadow-[0_24px_80px_rgba(7,10,20,0.35)] backdrop-blur-2xl ${
        isMinimized ? "ring-1 ring-black/5" : ""
      }`}
      style={{ position: "fixed" }}
    >
      {isMinimized ? (
        <div className="drag-handle flex h-full items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300">
              <PictureInPicture2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                Native Video Call
              </p>
              <p className="truncate text-xs text-white/55">
                {originalRoomIdRef.current || roomId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMinimize}
              className="rounded-full border border-white/10 bg-white/10 p-2 text-white/75 transition hover:bg-white/15 hover:text-white"
              title="Restore call window"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/10 p-2 text-white/75 transition hover:bg-red-500/15 hover:text-red-200"
              title="Leave & close meeting panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <div className="drag-handle flex items-center justify-between gap-4 border-b border-white/10 bg-white/5 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300">
                <Video className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  Native Video Call
                </p>
                <p className="truncate text-xs text-white/55">
                  Floating collaboration window
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleMinimize}
                className="rounded-full border border-white/10 bg-white/10 p-2 text-white/75 transition hover:bg-white/15 hover:text-white"
                title="Minimize to picture-in-picture"
              >
                <PictureInPicture2 className="h-4 w-4" />
              </button>
              <button
                onClick={handleToggleMaximize}
                className="rounded-full border border-white/10 bg-white/10 p-2 text-white/75 transition hover:bg-white/15 hover:text-white"
                title={isMaximized ? "Restore window" : "Maximize window"}
              >
                {isMaximized ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={onClose}
                className="rounded-full border border-white/10 bg-white/10 p-2 text-white/75 transition hover:bg-red-500/15 hover:text-red-200"
                title="Leave & close meeting panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="pip-livekit relative flex min-h-0 flex-1 flex-col bg-[linear-gradient(180deg,#0b1120_0%,#090d18_100%)]">
            {!token && !error && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[rgba(7,10,20,0.84)] text-white/70 backdrop-blur-md">
                <Loader2 className="h-7 w-7 animate-spin text-sky-300" />
                <div className="text-center">
                  <p className="text-sm font-semibold text-white">
                    Connecting to secure room
                  </p>
                  <p className="mt-1 text-xs text-white/55">
                    Setting up your PiP call experience...
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 z-10 flex items-center justify-center p-6 text-center">
                <div className="max-w-sm rounded-3xl border border-red-400/20 bg-red-500/10 p-5 text-sm text-red-100 backdrop-blur-xl">
                  Error connecting: {error}. Check LiveKit environment
                  variables.
                </div>
              </div>
            )}

            {token && (
              <LiveKitRoom
                video={true}
                audio={true}
                token={token}
                serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
                data-lk-theme="default"
                className="flex min-h-0 flex-1 flex-col"
                style={{ display: "flex", flexDirection: "column", flex: 1 }}
                onDisconnected={onClose}
              >
                <CallStage roomId={originalRoomIdRef.current || roomId} />
                <RoomAudioRenderer />
              </LiveKitRoom>
            )}
          </div>
        </div>
      )}
    </Rnd>
  );
};
