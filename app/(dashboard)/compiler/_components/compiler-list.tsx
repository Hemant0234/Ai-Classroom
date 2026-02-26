"use client";

import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";

import { EmptyCompilers } from "./empty-compilers";
import { EmptySearch } from "../../_components/empty-search";
import { NewCompilerButton } from "./new-compiler-button";
import { CompilerCard } from "./compiler-card";

type CompilerListProps = {
    orgId: string;
    query: {
        search?: string;
    };
};

export const CompilerList = ({ orgId, query }: CompilerListProps) => {
    const data = useQuery(api.compilers.get, { orgId, ...query });

    if (data === undefined)
        return (
            <div>
                <h2 className="text-3xl">Compilers</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 mt-8 pb-10">
                    <NewCompilerButton orgId={orgId} disabled />
                    <CompilerCard.Skeleton />
                    <CompilerCard.Skeleton />
                    <CompilerCard.Skeleton />
                    <CompilerCard.Skeleton />
                </div>
            </div>
        );

    if (!data?.length && query.search) {
        return <EmptySearch />;
    }

    if (!data?.length) {
        return <EmptyCompilers />;
    }

    return (
        <div>
            <h2 className="text-3xl">Compilers</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 mt-8 pb-10">
                <NewCompilerButton orgId={orgId} />
                {data?.map((compiler) => (
                    <CompilerCard
                        key={compiler._id}
                        id={compiler._id}
                        title={compiler.title}
                        imageUrl={compiler.imageUrl}
                        authorId={compiler.authorId}
                        authorName={compiler.authorName}
                        createdAt={compiler._creationTime}
                        orgId={compiler.orgId}
                    />
                ))}
            </div>
        </div>
    );
};
