"use client";

import { useMutation, useStorage } from "@/liveblocks.config";
import { LiveMap, LiveList, LiveObject } from "@liveblocks/client";
import { useEffect, useState } from "react";
import { Participants } from "../../../board/[boardId]/_components/participants";

type CompilerCanvasProps = {
    boardId: string;
};

export const CompilerCanvas = ({ boardId }: CompilerCanvasProps) => {
    const code = useStorage((root) => root.compilerCode) || "";

    const updateCode = useMutation(({ storage }, newCode: string) => {
        storage.set("compilerCode", newCode);
    }, []);

    return (
        <div className="relative h-full w-full flex flex-col items-center justify-center bg-zinc-900 text-white p-4">
            <Participants />
            <h1 className="text-3xl font-mono mb-4 text-blue-400">Compiler Environment</h1>
            <p className="text-zinc-400 mb-8 max-w-xl text-center">
                This environment is synced in real-time. Start writing code or configure your compiler execution environment here.
            </p>
            <div className="w-full h-[600px] max-w-5xl bg-zinc-950 border border-zinc-700/50 rounded-lg p-4 font-mono shadow-2xl overflow-auto flex flex-col">
                <textarea
                    className="w-full h-full bg-transparent outline-none resize-none font-mono text-zinc-300"
                    placeholder="function helloWorld() { ... }"
                    spellCheck={false}
                    value={code}
                    onChange={(e) => updateCode(e.target.value)}
                />
            </div>
        </div>
    );
};
