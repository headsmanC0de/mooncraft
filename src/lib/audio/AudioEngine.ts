export class AudioEngine {
	private ctx: AudioContext | null = null
	private masterGain: GainNode | null = null
	private enabled = true

	private getContext(): AudioContext {
		if (!this.ctx) {
			this.ctx = new AudioContext()
			this.masterGain = this.ctx.createGain()
			this.masterGain.gain.value = 0.3
			this.masterGain.connect(this.ctx.destination)
		}
		// Resume if suspended (browser autoplay policy)
		if (this.ctx.state === 'suspended') {
			this.ctx.resume()
		}
		return this.ctx
	}

	setEnabled(enabled: boolean): void {
		this.enabled = enabled
	}

	isEnabled(): boolean {
		return this.enabled
	}

	/** UI click sound — short high beep */
	playClick(): void {
		if (!this.enabled) return
		this.playTone(800, 0.05, 'sine', 0.2)
	}

	/** Unit selected — medium pitch blip */
	playSelect(): void {
		if (!this.enabled) return
		this.playTone(600, 0.08, 'sine', 0.15)
	}

	/** Move command — ascending two-note */
	playMove(): void {
		if (!this.enabled) return
		this.playTone(400, 0.06, 'sine', 0.15)
		setTimeout(() => this.playTone(500, 0.06, 'sine', 0.15), 60)
	}

	/** Attack hit — short noise burst */
	playAttack(): void {
		if (!this.enabled) return
		this.playNoise(0.08, 0.3)
	}

	/** Building placed — low thud */
	playBuild(): void {
		if (!this.enabled) return
		this.playTone(150, 0.15, 'sine', 0.3)
	}

	/** Building complete — ascending chord */
	playComplete(): void {
		if (!this.enabled) return
		this.playTone(400, 0.12, 'sine', 0.15)
		setTimeout(() => this.playTone(500, 0.12, 'sine', 0.15), 80)
		setTimeout(() => this.playTone(600, 0.15, 'sine', 0.15), 160)
	}

	/** Unit trained — short confirmation beep */
	playTrain(): void {
		if (!this.enabled) return
		this.playTone(500, 0.1, 'triangle', 0.2)
	}

	/** Resource gathered — soft ding */
	playGather(): void {
		if (!this.enabled) return
		this.playTone(1200, 0.04, 'sine', 0.1)
	}

	/** Error / not enough resources */
	playError(): void {
		if (!this.enabled) return
		this.playTone(200, 0.15, 'sawtooth', 0.15)
	}

	private playTone(freq: number, duration: number, type: OscillatorType, volume: number): void {
		try {
			const ctx = this.getContext()
			const osc = ctx.createOscillator()
			const gain = ctx.createGain()

			osc.type = type
			osc.frequency.value = freq
			gain.gain.setValueAtTime(volume, ctx.currentTime)
			gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

			osc.connect(gain)
			gain.connect(this.masterGain!)

			osc.start(ctx.currentTime)
			osc.stop(ctx.currentTime + duration + 0.01)
		} catch {
			// AudioContext unavailable (Node.js, SSR)
		}
	}

	private playNoise(duration: number, volume: number): void {
		try {
			const ctx = this.getContext()
			const bufferSize = ctx.sampleRate * duration
			const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
			const data = buffer.getChannelData(0)

			for (let i = 0; i < bufferSize; i++) {
				data[i] = (Math.random() * 2 - 1) * 0.5
			}

			const source = ctx.createBufferSource()
			source.buffer = buffer
			const gain = ctx.createGain()
			gain.gain.setValueAtTime(volume, ctx.currentTime)
			gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

			source.connect(gain)
			gain.connect(this.masterGain!)
			source.start(ctx.currentTime)
		} catch {
			// AudioContext unavailable (Node.js, SSR)
		}
	}
}

export const audioEngine = new AudioEngine()
