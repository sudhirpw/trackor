"use client";
import React, { useState, useEffect,  } from "react";
import { Mail, Heart, Loader2 } from "lucide-react";
// import { rtdb } from "../src/lib/firebase";
// import { ref, onValue, set } from "firebase/database";

interface HeartData {
  id: number;
  offsetX: number;
}

// const MAX_BURSTS = 50;

const HelpFab: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [heartBursts, setHeartBursts] = useState<HeartData[]>([]);
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);

  // const prevLikeCountRef = useRef(0);
  // const isInitialLoad = useRef(true);

  useEffect(() => {
    // const likeRef = ref(, "likeCount");

    // const unsubscribe = onValue( (snapshot) => {
    //   const currentVal = snapshot.exists() ? snapshot.val() : 0;

    //   if (isInitialLoad.current) {
    //     isInitialLoad.current = false;
    //   } else if (currentVal > prevLikeCountRef.current) {
    //     const diff = Math.min(currentVal - prevLikeCountRef.current, MAX_BURSTS);
    //     triggerHeartBurst(diff);
    //   }

    //   prevLikeCountRef.current = currentVal;
    //   setLikeCount(currentVal);
    // });

    // return () => unsubscribe();
  }, []);

  const triggerHeartBurst = (count: number) => {
    const hearts = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      offsetX: Math.random() * 20 - 10,
    }));

    setHeartBursts((prev) => [...prev, ...hearts]);

    setTimeout(() => {
      setHeartBursts((prev) => prev.filter((h) => !hearts.includes(h)));
    }, 1000);
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setFeedbackEmail(email);

    if (!validateEmail(email) && email !== "") {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
    }
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    setFeedbackStatus("");
    setEmailError("");
  };

  const handleLike = async () => {
    const newCount = likeCount + 1;
    setLikeCount(newCount);
    triggerHeartBurst(1);
    // await set(ref(rtdb, "likeCount"), newCount);
  };

  const handleSubmitFeedback = async () => {
    if (!validateEmail(feedbackEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: feedbackEmail,
          message: feedbackMessage,
        }),
      });

      if (!res.ok) throw new Error("Failed to send feedback");

      setFeedbackStatus("Feedback sent successfully!");
      setFeedbackEmail("");
      setFeedbackMessage("");
    } catch (error) {
      console.error(error);
      setFeedbackStatus("Error sending feedback.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 flex flex-col items-end z-50">
      <div className="pointer-events-none absolute bottom-16 right-4 flex flex-col items-end">
        {heartBursts.map((heart) => (
          <div
            key={heart.id}
            className="animate-heartBurst text-pink-500 absolute"
            style={{ transform: `translateX(${heart.offsetX}px)` }}
          >
            <Heart className="w-6 h-6" />
          </div>
        ))}
      </div>

      {isOpen && (
        <div className="mb-4 w-72 bg-white rounded-lg shadow-lg p-4 text-sm relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <button
              onClick={handleLike}
              className="flex items-center justify-center w-10 h-10 bg-pink-500 hover:bg-pink-600 text-white rounded-full transition-colors duration-300"
            >
              <Heart className="w-5 h-5" />
            </button>
            <span className="text-xl font-semibold text-gray-800">{likeCount}</span>
            <p className="text-s mt-2 text-gray-400">Made by Aman Kumar IT</p>
          </div>

          <hr className="my-3" />

          <div>
            <input
              type="email"
              placeholder="Your Email"
              value={feedbackEmail}
              onChange={handleEmailChange}
              className={`w-full mb-2 px-2 py-1 border rounded ${
                emailError ? "border-red-500" : "border-gray-300"
              }`}
            />
            {emailError && <p className="text-sm text-red-500 mb-2">{emailError}</p>}
            <textarea
              placeholder="Your feedback message"
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              rows={3}
              className="w-full mb-2 px-2 py-1 border rounded"
            />
            <button
              onClick={handleSubmitFeedback}
              className={`flex items-center px-3 py-2 bg-blue-500 text-white 
                         rounded hover:bg-blue-600 transition-colors ${
                           loading ? "opacity-70 cursor-not-allowed" : ""
                         }`}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Mail className="w-4 h-4 mr-1" />
              )}
              {loading ? "Sending..." : "Send Feedback"}
            </button>
            {feedbackStatus && (
              <p
                className={`mt-2 text-sm ${
                  feedbackStatus === "Feedback sent successfully!"
                    ? "text-green-600"
                    : "text-orange-500"
                }`}
              >
                {feedbackStatus}
              </p>
            )}
          </div>
        </div>
      )}

      <button
        onClick={handleToggle}
        className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 relative z-20"
      >
        <p className="text-3xl">?</p>
      </button>
    </div>
  );
};

export default HelpFab;
