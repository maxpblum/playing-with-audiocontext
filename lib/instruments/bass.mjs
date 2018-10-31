export const Bass = class {
  initialize(ctx, destination) {
    this.gain = ctx.createGain();
    this.gain.gain.value = 0;
    this.gain.connect(destination);

    this.osc = ctx.createOscillator();
    this.osc.type = 'triangle';
    this.osc.connect(this.gain);

    this.instrument = this.osc.frequency;
  }

  play(pitch) {
    return (startTime, stopTime) => {
      this.instrument.setValueAtTime(pitch, startTime);
      this.gain.gain.setTargetAtTime(1, startTime, 0.02);
      this.gain.gain.setTargetAtTime(0, stopTime, 0.02);
    };
  }

  start(time) {
    this.osc.start(time);
  }

  stop(time) {
    this.osc.stop(time);
  }
}
