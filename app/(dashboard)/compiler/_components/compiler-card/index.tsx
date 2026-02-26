"use client";

import { useAuth } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import { CompilerActions } from "@/components/compiler-actions";

import { Footer } from "./footer";
import { Overlay } from "./overlay";

type CompilerCardProps = {
    id: string;
    title: string;
    imageUrl: string;
    authorId: string;
    authorName: string;
    createdAt: number;
    orgId: string;
};

export const CompilerCard = ({
    id,
    title,
    imageUrl,
    authorId,
    authorName,
    createdAt,
    orgId,
}: CompilerCardProps) => {
    const { userId } = useAuth();

    const authorLabel = userId === authorId ? "You" : authorName;
    const createdAtLabel = formatDistanceToNow(createdAt, {
        addSuffix: true,
    });

    return (
        <Link href={`/compiler/${id}`}>
            <div className="group aspect-[100/127] border rounded-lg flex flex-col justify-between overflow-hidden">
                <div className="relative flex-1 bg-neutral-900 border-b border-neutral-200">
                    <div className="absolute inset-0 z-0 bg-neutral-900 opacity-80" />
                    <Image src={imageUrl} alt={title} fill className="object-cover opacity-30" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-white/60 font-mono text-sm group-hover:text-white transition-colors duration-300">
                            {`</>`}
                        </p>
                    </div>
                    <Overlay />
                    <CompilerActions id={id} title={title} side="right">
                        <button className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-2 outline-none">
                            <MoreHorizontal className="text-white opacity-75 hover:opacity-100 transition-opacity" />
                        </button>
                    </CompilerActions>
                </div>

                <Footer
                    title={title}
                    authorLabel={authorLabel}
                    createdAtLabel={createdAtLabel}
                />
            </div>
        </Link>
    );
};

CompilerCard.Skeleton = function CompilerCardSkeleton() {
    return (
        <div className="aspect-[100/127] rounded-lg flex overflow-hidden">
            <Skeleton className="h-full w-full" />
        </div>
    );
};
