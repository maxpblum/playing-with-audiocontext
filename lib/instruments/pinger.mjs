import {Instrument} from '../instrument.mjs';
import Organ from './organ.mjs';

export const Pinger = class extends Instrument {
  initialize(ctx, destination) {
    this.gain = ctx.createGain();
    this.gain.connect(destination);
    this.gain.gain.value = 0;

    this.inst = new Organ(ctx, 'sine', [0.2, 0, 0, 0, 0.1, 0.2, 0, 0.1, 0.1]);
    this.inst.connect(this.gain);

    this.soundCreators = [this.inst];
  }

  ping({data, startTime}) {
    this.inst.setValueAtTime(data, startTime);
    this.gain.gain.setValueAtTime(0.5, startTime);
    this.gain.gain.setTargetAtTime(0, startTime + 0.05, 0.05);
  }
}

export const PolyphonicPinger = class extends Instrument {
  constructor(polyphony) {
    super();
    this.polyphony = polyphony;
  }

  initialize(ctx, destination) {
    this.pingers = [];
    for (let i = 0; i < this.polyphony; i++) {
      this.pingers.push(new Pinger());
    }
    this.pingers.forEach(p => p.initialize(ctx, destination));
    this.nextPinger = 0;

    this.soundCreators = this.pingers;
  }

  ping({data, startTime}) {
    this.pingers[this.nextPinger].ping({data, startTime});
    this.nextPinger = (this.nextPinger + 1) % this.pingers.length;
  }
}
