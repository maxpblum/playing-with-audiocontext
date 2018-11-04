import Organ from './organ.mjs';

export const NoiseBass = class {
  initialize(ctx, destination) {
    this.gain = ctx.createGain();
    this.gain.gain.value = 0;
    this.gain.connect(destination);
    this.inst = new Organ(ctx, 'triangle', [1, 0.75, 0.5, 0.25, 0.15, 0.15]);
    this.inst.connect(this.gain);
  }

  play({data, startTime, stopTime}) {
    this.gain.gain.setValueAtTime(1, startTime);
    this.gain.gain.setValueAtTime(0, stopTime);
    this.inst.setValueAtTime(data, startTime);
  }

  start(time) {
    this.inst.start(time);
  }

  stop(time) {
    this.inst.stop(time);
  }
};
