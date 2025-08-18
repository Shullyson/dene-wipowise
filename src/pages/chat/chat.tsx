import { ChatInput } from "@/components/custom/chatinput";
import { PreviewMessage } from "@/components/custom/message";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { message } from "@/interfaces/interfaces";
import { Header } from "@/components/custom/header";
import { Overview } from "@/components/custom/overview";
import { ThinkingMessage } from "@/components/custom/message";

export function Chat() {
  const [messages, setMessages] = useState<message[]>([]);
  const [referencesList, setReferencesList] = useState<{ [id: string]: any[] }>({});
  const [question, setQuestion] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function handleSubmit(text?: string) {
    if (isLoading) return;

    const messageText = text || question;
    setIsLoading(true);
    const traceId = uuidv4();
    setMessages(prev => [...prev, { content: messageText, role: "user", id: traceId }]);
    setQuestion("");

    try {
      const response = await fetch("/api/ask-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: messageText,
          history: messages
        })
      });
      if (!response.ok) throw new Error("API error");
      const data = await response.json();
      const assistantId = uuidv4();
      setMessages(prev => [...prev, { content: data.answer || "No response", role: "assistant", id: assistantId }]);
      if (data.references && Array.isArray(data.references)) {
        setReferencesList(prev => ({ ...prev, [assistantId]: data.references }));
      }
    } catch (error) {
      setMessages(prev => [...prev, { content: "Error: " + (error as Error).message, role: "assistant", id: uuidv4() }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-w-0 h-dvh bg-background">
      {/* Custom Header */}
      <div className="w-full flex items-center px-6 py-3 bg-[#E65100] text-white shadow-md">
        <div className="flex items-center h-16 w-16 bg-white rounded-full overflow-hidden mr-4">
          <img src="/log.jpeg" alt="Logo" className="object-contain h-12 w-12 m-auto" />
        </div>
        <span className="text-lg font-semibold">Dennemeyer (Lunch AI)</span>
      </div>
      <Header />
      <div className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4">
        {messages.length === 0 && <Overview />}
        {messages.map((message, index) => {
          // Find the preceding user message for assistant messages
          const userQuery = message.role === "assistant" && index > 0 && messages[index - 1].role === "user"
            ? messages[index - 1].content
            : undefined;
          return (
            <PreviewMessage
              key={message.id}
              message={message}
              references={message.role === "assistant" ? referencesList[message.id] : undefined}
              query={userQuery} // Pass the user’s query
            />
          );
        })}
        {isLoading && <ThinkingMessage />}
        <div className="shrink-0 min-w-[24px] min-h-[24px]"/>
      </div>
      <div className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
        <ChatInput  
          question={question}
          setQuestion={setQuestion}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}