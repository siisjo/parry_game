// src/game/frames.ts
import parryL1 from "../assets/attack/parry_left_1.png";
import parryL2 from "../assets/attack/parry_left_2.png";
import parryL3 from "../assets/attack/parry_left_3.png";
import parryL4 from "../assets/attack/parry_left_4.png";
import parryL5 from "../assets/attack/parry_left_5.png";
import parryR1 from "../assets/attack/parry_right_1.png";
import parryR2 from "../assets/attack/parry_right_2.png";
import parryR3 from "../assets/attack/parry_right_3.png";
import parryR4 from "../assets/attack/parry_right_4.png";
import parryR5 from "../assets/attack/parry_right_5.png";
import chainL1 from "../assets/attack/chainL1.png";
import chainL2 from "../assets/attack/chainL2.png";
import chainL3 from "../assets/attack/chainL3.png";
import chainL4 from "../assets/attack/chainL4.png";
import chainL5 from "../assets/attack/chainL5.png";
import chainR1 from "../assets/attack/chainR1.png";
import chainR2 from "../assets/attack/chainR2.png";
import chainR3 from "../assets/attack/chainR3.png";
import chainR4 from "../assets/attack/chainR4.png";
import chainR5 from "../assets/attack/chainR5.png";
import fakeL1 from "../assets/attack/fake_left_1.png";
import fakeL2 from "../assets/attack/fake_left_2.png";
import fakeL3 from "../assets/attack/fake_left_3.png";
import fakeL4 from "../assets/attack/fake_left_4.png";
import fakeL5 from "../assets/attack/fake_left_5.png";
import fakeR1 from "../assets/attack/fake_right_1.png";
import fakeR2 from "../assets/attack/fake_right_2.png";
import fakeR3 from "../assets/attack/fake_right_3.png";
import fakeR4 from "../assets/attack/fake_right_4.png";
import fakeR5 from "../assets/attack/fake_right_5.png";
import parrySuccess1 from "../assets/attack/parry_success_1.png";
import parrySuccess2 from "../assets/attack/parry_success_2.png";
import parrySuccess3 from "../assets/attack/parry_success_3.png";
import parrySuccess4 from "../assets/attack/parry_success_4.png";
import parrySuccess5 from "../assets/attack/parry_success_5.png";
import parryFail from "../assets/attack/parry_fail.png";
import star1 from "../assets/attack/starforce_1.png";
import star2 from "../assets/attack/starforce_2.png";

// URL을 HTMLImageElement 객체로 변환하는 유틸
const createImage = (src: string) => {
  const img = new Image();
  img.src = src;
  return img;
};

export const frames = {
  parry: {
    pre: {
      LEFT: [parryL1, parryL2, parryL3, parryL4, parryL5].map(createImage),
      RIGHT: [parryR1, parryR2, parryR3, parryR4, parryR5].map(createImage)
    },
    success: [parrySuccess1, parrySuccess2, parrySuccess3, parrySuccess4, parrySuccess5].map(createImage),
    fail: [parryFail].map(createImage)
  },
  chainParry: {
    pre: {
      LEFT: [chainL1, chainL2, chainL3, chainL4, chainL5].map(createImage),
      RIGHT: [chainR1, chainR2, chainR3, chainR4, chainR5].map(createImage)
    }
  },
  fakeParry: {
    pre: {
      LEFT: [fakeL1, fakeL2, fakeL3, fakeL4, fakeL5].map(createImage),
      RIGHT: [fakeR1, fakeR2, fakeR3, fakeR4, fakeR5].map(createImage)
    }
  },
  starforce: [star1, star2].map(createImage),
};