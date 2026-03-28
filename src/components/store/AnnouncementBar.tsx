"use client";
import { useState, useEffect } from "react";

export default function AnnouncementBar() {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/settings/store")
      .then((r) => r.json())
      .then((d) => {
        if (
          Array.isArray(d.announcement_messages) &&
          d.announcement_messages.length > 0
        ) {
          setMessages(d.announcement_messages);
        }
      })
      .catch(() => {});
  }, []);

  if (messages.length === 0) return null;

  // Repeat enough times to fill screen seamlessly
  const repeated: string[] = [];
  for (let i = 0; i < 10; i++) {
    repeated.push(...messages);
  }
  // Double for seamless loop (translate -50%)
  const seamlessArray = [...repeated, ...repeated];

  const duration = messages.length * 30; // ~30s per message

  return (
    <>
      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: inline-flex;
          width: max-content;
          animation: marquee-scroll ${duration}s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="announcement-bar bg_dark" style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
        <div className="wrap-announcement-bar" style={{ overflow: "hidden" }}>
          <div className="marquee-track">
            {seamlessArray.map((msg, i) => (
              <div key={i} className="announcement-bar-item">
                <p>{msg}</p>
              </div>
            ))}
          </div>
        </div>
        <span className="icon-close close-announcement-bar"></span>
      </div>
    </>
  );
}
