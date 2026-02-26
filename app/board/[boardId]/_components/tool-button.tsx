"use client";

import type { LucideIcon } from "lucide-react";

import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";

type ToolButtonProps = {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
};

export const ToolButton = ({
  label,
  icon: Icon,
  onClick,
  isActive,
  isDisabled,
}: ToolButtonProps) => {
  return (
    <Hint label={label} side="top" sideOffset={14}>
      <Button
        disabled={isDisabled}
        aria-disabled={isDisabled}
        onClick={onClick}
        variant={isActive ? "boardActive" : "board"}
        className="px-3 py-2 flex items-center justify-center gap-x-1.5"
      >
        <Icon className="h-4 w-4" />
        <span className="text-xs font-semibold">{label}</span>
      </Button>
    </Hint>
  );
};
