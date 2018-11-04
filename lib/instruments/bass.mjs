import {Instrument} from '../instrument.mjs';

export const Bass = class extends Instrument {
  initialize(ctx, destination) {
    this.gain = ctx.createGain();
    this.gain.gain.value = 0;
    this.gain.connect(destination);

    this.osc = ctx.createOscillator();
    this.osc.type = 'triangle';
    this.osc.connect(this.gain);

    this.instrument = this.osc.frequency;

    this.soundCreators = [this.osc];
  }

  play({data, startTime, stopTime}) {
    this.instrument.setValueAtTime(data, startTime);
    this.gain.gain.setTargetAtTime(1, startTime, 0.02);
    this.gain.gain.setTargetAtTime(0, stopTime, 0.02);
  }
}
