"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bot, SendHorizonal, Sparkles, RotateCcw } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import RoomCard from "@/features/rooms/components/RoomCard";
import BusinessCard from "@/features/business/components/BusinessCard";
import GigCard from "@/features/gigs/components/GigCard";
import { Room } from "@/features/rooms/types";
import { Business } from "@/features/business/services/business.service";
import { Gig } from "@/features/gigs/types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type Message = {
  role: "user" | "assistant";
  content: string;
  rooms?: Room[];
  businesses?: Business[];
  gigs?: Gig[];
};

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hi! I'm Northstar AI. Ask me anything about rooms, businesses, or anything else.",
};

const SUGGESTIONS = [
  "Find a 2 bedroom apartment in Soweto under R5000",
  "Find me a hair salon in Mamelodi",
  "Is anyone offering gardening work in Umlazi?",
  "Show me highly rated businesses that deliver",
];

// The AI chat UI, shared between the standalone /ai/ask-ai route and the
// "Ask AI" tab embedded in the home page — used to live only inside the
// route's page.tsx, with the home page importing that page module directly
// as a component. Extracted here so both places import a normal feature
// component instead.
export default function AskAIPanel({
  showNavbar = true,
}: {
  showNavbar?: boolean;
}) {
  // Reading the ?q= prefill (set by the "Ask AI" shortcut on the Businesses
  // search bar) needs useSearchParams, which Next requires to sit behind a
  // Suspense boundary — kept here, outside the component that uses it, so
  // callers of <AskAIPanel /> don't need to know about that.
  return (
    <Suspense fallback={null}>
      <AskAIChat showNavbar={showNavbar} />
    </Suspense>
  );
}

function AskAIChat({ showNavbar }: { showNavbar: boolean }) {
  const searchParams = useSearchParams();
  const prefillQuery = searchParams.get("q");

  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Anchored to the newest message itself (not a sentinel after
  // everything) and scrolled with block: "start" — so a reply that comes
  // back with a grid of result cards lands with its own top edge in view,
  // letting the user read down into the cards naturally. Scrolling to a
  // trailing sentinel instead (the previous approach) always jumps past
  // the cards to the very bottom of the message list, which is the
  // "results scroll to the bottom" complaint this replaces.
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const hasStarted = messages.length > 1;

  useEffect(() => {
    if (!hasStarted) return;
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [messages, hasStarted]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMessage: Message = { role: "user", content };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to contact AI");
      }

      const data = await res.json();

      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content:
            data.message ??
            "Sorry, I couldn't generate a response.",
          rooms: data.rooms,
          businesses: data.businesses,
          gigs: data.gigs,
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content:
            "Something went wrong while contacting the AI.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setInput("");
  };

  // Auto-run the prefilled query from ?q= (set by the "Ask AI" shortcut
  // elsewhere in the app) exactly once, so arriving here with a question
  // already typed goes straight to an answer instead of making the user
  // retype it.
  const prefillSentRef = useRef(false);
  useEffect(() => {
    if (!prefillQuery || prefillSentRef.current) return;
    prefillSentRef.current = true;
    sendMessage(prefillQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillQuery]);

  const composer = (
    <div className="flex items-end gap-2 rounded-3xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm transition-all focus-within:border-gray-300 focus-within:shadow-md">
      <textarea
        rows={1}
        value={input}
        placeholder="Message Northstar AI..."
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        }}
        className="max-h-40 flex-1 resize-none border-0 bg-transparent p-0 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-0 sm:text-base"
      />

      <button
        onClick={() => sendMessage()}
        disabled={loading || !input.trim()}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-white transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100"
      >
        <SendHorizonal className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div
      className={`flex flex-col bg-white ${
        showNavbar ? "h-screen overflow-hidden" : "min-h-0 flex-1"
      }`}
    >
      {showNavbar && <Navbar />}

      {!hasStarted ? (
        <div className="flex flex-1 flex-col items-center justify-center px-4 pb-24">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black">
            <Sparkles className="h-6 w-6 text-amber-400" />
          </div>

          <h1 className="mt-5 text-center text-2xl font-semibold text-gray-900 sm:text-3xl">
            What can I help you find?
          </h1>

          <p className="mt-2 text-center text-sm text-gray-500">
            Ask about rooms, local businesses, or anything else.
          </p>

          <div className="mt-8 w-full max-w-2xl">{composer}</div>

          <div
            data-tour="ai-suggestions"
            className="mt-4 flex w-full max-w-2xl flex-wrap justify-center gap-2"
          >
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => sendMessage(suggestion)}
                className="rounded-full border border-gray-200 bg-white px-3.5 py-2 text-xs text-gray-600 transition-colors hover:bg-gray-50 sm:text-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black">
                <Sparkles className="h-4 w-4 text-amber-400" />
              </div>
              <span className="text-sm font-semibold text-gray-800">
                Northstar AI
              </span>
            </div>

            <button
              onClick={resetChat}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              New chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            <div className="mx-auto flex max-w-3xl flex-col gap-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  ref={index === messages.length - 1 ? lastMessageRef : undefined}
                >
                  {message.role === "user" ? (
                    <div className="flex justify-end">
                      <div className="max-w-[85%] rounded-3xl bg-gray-100 px-4 py-2.5 sm:max-w-[75%]">
                        <p className="whitespace-pre-wrap text-sm leading-6 text-gray-800 sm:text-base">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black">
                        <Bot className="h-4 w-4 text-white" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="whitespace-pre-wrap text-sm leading-6 text-gray-800 sm:text-base sm:leading-7">
                          {message.content}
                        </p>

                        {(message.rooms?.length ||
                          message.businesses?.length ||
                          message.gigs?.length) && (
                          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {message.rooms?.map((room) => (
                              <RoomCard key={room.id} room={room} />
                            ))}

                            {message.businesses?.map((business) => (
                              <BusinessCard
                                key={business.id}
                                business={business}
                              />
                            ))}

                            {message.gigs?.map((gig, gigIndex) => (
                              <GigCard
                                key={gig.id}
                                gig={gig}
                                index={gigIndex}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black">
                    <Bot className="h-4 w-4 text-white" />
                  </div>

                  <div className="flex items-center gap-1.5 pt-2">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-300" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-300 delay-100" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-300 delay-200" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 bg-white px-4 py-4 sm:px-6">
            <div className="mx-auto max-w-3xl">
              {composer}

              <p className="mt-2 text-center text-[10px] text-gray-400 sm:text-xs">
                Northstar AI can make mistakes. Please verify important
                information.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
