// Web Audio APIを使用した効果音管理
export type SoundType = 'correct' | 'incorrect' | 'success' | 'fail' | 'click' | 'start';

export interface AudioConfig {
  volume: number;
  enabled: boolean;
}

class AudioManager {
  private audioContext: AudioContext | null = null;
  private audioBuffers: Map<SoundType, AudioBuffer> = new Map();
  private loadingPromises: Map<string, Promise<AudioBuffer>> = new Map();
  
  private config: AudioConfig = {
    volume: 0.7,
    enabled: true
  };

  // Web Audio API形式の簡単な効果音を生成
  private generateTone(frequency: number, duration: number, volume: number = 0.3): AudioBuffer {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const sampleRate = this.audioContext.sampleRate;
    const numSamples = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      // シンプルなサイン波にエンベロープを適用
      const envelope = Math.exp(-t * 3); // 減衰エンベロープ
      channelData[i] = Math.sin(2 * Math.PI * frequency * t) * volume * envelope;
    }
    
    return buffer;
  }

  // 成功音の生成（明るい上昇音）
  private generateSuccessSound(): AudioBuffer {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.5;
    const numSamples = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const frequency = 440 + (t * 220); // 440Hzから660Hzへ上昇
      const envelope = Math.exp(-t * 2);
      channelData[i] = Math.sin(2 * Math.PI * frequency * t) * 0.3 * envelope;
    }
    
    return buffer;
  }

  // エラー音の生成（低い音）
  private generateErrorSound(): AudioBuffer {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.3;
    const numSamples = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const frequency = 220 - (t * 50); // 220Hzから170Hzへ下降
      const envelope = 1 - t / duration;
      channelData[i] = Math.sin(2 * Math.PI * frequency * t) * 0.4 * envelope;
    }
    
    return buffer;
  }

  // 初期化：プリセット音を生成
  async initialize(): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    try {
      // プリセット効果音を生成
      this.audioBuffers.set('correct', this.generateTone(523, 0.2)); // C5音
      this.audioBuffers.set('incorrect', this.generateErrorSound());
      this.audioBuffers.set('success', this.generateSuccessSound());
      this.audioBuffers.set('fail', this.generateTone(196, 0.5, 0.4)); // G3音
      this.audioBuffers.set('click', this.generateTone(800, 0.1, 0.2)); // 短いクリック音
      this.audioBuffers.set('start', this.generateTone(659, 0.3)); // E5音
    } catch (error) {
      console.warn('Failed to initialize audio:', error);
    }
  }

  // 効果音を再生
  async play(soundType: SoundType): Promise<void> {
    if (!this.config.enabled || !this.audioContext) {
      return;
    }

    try {
      // AudioContextが一時停止状態の場合は再開
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const buffer = this.audioBuffers.get(soundType);
      if (!buffer) {
        console.warn(`Sound ${soundType} not found`);
        return;
      }

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = buffer;
      gainNode.gain.value = this.config.volume;
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start();
    } catch (error) {
      console.warn(`Failed to play sound ${soundType}:`, error);
    }
  }

  // 設定の更新
  setConfig(newConfig: Partial<AudioConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // 設定の取得
  getConfig(): AudioConfig {
    return { ...this.config };
  }

  // 有効/無効の切り替え
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  // 音量の設定
  setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1, volume));
  }
}

// シングルトンインスタンス
export const audioManager = new AudioManager();

// 初期化を自動実行（最初のユーザーインタラクション後）
let initialized = false;

export const initializeAudio = async (): Promise<void> => {
  if (!initialized) {
    await audioManager.initialize();
    initialized = true;
  }
};

// ユーザーインタラクション後に自動初期化
const initOnUserInteraction = async () => {
  await initializeAudio();
  // イベントリスナーを削除
  document.removeEventListener('click', initOnUserInteraction);
  document.removeEventListener('keydown', initOnUserInteraction);
  document.removeEventListener('touchstart', initOnUserInteraction);
};

// ブラウザでの実行時のみイベントリスナーを追加
if (typeof window !== 'undefined') {
  document.addEventListener('click', initOnUserInteraction, { once: true });
  document.addEventListener('keydown', initOnUserInteraction, { once: true });
  document.addEventListener('touchstart', initOnUserInteraction, { once: true });
}
