"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Bot, Loader2, Send, X, Paperclip } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Rnd } from "react-rnd";

import { useStorage } from "@/liveblocks.config";
import { useAiPanel } from "@/store/use-ai-panel";
import { Room } from "@/components/room";

type Message = {
    id: string;
    role: "user" | "bot";
    text: string;
};

// Isolated component to subscribe to storage without re-rendering the chat panel
const BoardStateSubscriber = ({
    onUpdate,
}: {
    onUpdate: (val: any) => void;
}) => {
    const layers = useStorage((root) => root.layers);

    useEffect(() => {
        if (layers) {
            // Convert LiveMap or Map to a readable structure
            const extracted = Array.from(layers.entries()).map(([key, layer]: [string, any]) => {
                const text = layer.value || layer.text || "";
                if (text) {
                    return `[Type: ${layer.type}, Pos: (x: ${layer.x}, y: ${layer.y})] Text: ${text}`;
                }
                return "";
            }).filter(Boolean).join("\n");
            onUpdate(extracted);
        }
    }, [layers, onUpdate]);

    return null;
};

export const AiPanel = () => {
    const params = useParams<{ boardId?: string }>();
    const boardId = params?.boardId || "";
    const { isOpen, onClose } = useAiPanel();

    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "bot",
            text: "Hello! I am your AI Teaching Assistant. How can I help you?",
        },
    ]);
    const [image, setImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [role, setRole] = useState<"student" | "teacher">("student");
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const boardSnapshotRef = useRef<string>("");

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const handleUpdateSnapshot = useCallback((val: string) => {
        // If the snapshot significantly changes, we could show a suggestion
        // Phase 4: Auto suggestion system
        if (
            val.length > boardSnapshotRef.current.length + 50 &&
            !showSuggestions
        ) {
            setShowSuggestions(true);
        }
        boardSnapshotRef.current = val;
    }, [showSuggestions]);

    const sendMessage = async (messageText: string) => {
        if (!messageText.trim()) return;

        const userMessage: Message = {
            id: Math.random().toString(),
            role: "user",
            text: messageText,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);
        setShowSuggestions(false);

        try {
            const payload: any = {
                boardId: boardId || "dashboard",
                message: messageText,
                role,
                boardState: boardSnapshotRef.current,
            };

            if (image) {
                payload.image = image;
            }

            const response = await fetch("/api/ai-assistant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            setImage(null);

            if (!response.ok) {
                let errorMsg = "Failed to fetch";
                try {
                    const errData = await response.json();
                    if (errData.error) errorMsg = errData.error + (errData.details ? `: ${errData.details}` : "");
                } catch (e) { }
                throw new Error(errorMsg);
            }

            const data = await response.json();
            setMessages((prev) => [
                ...prev,
                { id: Math.random().toString(), role: "bot", text: data.reply },
            ]);
        } catch (error: any) {
            setMessages((prev) => [
                ...prev,
                {
                    id: Math.random().toString(),
                    role: "bot",
                    text: `Error: ${error.message || "Sorry, I encountered an error answering your request."}`,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSmartFeature = (query: string) => {
        sendMessage(query);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    if (!isOpen) return null;

    return (
        <Rnd
            default={{
                x: typeof window !== 'undefined' ? window.innerWidth - 420 : 0,
                y: 80,
                width: 384,
                height: 500,
            }}
            minWidth={300}
            minHeight={350}
            bounds="window"
            dragHandleClassName="ai-drag-handle"
            className="fixed bg-white/80 backdrop-blur-md text-neutral-900 shadow-xl rounded-xl border border-neutral-200/50 z-[9999] flex flex-col overflow-hidden"
            style={{ position: "fixed" }}
        >
            {/* Conditionally subscribe if inside a board page, creating a lightweight RoomProvider explicitly for the subscriber to avoid crashes in root layout */}
            {boardId && (
                <Room roomId={boardId} fallback={null}>
                    <BoardStateSubscriber onUpdate={handleUpdateSnapshot} />
                </Room>
            )}

            <div className="flex justify-between items-center p-3 border-b border-neutral-100 bg-white/50 backdrop-blur-md ai-drag-handle cursor-move w-full">
                <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-x-2">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-md">
                            <Bot className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold">AI Assistant</h2>
                            <div className="flex bg-neutral-100 p-1 rounded-md mt-1">
                                <button
                                    onClick={() => setRole("student")}
                                    className={`text-xs px-2 py-1 rounded-md transition ${role === "student" ? "bg-white shadow-sm font-semibold" : "text-neutral-500"}`}
                                >
                                    Student
                                </button>
                                <button
                                    onClick={() => setRole("teacher")}
                                    className={`text-xs px-2 py-1 rounded-md transition ${role === "teacher" ? "bg-white shadow-sm font-semibold" : "text-neutral-500"}`}
                                >
                                    Teacher
                                </button>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-neutral-400 hover:text-neutral-600 transition"
                        title="Close AI panel"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[400px] py-4 flex flex-col gap-y-3 scrollbar-thin scrollbar-thumb-neutral-200">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[85%] p-3 rounded-lg text-sm ${msg.role === "user" ? "bg-blue-600 text-white rounded-br-sm" : "bg-neutral-100 text-neutral-800 rounded-bl-sm"}`}
                        >
                            {msg.role === "user" ? (
                                msg.text
                            ) : (
                                <div className="prose prose-sm max-w-none prose-neutral">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                    >
                                        {msg.text}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-neutral-100 p-3 rounded-lg rounded-bl-sm">
                            <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {showSuggestions && (
                <div className="mb-3">
                    <p className="text-xs text-neutral-500 font-medium mb-2">Smart Actions:</p>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleSmartFeature("Summarize board")}
                            className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 px-3 py-1.5 rounded-full transition"
                        >
                            Summarize board
                        </button>
                        <button
                            onClick={() => handleSmartFeature("What was just taught?")}
                            className="text-xs bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 px-3 py-1.5 rounded-full transition"
                        >
                            What was just taught?
                        </button>
                        <button
                            onClick={() => {
                                handleSmartFeature("Would you like a quick revision summary?");
                                setShowSuggestions(false);
                            }}
                            className="text-xs bg-green-50 hover:bg-green-100 text-green-600 border border-green-200 px-3 py-1.5 rounded-full transition"
                        >
                            Revision summary
                        </button>
                    </div>
                </div>
            )}

            {!showSuggestions && (
                <div className="mb-3">
                    <p className="text-xs text-neutral-400 font-medium mb-1">Commands:</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleSmartFeature("Summarize board")}
                            className="text-[10px] bg-neutral-100 hover:bg-neutral-200 text-neutral-600 px-2 py-1 rounded transition"
                        >
                            Summarize
                        </button>
                        <button
                            onClick={() => handleSmartFeature("What was just taught?")}
                            className="text-[10px] bg-neutral-100 hover:bg-neutral-200 text-neutral-600 px-2 py-1 rounded transition"
                        >
                            Recent topic
                        </button>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-y-2 mt-auto relative">
                {image && (
                    <div className="relative self-start mt-2">
                        <img src={image} alt="Upload preview" className="h-16 w-auto rounded-md object-cover border border-neutral-200" />
                        <button
                            onClick={() => setImage(null)}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 transition text-white rounded-full p-1"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}
                <div className="flex items-center gap-x-2">
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        type="button"
                        className="p-2.5 text-neutral-500 hover:bg-neutral-100 rounded-lg transition"
                    >
                        <Paperclip className="h-5 w-5" />
                    </button>
                    <input
                        type="text"
                        placeholder="Ask me anything..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") sendMessage(input);
                        }}
                        className="flex-1 w-full p-2.5 text-sm bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                    />
                    <button
                        onClick={() => sendMessage(input)}
                        disabled={!input.trim() || isLoading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white p-2.5 rounded-lg transition"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </Rnd>
    );
};
