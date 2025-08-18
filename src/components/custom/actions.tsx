import { Button } from "@/components/ui/button";
import { Copy, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { useState, useRef } from "react";
import { message } from "../../interfaces/interfaces";

interface MessageActionsProps {
  message: message;
  query?: string; // Add query prop for the user’s input
}

export function MessageActions({ message, query = '' }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const [speaking, setSpeaking] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = async () => {
    setLiked(!liked);
    setDisliked(false);
  await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query, // Use the query prop
        response: message.content,
        feedback: 'Good',
        timestamp: new Date().toISOString(),
      }),
    });
    setFeedbackSent(true);
    setTimeout(() => setFeedbackSent(false), 2000);
  };

  const handleDislike = () => {
    setDisliked(!disliked);
    setLiked(false);
    setShowModal(true);
  };

  const handleModalSubmit = async () => {
  await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query, // Use the query prop
        response: message.content,
        feedback: feedbackText,
        timestamp: new Date().toISOString(),
      }),
    });
    setFeedbackSent(true);
    setShowModal(false);
    setFeedbackText('');
    setTimeout(() => setFeedbackSent(false), 2000);
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      if (speaking) {
        window.speechSynthesis.cancel();
        setSpeaking(false);
        return;
      }
      window.speechSynthesis.cancel();
      const utter = new window.SpeechSynthesisUtterance(message.content);
      utter.onstart = () => setSpeaking(true);
      utter.onend = () => setSpeaking(false);
      utterRef.current = utter;
      window.speechSynthesis.speak(utter);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <Button variant="ghost" size="icon" onClick={handleCopy}>
        {copied ? (
          <Check className="text-black dark:text-white" size={16} />
        ) : (
          <Copy className="text-gray-500" size={16} />
        )}
      </Button>
      <Button variant="ghost" size="icon" onClick={handleSpeak} aria-label="Speak">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 8V12H7L12 16V4L7 8H3Z" stroke={speaking ? "#4F46E5" : "#6B7280"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </Button>
      <Button variant="ghost" size="icon" onClick={handleLike} disabled={feedbackSent}>
        <ThumbsUp className={liked ? "text-black dark:text-white" : "text-gray-500"} size={16} />
      </Button>
      <Button variant="ghost" size="icon" onClick={handleDislike} disabled={feedbackSent}>
        <ThumbsDown className={disliked ? "text-black dark:text-white" : "text-gray-500"} size={16} />
      </Button>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-2">Please provide your feedback</h2>
            <textarea
              className="w-full border rounded p-2 mb-2"
              rows={3}
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              placeholder="What could be improved?"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button
                style={{ backgroundColor: '#E65100', color: '#fff' }}
                onClick={handleModalSubmit}
                disabled={!feedbackText.trim()}
              >Submit</Button>
            </div>
          </div>
        </div>
      )}
      {feedbackSent && (
        <div className="ml-2 text-xs text-green-600">Thank you for your feedback!</div>
      )}
    </div>
  );
}