import {Instrument} from '../instrument.mjs';
import Organ from './organ.mjs';

export const Kick = class extends Instrument {
  initialize(ctx, destination) {
    this.frequencyStart = 55;

    this.gain = ctx.createGain();
    this.gain.gain.value = 0;
    this.gain.connect(destination);

    this.inst = new Organ(ctx, 'sine',
      [0.7, 0.5, 0.1, 0.1, 0.1, 0.1, 0.05, 0.05, 0.05, 0.005]);
    this.inst.setValue(this.frequencyStart);
    this.inst.connect(this.gain);

    this.soundCreators = [this.inst];
  }

  kick({startTime}) {
    this.inst.setValueAtTime(this.frequencyStart, startTime);
    this.inst.setValueAtTime(this.frequencyStart, startTime + 0.03);
    this.gain.gain.setValueAtTime(0, startTime);
    this.gain.gain.linearRampToValueAtTime(0.75, startTime + 0.01, 0.005);
    this.gain.gain.linearRampToValueAtTime(0, startTime + 0.12);
    this.inst.exponentialRampToValueAtTime(this.frequencyStart * 0.6, startTime + 0.12);
  }
}

export const PolyphonicKick = class extends Instrument {
  constructor(polyphony) {
    super();
    this.polyphony = polyphony;
  }

  initialize(ctx, destination) {
    this.kicks = [];
    for (let i = 0; i < this.polyphony; i++) {
      this.kicks.push(new Kick());
    }
    this.kicks.forEach(k => k.initialize(ctx, destination));
    this.nextKick = 0;

    this.soundCreators = this.kicks;
  }

  kick({startTime}) {
    this.kicks[this.nextKick].kick({startTime});
    this.nextKick = (this.nextKick + 1) % this.kicks.length;
  }
}
