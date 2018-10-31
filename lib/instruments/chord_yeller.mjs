import OscillatorGroup from '../oscillator_group.mjs';

export const ChordYeller = class {
  constructor(size) {
    this.size = size;
  }

  initialize(ctx, destination) {
    this.gain = ctx.createGain();
    this.gain.connect(destination);
    this.gain.gain.value = 0.5;
    this.oscs = new OscillatorGroup(ctx, 4);
    this.oscs.setType('triangle');
    this.oscs.connect(this.gain);
  }

  yellChord(chord) {
    return (startTime, stopTime) => {
      this.oscs.setChordAtTime(chord, startTime);
      this.gain.gain.setTargetAtTime(0.5, startTime, 0.002);
      this.gain.gain.setTargetAtTime(  0, stopTime,  0.002);
    };
  }

  start(time) {
    this.oscs.start(time);
  }

  stop(time) {
    this.oscs.stop(time);
  }
};
