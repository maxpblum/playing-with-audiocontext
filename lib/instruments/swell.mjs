import {Instrument} from '../instrument.mjs';
import {timesWithConstructor} from '../utils.mjs';

export default class extends Instrument {
  constructor(count, type = 'sine') {
    super();
    this.count = count;
    this.type = type;
  }

  initialize(ctx, destination) {
    this.gain = ctx.createGain();
    this.gain.gain.value = 0;
    this.gain.connect(destination);

    this.vibFreq = ctx.createOscillator();
    this.vibFreq.type = 'sine';
    this.vibGain = ctx.createGain();
    this.vibFreq.connect(this.vibGain);

    this.oscs = timesWithConstructor(this.count, () => {
      const osc = ctx.createOscillator();
      osc.type = this.type;
      osc.connect(this.gain);
      this.vibGain.connect(osc.frequency);
      return osc;
    });

    this.soundCreators = [this.vibFreq, ...this.oscs];
  }

  play({startTime, stopTime, data}) {
    const rampStart = (startTime + stopTime) / 2;
    const rampStop = startTime + (stopTime - startTime) * 0.95;
    const safeStop = startTime + (stopTime - startTime) * 0.99;
    const resetTime = startTime + (stopTime - startTime) * 0.995;
    this.oscs.forEach((o, i) => o.frequency.setValueAtTime(data[i], startTime));
    this.gain.gain.setTargetAtTime(0.3, startTime, 0.75);
    this.gain.gain.setTargetAtTime(0,    safeStop, 0.75);
    this.vibFreq.frequency.setValueAtTime(0, startTime);
    this.vibFreq.frequency.setValueAtTime(0, rampStart);
    this.vibFreq.frequency.linearRampToValueAtTime(7, rampStop);
    this.vibFreq.frequency.setValueAtTime(0, resetTime);
    this.vibGain.gain.setValueAtTime(1, startTime);
    this.vibGain.gain.setValueAtTime(1, rampStart);
    this.vibGain.gain.linearRampToValueAtTime(3, rampStop);
    this.vibGain.gain.setValueAtTime(0, resetTime);
  }
}
