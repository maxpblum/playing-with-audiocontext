import {Instrument} from '../instrument.mjs';
import OscillatorGroup from '../oscillator_group.mjs';

export default class extends Instrument {
  constructor(size) {
    super();
    this.size = size;
  }

  initialize(ctx, destination) {
    this.gain = ctx.createGain();
    this.gain.connect(destination);
    this.gain.gain.value = 0;
    this.oscs = new OscillatorGroup(ctx, this.size);
    this.oscs.setType('triangle');
    this.oscs.connect(this.gain);

    this.soundCreators = [this.oscs];
  }

  yellChord({data, startTime, stopTime}) {
    this.oscs.setChordAtTime(data, startTime);
    this.gain.gain.setTargetAtTime(0.5, startTime, 0.002);
    this.gain.gain.setTargetAtTime(  0, stopTime,  0.002);
  }
};
