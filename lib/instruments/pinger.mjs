import {Instrument} from '../instrument.mjs';
import Organ from './organ.mjs';

export default class extends Instrument {
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
