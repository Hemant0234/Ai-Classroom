"use client";

import { connectionIdToColor } from "@/lib/utils";
import { useOthers, useSelf } from "@/liveblocks.config";
import { Cpu, PhoneCall } from "lucide-react";

import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { useAiPanel } from "@/store/use-ai-panel";
import { useConnectModal } from "@/store/use-connect-modal";
import { UserAvatar } from "./user-avatar";

const MAX_SHOWN_OTHER_USERS = 2;

export const Participants = () => {
  const users = useOthers();
  const currentUser = useSelf();
  const hasMoreUsers = users.length > MAX_SHOWN_OTHER_USERS;

  const connectModal = useConnectModal();
  const aiModal = useAiPanel();

  return (
    <div className="absolute h-14 top-4 right-6 bg-white/40 backdrop-blur-md rounded-full p-3 flex items-center shadow-md border border-white/50 gap-x-4">
      <div className="flex items-center gap-x-2 border-r border-neutral-300/50 pr-4">
        <Hint label="AI Assistant" side="bottom" sideOffset={10}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => aiModal.toggle()}
            className="hover:bg-white/50 bg-white/20 text-neutral-700 transition-all rounded-full h-8 w-8"
          >
            <Cpu className="h-4 w-4" />
          </Button>
        </Hint>
        <Hint label="Connect Video Call" side="bottom" sideOffset={10}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => connectModal.onOpen()}
            className="hover:bg-emerald-500/30 bg-emerald-500/10 text-emerald-700 transition-all rounded-full h-8 w-8"
          >
            <PhoneCall className="h-4 w-4" />
          </Button>
        </Hint>
      </div>

      <div className="flex gap-x-2">
        {users.slice(0, MAX_SHOWN_OTHER_USERS).map(({ connectionId, info }) => {
          return (
            <UserAvatar
              borderColor={connectionIdToColor(connectionId)}
              key={connectionId}
              src={info?.picture}
              name={info?.name}
              fallback={info?.name?.[0] || "T"}
            />
          );
        })}

        {currentUser && (
          <UserAvatar
            borderColor={connectionIdToColor(currentUser.connectionId)}
            src={currentUser.info?.picture}
            name={`${currentUser.info?.name} (You)`}
            fallback={currentUser.info?.name?.[0]}
          />
        )}

        {hasMoreUsers && (
          <UserAvatar
            name={`${users.length - MAX_SHOWN_OTHER_USERS} more`}
            fallback={`+${users.length - MAX_SHOWN_OTHER_USERS}`}
          />
        )}
      </div>
    </div>
  );
};

export const ParticipantsSkeleton = () => {
  return (
    <div
      className="w-[100px] absolute h-14 top-4 right-6 bg-white rounded-full p-3 flex items-center shadow-md"
      aria-hidden
    />
  );
};
