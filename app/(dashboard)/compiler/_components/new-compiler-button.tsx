"use client";

import { Code } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { cn } from "@/lib/utils";

type NewCompilerButtonProps = {
    orgId: string;
    disabled?: boolean;
};

export const NewCompilerButton = ({ orgId, disabled }: NewCompilerButtonProps) => {
    const router = useRouter();
    const { mutate, pending } = useApiMutation(api.compiler.create);

    const onClick = () => {
        mutate({
            orgId,
            title: "Untitled Compiler",
        })
            .then((id) => {
                toast.success("Compiler created.");
                router.push(`/compiler/${id}`);
            })
            .catch(() => toast.error("Failed to create compiler."));
    };

    return (
        <button
            disabled={pending || disabled}
            aria-disabled={pending || disabled}
            onClick={onClick}
            className={cn(
                "col-span-1 aspect-[100/127] bg-blue-600 rounded-lg flex flex-col items-center justify-center py-6",
                pending || disabled
                    ? "opacity-75 cursor-not-allowed"
                    : "hover:bg-blue-800",
            )}
        >
            <div aria-hidden />
            <Code className="h-12 w-12 text-white stroke-1" />
            <p className="text-sm text-white font-light">New compiler</p>
        </button>
    );
};
