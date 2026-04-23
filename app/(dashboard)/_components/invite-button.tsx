"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const InviteButton = () => {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      onClick={() => router.push("/organization")}
    >
      <Plus className="h-4 w-4 mr-2" />
      Invite members
    </Button>
  );
};
