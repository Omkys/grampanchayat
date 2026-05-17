"use client";
import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";

export default function AnimatedCounter({ value, label, Icon }: { value: number; label: string; Icon: LucideIcon }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1500;
          const step = Math.ceil(value / (duration / 16));
          let current = 0;
          const timer = setInterval(() => {
            current += step;
            if (current >= value) {
              current = value;
              clearInterval(timer);
            }
            setCount(current);
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="flex flex-col items-center">
      <Icon className="w-8 h-8 mb-2 text-white/80" />
      <span className="text-3xl font-bold">{count.toLocaleString("en-IN")}</span>
      <span className="text-sm mt-1 text-white/80">{label}</span>
    </div>
  );
}
