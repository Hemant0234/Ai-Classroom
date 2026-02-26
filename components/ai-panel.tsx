"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Bot, Loader2, Send, X, Paperclip, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Rnd } from "react-rnd";
import { CopyToClipboard } from "react-copy-to-clipboard";

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

const CodeRenderer = ({ className, children, ...props }: any) => {
    const [copied, setCopied] = useState(false);
    const match = /language-(\w+)/.exec(className || "");
    const codeString = String(children).replace(/\n$/, "");

    const handleCopy = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (match) {
        return (
            <div className="relative group rounded-md bg-[#1e1e1e] overflow-hidden my-3">
                <div className="flex items-center justify-between px-3 py-1.5 bg-[#2d2d2d] text-xs text-neutral-300 border-b border-neutral-700">
                    <span className="font-medium lowercase">{match[1]}</span>
                    <CopyToClipboard text={codeString} onCopy={handleCopy}>
                        <button className="flex items-center gap-x-1 hover:text-white transition">
                            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copied ? "Copied" : "Copy"}</span>
                        </button>
                    </CopyToClipboard>
                </div>
                <div className="p-3 overflow-x-auto text-[13px] leading-relaxed text-blue-100 font-mono">
                    <code className={className} {...props}>
                        {children}
                    </code>
                </div>
            </div>
        );
    }

    return (
        <code className="bg-neutral-200/50 text-neutral-800 px-1.5 py-0.5 rounded-md text-[13px] font-mono" {...props}>
            {children}
        </code>
    );
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
                height: 600,
            }}
            minWidth={340}
            minHeight={450}
            bounds="window"
            dragHandleClassName="ai-drag-handle"
            className="fixed bg-white/95 backdrop-blur-md text-neutral-900 shadow-xl rounded-xl border border-neutral-200/50 z-[9999]"
            style={{ position: "fixed" }}
        >
            {/* Conditionally subscribe if inside a board page, creating a lightweight RoomProvider explicitly for the subscriber to avoid crashes in root layout */}
            {boardId && (
                <Room roomId={boardId} fallback={null}>
                    <BoardStateSubscriber onUpdate={handleUpdateSnapshot} />
                </Room>
            )}

            <div className="flex flex-col w-full h-full overflow-hidden">
                <div className="flex justify-between items-center p-3 border-b border-neutral-100 bg-white/50 backdrop-blur-md ai-drag-handle cursor-move w-full shrink-0">
                    <div className="flex justify-between items-center w-full pointer-events-none">
                        <div className="flex items-center gap-x-2">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-md">
                                <Bot className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold">AI Assistant</h2>
                                <div className="flex bg-neutral-100 p-1 rounded-md mt-1 pointer-events-auto">
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
                            className="text-neutral-400 hover:text-neutral-600 transition pointer-events-auto"
                            title="Close AI panel"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 flex flex-col gap-y-3 min-h-0 bg-neutral-50/50">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {msg.role === "bot" && (
                                <div className="shrink-0 p-1.5 mr-2 bg-blue-50 text-blue-600 rounded-md h-fit">
                                    <Bot className="h-4 w-4" />
                                </div>
                            )}
                            <div
                                className={`max-w-[85%] p-3 rounded-xl text-sm shadow-sm ${msg.role === "user" ? "bg-blue-600 text-white rounded-br-sm" : "bg-white border border-neutral-100 text-neutral-800 rounded-bl-sm"}`}
                            >
                                {msg.role === "user" ? (
                                    msg.text
                                ) : (
                                    <div className="prose prose-sm max-w-none prose-neutral [&>p]:last:mb-0 [&>p]:first:mt-0">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                code: CodeRenderer
                                            }}
                                        >
                                            {msg.text}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start w-full">
                            <div className="shrink-0 p-1.5 mr-2 bg-blue-50 text-blue-600 rounded-md h-fit">
                                <Bot className="h-4 w-4" />
                            </div>
                            <div className="bg-white border border-neutral-100 shadow-sm p-3 rounded-xl rounded-bl-sm">
                                <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="shrink-0 p-3 bg-white border-t border-neutral-100 flex flex-col gap-y-3 relative z-10 w-full">
                    {showSuggestions ? (
                        <div>
                            <p className="text-xs text-neutral-500 font-medium mb-2">Smart Actions:</p>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => handleSmartFeature("Summarize board")}
                                    className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 px-3 py-1.5 rounded-full transition whitespace-nowrap"
                                >
                                    Summarize board
                                </button>
                                <button
                                    onClick={() => handleSmartFeature("What was just taught?")}
                                    className="text-xs bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 px-3 py-1.5 rounded-full transition whitespace-nowrap"
                                >
                                    What was just taught?
                                </button>
                                <button
                                    onClick={() => {
                                        handleSmartFeature("Would you like a quick revision summary?");
                                        setShowSuggestions(false);
                                    }}
                                    className="text-xs bg-green-50 hover:bg-green-100 text-green-600 border border-green-200 px-3 py-1.5 rounded-full transition whitespace-nowrap"
                                >
                                    Revision summary
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p className="text-xs text-neutral-400 font-medium mb-1.5">Commands:</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleSmartFeature("Summarize board")}
                                    className="text-[11px] bg-neutral-100 hover:bg-neutral-200 text-neutral-600 px-2 py-1.5 rounded transition font-medium"
                                >
                                    Summarize
                                </button>
                                <button
                                    onClick={() => handleSmartFeature("What was just taught?")}
                                    className="text-[11px] bg-neutral-100 hover:bg-neutral-200 text-neutral-600 px-2 py-1.5 rounded transition font-medium"
                                >
                                    Recent topic
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-y-2 relative">
                        {image && (
                            <div className="relative self-start mt-1 mb-1">
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
                                className="p-2 text-neutral-500 hover:bg-neutral-100 hover:text-blue-600 rounded-lg transition shrink-0"
                                title="Upload Context Image"
                            >
                                <Paperclip className="h-5 w-5" />
                            </button>
                            <input
                                type="text"
                                placeholder="Ask me anything... (Paste screenshots here)"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") sendMessage(input);
                                }}
                                onPaste={(e) => {
                                    const items = e.clipboardData?.items;
                                    if (!items) return;

                                    for (let i = 0; i < items.length; i++) {
                                        if (items[i].type.indexOf("image") !== -1) {
                                            const file = items[i].getAsFile();
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setImage(reader.result as string);
                                                };
                                                reader.readAsDataURL(file);
                                                e.preventDefault(); // Stop pasting image text/data into the input
                                            }
                                            break;
                                        }
                                    }
                                }}
                                className="flex-1 w-full p-2.5 text-sm bg-neutral-100 border-none text-neutral-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition placeholder:text-neutral-500"
                            />
                            <button
                                onClick={() => sendMessage(input)}
                                disabled={!input.trim() || isLoading}
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white p-2.5 rounded-lg transition shrink-0"
                            >
                                <Send className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Rnd>
    );
};
