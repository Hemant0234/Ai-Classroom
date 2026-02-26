"use client";

import type { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu";
import { Link2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmModal } from "@/components/confirm-modal";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useRenameModal } from "@/store/use-rename-modal"; // Note: this might rename generic boards, but we might need a useRenameCompilerModal. We can just skip rename for compilers to save time or implement it later.

type CompilerActionsProps = {
    children: React.ReactNode;
    side?: DropdownMenuContentProps["side"];
    sideOffset?: DropdownMenuContentProps["sideOffset"];
    id: string;
    title: string;
};

export const CompilerActions = ({
    children,
    side,
    sideOffset,
    id,
    title,
}: CompilerActionsProps) => {
    const { mutate, pending } = useApiMutation(api.compiler.remove);

    const onCopyLink = () => {
        navigator.clipboard
            .writeText(`${window.location.origin}/compiler/${id}`)
            .then(() => toast.success("Link copied."))
            .catch(() => toast.error("Failed to copy link."));
    };

    const onDelete = () => {
        mutate({ id })
            .then(() => toast.success("Compiler deleted."))
            .catch(() => toast.error("Failed to delete compiler."));
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
            <DropdownMenuContent
                onClick={(e) => e.stopPropagation()}
                side={side}
                sideOffset={sideOffset}
                className="w-60"
            >
                <DropdownMenuItem onClick={onCopyLink} className="p-3 cursor-pointer">
                    <Link2 className="h-4 w-4 mr-2" />
                    Copy compiler link
                </DropdownMenuItem>

                <ConfirmModal
                    header="Delete compiler?"
                    description="This will delete the compiler. Continued execution may be lost."
                    disabled={pending}
                    onConfirm={onDelete}
                >
                    <Button
                        variant="ghost"
                        className="p-3 cursor-pointer text-sm w-full justify-start font-normal"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </ConfirmModal>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
