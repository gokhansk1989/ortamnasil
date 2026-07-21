"use client";

import { useEffect, useRef, useState } from "react";

const WORDS = ["içeriden öğren.", "önce buraya bak.", "deneyimini paylaş.", "ilk yorumu sen yaz."];

export function TypewriterHero() {
  const [text, setText] = useState("");
  const state = useRef({ wi: 0, ci: 0, deleting: false });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function step() {
      const s = state.current;
      const word = WORDS[s.wi];
      if (!s.deleting) {
        s.ci++;
        setText(word.slice(0, s.ci));
        if (s.ci === word.length) {
          timer = setTimeout(() => { s.deleting = true; step(); }, 1800);
          return;
        }
        timer = setTimeout(step, 80 + Math.random() * 40);
      } else {
        s.ci--;
        setText(word.slice(0, s.ci));
        if (s.ci === 0) {
          s.wi = (s.wi + 1) % WORDS.length;
          s.deleting = false;
          timer = setTimeout(step, 400);
          return;
        }
        timer = setTimeout(step, 40);
      }
    }
    step();
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <span className="gradient-text">{text}</span>
      <span
        className="inline-block w-[3px] h-[42px] bg-primary align-middle ml-[2px] max-md:h-[30px]"
        style={{ animation: "blink-cursor 0.7s step-end infinite" }}
      />
    </>
  );
}
