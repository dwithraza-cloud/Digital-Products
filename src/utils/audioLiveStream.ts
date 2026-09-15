// Web Audio API helper for Gemini Live API bidirectional real-time audio

export interface LiveVoiceConfig {
  voiceName: 'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir';
  systemInstruction?: string;
  storeContext?: any;
}

export interface LiveMessageCallbacks {
  onOpen?: () => void;
  onAudioData?: (base64Audio: string) => void;
  onUserTranscript?: (text: string) => void;
  onModelTranscript?: (text: string) => void;
  onInterrupted?: () => void;
  onTurnComplete?: () => void;
  onToolCall?: (toolCall: { functionCalls: Array<{ id: string; name: string; args: any }> }) => Promise<void> | void;
  onError?: (error: string) => void;
  onClose?: () => void;
  onVolumeChange?: (userVolume: number, modelVolume: number) => void;
}

export class LiveAudioSession {
  private ws: WebSocket | null = null;
  private inputAudioCtx: AudioContext | null = null;
  private outputAudioCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private inputAnalyser: AnalyserNode | null = null;
  private outputAnalyser: AnalyserNode | null = null;
  private activeSources: AudioBufferSourceNode[] = [];
  private nextPlayTime: number = 0;
  private isMuted: boolean = false;
  private isConnected: boolean = false;
  private volumeInterval: any = null;
  private callbacks: LiveMessageCallbacks = {};

  constructor(callbacks: LiveMessageCallbacks) {
    this.callbacks = callbacks;
  }

  public async connect(config: LiveVoiceConfig): Promise<void> {
    this.disconnect();

    // 1. Setup WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/api/live?voice=${encodeURIComponent(config.voiceName)}`;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = async () => {
          this.isConnected = true;
          this.callbacks.onOpen?.();

          // Send initialization payload with context if needed
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(
              JSON.stringify({
                type: 'init',
                voice: config.voiceName,
                systemInstruction: config.systemInstruction,
                context: config.storeContext,
              })
            );
          }

