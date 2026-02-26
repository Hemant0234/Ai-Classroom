"use client";

import { useOrganization } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useApiMutation } from "@/hooks/use-api-mutation";

export const EmptyCompilers = () => {
    const router = useRouter();
    const { mutate, pending } = useApiMutation(api.compiler.create);
    const { organization } = useOrganization();

    const onClick = () => {
        if (!organization) return;

        mutate({
            orgId: organization.id,
            title: "Untitled Compiler",
        })
            .then((id) => {
                toast.success("Compiler created.");
                router.push(`/compiler/${id}`);
            })
            .catch(() => toast.error("Failed to create compiler."));
    };
    return (
        <div className="h-full flex flex-col items-center justify-center">
            <Image src="/empty-boards.svg" alt="Empty" height={110} width={110} />
            <h2 className="text-2xl font-semibold mt-6">Create your first compiler.</h2>

            <p className="text-muted-foreground text-sm mt-2">
                Start by creating a compiler for your organization.
            </p>

            <div className="mt-6">
                <Button
                    disabled={pending}
                    aria-disabled={pending}
                    onClick={onClick}
                    size="lg"
                >
                    Create compiler
                </Button>
            </div>
        </div>
    );
};
