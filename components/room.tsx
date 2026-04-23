"use client";

import { LiveMap, LiveList, LiveObject } from "@liveblocks/client";
import { ClientSideSuspense } from "@liveblocks/react";
import type { ReactNode } from "react";

import { RoomProvider } from "@/liveblocks.config";
import { Layer } from "@/types/canvas";
import {
  DEFAULT_COMPILER_LANGUAGE,
  getLanguageConfig,
} from "@/lib/compiler";

type RoomProps = {
  children: React.ReactNode;
  roomId: string;
  fallback: NonNullable<ReactNode> | null;
};

export const Room = ({ children, roomId, fallback }: RoomProps) => {
  const defaultCompilerConfig = getLanguageConfig(DEFAULT_COMPILER_LANGUAGE);

  return (
    <RoomProvider
      id={roomId}
      initialPresence={{
        cursor: null,
        selection: [],
        pencilDraft: null,
        penColor: null,
      }}
      initialStorage={{
        layers: new LiveMap<string, LiveObject<Layer>>(),
        layerIds: new LiveList(),
        compilerCode: defaultCompilerConfig.template,
        compilerLanguage: defaultCompilerConfig.id,
        compilerInput: "",
        compilerOutput: "Run the code to see shared output here.",
        compilerStatus: "idle",
        compilerLastRunAt: 0,
        compilerLastRunBy: "",
      }}
    >
      <ClientSideSuspense fallback={fallback}>
        {() => children}
      </ClientSideSuspense>
    </RoomProvider>
  );
};
