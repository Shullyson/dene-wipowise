import { useRef, useState } from "react";
import { Textarea } from "../ui/textarea";
import { cx } from 'classix';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// Extend the Window interface for SpeechRecognition types
declare global {
    interface Window {
        SpeechRecognition?: any;
        webkitSpeechRecognition?: any;
    }
}

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

interface ChatInputProps {
    question: string;
    setQuestion: (question: string) => void;
    onSubmit: (text?: string) => void;
    isLoading: boolean;
}

const suggestedActions = [
    {
        title: 'What makes a patent claim strong and enforceable?',
        action: 'What makes a patent claim strong and enforceable?',
      
    },
    {
        title: 'How can I manage a patent portfolio to boost my business?',
        action: 'How can I manage a patent portfolio to boost my business?',
       
    },
];

const AnimatedBars = () => (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
        {[...Array(5)].map((_, i) => (
            <motion.rect
                key={i}
                x={3 + i * 4}
                y={10}
                width="2"
                height={6}
                rx="1"
                fill="#4F46E5"
                animate={{
                    height: [6, 12, 6],
                    transition: {
                        duration: 0.5,
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: i * 0.1,
                    },
                }}
            />
        ))}
    </svg>
);

export const ChatInput = ({ question, setQuestion, onSubmit, isLoading }: ChatInputProps) => {
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [listening, setListening] = useState(false);
    const [language, setLanguage] = useState("en-US");
    const [isTyping, setIsTyping] = useState(false);
    const recognitionRef = useRef<any>(null);

    const handleMicClick = async () => {
        if (!SpeechRecognition) {
            toast.error("Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.");
            return;
        }

        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            if (listening) {
                recognitionRef.current.stop();
                setListening(false);
                return;
            }
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = language;
            recognitionRef.current.onresult = (event: any) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    interimTranscript += event.results[i][0].transcript;
                }
                setQuestion(question ? question + " " + interimTranscript : interimTranscript);
                if (event.results[event.results.length - 1].isFinal) {
                    setListening(false);
                    onSubmit(interimTranscript);
                }
            };
            recognitionRef.current.onend = () => setListening(false);
            recognitionRef.current.onerror = (event: any) => {
                setListening(false);
                if (event.error === "no-speech") {
                    toast.error("No speech detected. Please try again.");
                } else if (event.error === "audio-capture") {
                    toast.error("Microphone access denied or unavailable.");
                } else {
                    toast.error("An error occurred during speech recognition.");
                }
            };
            recognitionRef.current.start();
            setListening(true);
        } catch (error) {
            toast.error("Microphone access denied. Please allow microphone permissions.");
            setListening(false);
        }
    };

    return (
        <div className="relative w-full flex flex-col gap-2 sm:gap-4">
            <AnimatePresence>
                {showSuggestions && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                        {suggestedActions.slice(0, 2).map((suggestedAction, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ delay: 0.05 * index }}
                                key={index}
                            >
                                <button
                                    type="button"
                                    onClick={() => {
                                        const text = suggestedAction.action;
                                        onSubmit(text);
                                        setShowSuggestions(false);
                                    }}
                                    className="text-left border rounded-xl px-2 py-2 sm:px-4 sm:py-3.5 text-sm sm:text-base flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start min-h-[44px]"
                                >
                                    <span className="font-medium">{suggestedAction.title}</span>
                                    <span className="text-muted-foreground">
                                        {/* Removed label as requested */}
                                    </span>
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>
            <input
                type="file"
                className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
                multiple
                tabIndex={-1}
                placeholder="Upload file"
                title="Upload file"
            />
            <div className="relative w-full">
                <Textarea
                    placeholder="Ask me about WIPO Patent Drafting Manual..."
                    className={cx(
                        'min-h-[32px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-xl text-sm sm:text-base bg-muted shadow-sm border dark:border-zinc-600 focus:ring-2 focus:ring-indigo-500',
                        isTyping && !listening ? 'pr-12' : 'pr-24'
                    )}
                    value={question}
                    onChange={(e) => {
                        setQuestion(e.target.value);
                        setIsTyping(e.target.value.length > 0);
                    }}
                    onBlur={() => {
                        if (!question) setIsTyping(false);
                    }}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            if (isLoading) {
                                toast.error('Please wait for the model to finish its response!');
                            } else {
                                setShowSuggestions(false);
                                onSubmit();
                            }
                        }
                    }}
                    rows={3}
                    autoFocus
                />
                <div className="absolute bottom-2 right-2 flex gap-1">
                    <AnimatePresence>
                        {!isTyping && !listening && (
                            <motion.select
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="p-1 text-sm bg-muted rounded-md min-w-[100px]"
                                aria-label="Select language for speech recognition"
                            >
                                <option value="en-US">English (US)</option>
                                 <option value="de-DE">German</option>
                                <option value="fr-FR">French</option>
                            </motion.select>
                        )}
                    </AnimatePresence>
                    <AnimatePresence>
                        {(!isTyping || listening) && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                                type="button"
                                onClick={handleMicClick}
                                disabled={!SpeechRecognition}
                                className={`rounded-full p-2 transition-colors flex items-center justify-center min-w-[44px] min-h-[44px] ${
    listening
      ? "bg-green-600"
      : !SpeechRecognition
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-[#E65100]"
  }`}
                                aria-label={listening ? "Stop voice input" : "Start voice input"}
                            >
                                {listening ? <AnimatedBars /> : (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2C10.8954 2 10 2.89543 10 4V12C10 13.1046 10.8954 14 12 14C13.1046 14 14 13.1046 14 12V4C14 2.89543 13.1046 2 12 2Z" fill="#fff"/>
                                        <path d="M17 9V12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12V9" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                )}
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};