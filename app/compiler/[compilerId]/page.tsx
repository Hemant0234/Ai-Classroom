"use client";

import { CompilerCanvas } from "../../(dashboard)/compiler/_components/compiler-canvas";
import { Loading } from "../../(dashboard)/compiler/_components/loading";
import { Room } from "@/components/room";

type CompilerIdPageProps = {
    params: {
        compilerId: string;
    };
};

const CompilerIdPage = ({ params }: CompilerIdPageProps) => {
    return (
        <Room roomId={params.compilerId} fallback={<Loading />}>
            <CompilerCanvas boardId={params.compilerId} />
        </Room>
    );
};

export default CompilerIdPage;
