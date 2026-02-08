"use client";

interface HomealWordmarkProps {
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: { text: 18, tag: 8 },
  md: { text: 26, tag: 10 },
  lg: { text: 36, tag: 15 },
};

export default function HomealWordmark({ size = "md" }: HomealWordmarkProps) {
  const s = SIZES[size];

  return (
    <div className="flex flex-col items-start">
      <span
        className="leading-none"
        style={{
          fontFamily: "var(--font-fredoka), 'Fredoka', sans-serif",
          fontWeight: 600,
          fontSize: s.text,
          letterSpacing: "0.01em",
          lineHeight: 1.1,
        }}
      >
        <span style={{ color: "#2D8B3D" }}>Ho</span>
        <span style={{ color: "#FF8534" }}>me</span>
        <span style={{ color: "#2D8B3D" }}>al</span>
      </span>
      <span
        className="italic"
        style={{
          fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
          fontWeight: 400,
          fontSize: s.tag,
          color: "#9595B0",
          letterSpacing: "0.02em",
          marginTop: 2,
        }}
      >
        Healthy food, from home.
      </span>
    </div>
  );
}
