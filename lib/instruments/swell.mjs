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
    this.oscs.forEach((o, i) => o.frequency.setValueAtTime(data[i], startTime));
    this.gain.gain.setTargetAtTime(0.5, startTime, 0.03);
    this.gain.gain.setTargetAtTime(0,    stopTime, 0.03);
    // TODO: Extend this data API to include crescendo and vibrato info.
  }
}
