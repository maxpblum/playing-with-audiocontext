import Instrument from '../instrument.mjs';

export const NoiseBass = class {
  initialize(ctx, destination) {
    this.gain = ctx.createGain();
    this.gain.gain.value = 0;
    this.gain.connect(destination);
    this.inst = new Instrument(ctx, 'triangle', [1, 0.75, 0.5, 0.25, 0.15, 0.15]);
    this.inst.connect(this.gain);
  }

  play(pitch) {
    return (startTime, stopTime) => {
      this.gain.gain.setValueAtTime(1, startTime);
      this.gain.gain.setValueAtTime(0, stopTime);
      this.inst.setValueAtTime(pitch, startTime);
    };
  }

  start(time) {
    this.inst.start(time);
  }

  stop(time) {
    this.inst.stop(time);
  }
};
