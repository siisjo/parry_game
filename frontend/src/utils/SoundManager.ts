// src/utils/SoundManager.ts

// 1. 모든 사운드 파일을 직접 import 합니다.
import starSuccess from '../assets/sound/star_success.mp3';
import starMove from '../assets/sound/star_move.mp3';
import parryClick1 from '../assets/sound/parry_click1.mp3';
import parryClick2 from '../assets/sound/parry_click2.mp3';
import parryClick3 from '../assets/sound/parry_click3.mp3';
import gameOver from '../assets/sound/game_over.mp3';
import parryReady from '../assets/sound/parry_ready.mp3';
import fakeReady from '../assets/sound/fake_ready.mp3';

class SoundManager {
  private sounds: { [key: string]: HTMLAudioElement } = {};

  constructor() {
    // 2. import한 변수(실제 경로)를 사용하여 Audio 객체 생성
    const soundMap: { [key: string]: string } = {
      star_success: starSuccess,
      star_move: starMove,
      parry_click1: parryClick1,
      parry_click2: parryClick2,
      parry_click3: parryClick3,
      game_over: gameOver,
      parry_ready: parryReady,
      fake_ready: fakeReady,
    };

    Object.entries(soundMap).forEach(([name, path]) => {
      this.sounds[name] = new Audio(path);
    });
  }

  // ... 나머지 play, stop 등의 함수는 이전과 동일 ...
  play(name: string, playbackRate: number = 1.0) {
    const sound = this.sounds[name];
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
      sound.playbackRate = playbackRate;
      sound.play().catch(() => {});
    }
  }

  playParryClick(playbackRate: number = 1.0) {
    const randomIndex = Math.floor(Math.random() * 3) + 1;
    this.play(`parry_click${randomIndex}`, playbackRate);
  }

  playLoop(name: string, playbackRate: number = 1.0) {
    const sound = this.sounds[name];
    if (sound) {
      sound.loop = true;
      sound.playbackRate = playbackRate;
      sound.play().catch(() => {});
    }
  }

  stop(name: string) {
    const sound = this.sounds[name];
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
    }
  }
}

export const soundManager = new SoundManager();