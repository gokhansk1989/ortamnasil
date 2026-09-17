import type { LightKey } from "./lights";

export interface ProfileReview {
  id?: string;
  author: string;
  emoji: string;
  avBg: string;
  role: string;
  when: string;
  light: LightKey;
  up: number;
  same: number;
  text: string;
  type?: "review" | "survey";
  voted?: boolean;
  agreed?: boolean;
}