          // Start Microphone recording
          try {
            await this.startMicrophone();
            this.startVolumeMonitoring();
            resolve();
          } catch (micErr: any) {
            console.error('Microphone access failed:', micErr);
            this.callbacks.onError?.('Microphone access denied or unavailable: ' + micErr.message);
            this.disconnect();
            reject(micErr);
          }
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.error) {
              this.callbacks.onError?.(data.error);
            }

            if (data.audio) {
              this.playAudioChunk(data.audio);
              this.callbacks.onAudioData?.(data.audio);
            }

            if (data.userTranscript) {
              this.callbacks.onUserTranscript?.(data.userTranscript);
            }

            if (data.modelTranscript) {
              this.callbacks.onModelTranscript?.(data.modelTranscript);
            }

            if (data.interrupted) {
              this.stopAllPlayback();
              this.callbacks.onInterrupted?.();
            }

            if (data.toolCall && this.callbacks.onToolCall) {
              this.callbacks.onToolCall(data.toolCall);
            }

            if (data.turnComplete) {
              this.callbacks.onTurnComplete?.();
            }
          } catch (err) {
            console.error('Failed to parse WebSocket message:', err);
          }
        };

        this.ws.onerror = (err) => {
          console.error('WebSocket Live API error:', err);
          this.callbacks.onError?.('Live session connection error');
          reject(err);
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          this.callbacks.onClose?.();
        };
      } catch (err: any) {
        this.callbacks.onError?.(err.message || 'Failed to establish WebSocket');
        reject(err);
      }
    });
  }

  private async startMicrophone(): Promise<void> {
    // 16kHz audio context for optimal live streaming to Gemini
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.inputAudioCtx = new AudioContextClass({ sampleRate: 16000 });
    this.outputAudioCtx = new AudioContextClass({ sampleRate: 24000 });

    if (this.inputAudioCtx.state === 'suspended') {
      await this.inputAudioCtx.resume();
    }
    if (this.outputAudioCtx.state === 'suspended') {
      await this.outputAudioCtx.resume();
    }

    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    const source = this.inputAudioCtx.createMediaStreamSource(this.mediaStream);

    // Analyser for input audio level (visualizer)
    this.inputAnalyser = this.inputAudioCtx.createAnalyser();
    this.inputAnalyser.fftSize = 256;
    source.connect(this.inputAnalyser);

    // Analyser for output audio level (visualizer)
    this.outputAnalyser = this.outputAudioCtx.createAnalyser();
    this.outputAnalyser.fftSize = 256;
    this.outputAnalyser.connect(this.outputAudioCtx.destination);

    // 4096 buffer size at 16kHz is ~256ms chunk
    this.scriptProcessor = this.inputAudioCtx.createScriptProcessor(4096, 1, 1);
    source.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.inputAudioCtx.destination);

    this.scriptProcessor.onaudioprocess = (e) => {
      if (this.isMuted || !this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
        return;
      }

      const inputData = e.inputBuffer.getChannelData(0);
      const base64Audio = this.floatTo16BitPCMBase64(inputData);

      if (base64Audio) {
        this.ws.send(
          JSON.stringify({
            audio: base64Audio,
          })
        );
      }
    };
  }

  private floatTo16BitPCMBase64(float32Array: Float32Array): string {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;

    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      // Convert to 16-bit signed integer
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true); // little-endian
    }

    // Convert ArrayBuffer to binary string
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private playAudioChunk(base64Audio: string): void {
    if (!this.outputAudioCtx) return;

    try {
      const arrayBuffer = this.base64ToArrayBuffer(base64Audio);
      const dataView = new DataView(arrayBuffer);
      const numSamples = Math.floor(arrayBuffer.byteLength / 2);
      const float32Data = new Float32Array(numSamples);

      for (let i = 0; i < numSamples; i++) {
        const int16 = dataView.getInt16(i * 2, true); // little endian
        float32Data[i] = int16 < 0 ? int16 / 32768.0 : int16 / 32767.0;
      }

      const audioBuffer = this.outputAudioCtx.createBuffer(1, numSamples, 24000);
      audioBuffer.copyToChannel(float32Data, 0, 0);

      const source = this.outputAudioCtx.createBufferSource();
      source.buffer = audioBuffer;

      // Connect through output analyser for visualizer
      if (this.outputAnalyser) {
        source.connect(this.outputAnalyser);
      } else {
        source.connect(this.outputAudioCtx.destination);
      }

      const currentTime = this.outputAudioCtx.currentTime;
      const startTime = Math.max(currentTime, this.nextPlayTime);
      source.start(startTime);
      this.nextPlayTime = startTime + audioBuffer.duration;

      this.activeSources.push(source);
      source.onended = () => {
        const idx = this.activeSources.indexOf(source);
        if (idx !== -1) {
          this.activeSources.splice(idx, 1);
        }
      };
    } catch (err) {
      console.error('Error playing 24kHz audio chunk:', err);
    }
  }

  public stopAllPlayback(): void {
    for (const src of this.activeSources) {
      try {
        src.stop();
        src.disconnect();
      } catch (e) {
        // ignore already stopped
      }
    }
    this.activeSources = [];
    if (this.outputAudioCtx) {
      this.nextPlayTime = this.outputAudioCtx.currentTime;
    }
  }

  public sendTextMessage(text: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          text: text,
        })
      );
    }
  }

  public sendToolResponse(functionResponses: Array<{ id: string; response: any }>): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'tool_response',
          functionResponses: functionResponses,
        })
      );
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  private startVolumeMonitoring(): void {
    this.stopVolumeMonitoring();

    const inputDataArray = new Uint8Array(128);
    const outputDataArray = new Uint8Array(128);

    this.volumeInterval = setInterval(() => {
      let userVol = 0;
      let modelVol = 0;

      if (this.inputAnalyser && !this.isMuted) {
        this.inputAnalyser.getByteFrequencyData(inputDataArray);
        let sum = 0;
        for (let i = 0; i < inputDataArray.length; i++) {
          sum += inputDataArray[i];
        }
        userVol = Math.min(100, Math.round((sum / (inputDataArray.length * 255)) * 140));
      }

      if (this.outputAnalyser && this.activeSources.length > 0) {
        this.outputAnalyser.getByteFrequencyData(outputDataArray);
        let sum = 0;
        for (let i = 0; i < outputDataArray.length; i++) {
          sum += outputDataArray[i];
        }
        modelVol = Math.min(100, Math.round((sum / (outputDataArray.length * 255)) * 140));
      }

      this.callbacks.onVolumeChange?.(userVol, modelVol);
    }, 50);
  }

  private stopVolumeMonitoring(): void {
    if (this.volumeInterval) {
      clearInterval(this.volumeInterval);
      this.volumeInterval = null;
    }
  }

  public disconnect(): void {
    this.stopVolumeMonitoring();
    this.stopAllPlayback();

    if (this.scriptProcessor) {
      try {
        this.scriptProcessor.disconnect();
      } catch (e) {}
      this.scriptProcessor = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.inputAudioCtx) {
      try {
        this.inputAudioCtx.close();
      } catch (e) {}
      this.inputAudioCtx = null;
    }

    if (this.outputAudioCtx) {
      try {
        this.outputAudioCtx.close();
      } catch (e) {}
      this.outputAudioCtx = null;
    }

    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
      this.ws = null;
    }

    this.isConnected = false;
  }
}
