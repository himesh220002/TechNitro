"use client";

export default function LoadingBars() {
  return (
    <div className="flex items-center justify-center gap-2 py-6">
      <div className="bar bg-blue-500"></div>
      <div className="bar bg-blue-500"></div>
      <div className="bar bg-blue-500"></div>

      <style jsx>{`
        .bar {
          width: 10px;
          height: 30px;
          border-radius: 4px;
          animation: glow 1s infinite ease-in-out;
        }

        .bar:nth-child(1) { animation-delay: 0s; }
        .bar:nth-child(2) { animation-delay: 0.2s; }
        .bar:nth-child(3) { animation-delay: 0.4s; }

        @keyframes glow {
          0% { opacity: 0.2; transform: scaleY(0.8); }
          50% { opacity: 1; transform: scaleY(1.4); }
          100% { opacity: 0.2; transform: scaleY(0.8); }
        }
      `}</style>
    </div>
  );
}
