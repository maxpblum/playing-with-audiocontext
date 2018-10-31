import Instrument from '../instrument.mjs';

export const Pinger = class {
  initialize(ctx, destination) {
    this.gain = ctx.createGain();
    this.gain.connect(destination);
    this.gain.gain.value = 0;

    this.inst = new Instrument(ctx, 'sine', [0.2, 0, 0, 0, 0.1, 0.2, 0, 0.1, 0.1]);
    this.inst.connect(this.gain);
  }

  ping(pitch) {
    return (startTime) => {
      this.inst.setValueAtTime(pitch, startTime);
      this.gain.gain.setValueAtTime(0.5, startTime);
      this.gain.gain.setTargetAtTime(0, startTime + 0.05, 0.05);
    };
  }

  start(time) {
    this.inst.start(time);
  }

  stop(time) {
    this.inst.stop(time);
  }
}

export const PolyphonicPinger = class {
  constructor(polyphony) {
    this.polyphony = polyphony;
  }

  initialize(ctx, destination) {
    this.pingers = [];
    for (let i = 0; i < this.polyphony; i++) {
      this.pingers.push(new Pinger());
    }
    this.pingers.forEach(p => p.initialize(ctx, destination));
    this.nextPinger = 0;
  }

  ping(pitch) {
    return (startTime) => {
      this.pingers[this.nextPinger].ping(pitch)(startTime);
      this.nextPinger = (this.nextPinger + 1) % this.pingers.length;
    };
  }

  start(time) {
    this.pingers.forEach(p => p.start(time));
  }

  stop(time) {
    this.pingers.forEach(p => p.stop(time));
  }
}
