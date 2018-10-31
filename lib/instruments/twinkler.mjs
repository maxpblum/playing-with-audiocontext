export const Twinkler = class {
  initialize(ctx, destination) {
    this.osc = ctx.createOscillator();
    this.osc.type = 'triangle';
    this.gain = ctx.createGain();
    this.gain.connect(destination);
    this.osc.connect(this.gain);
    this.gain.gain.value = 0;
  }

  arpeggiate(pitchRow) {
    return (startTime, stopTime) => {
      const timePerNote = (stopTime - startTime) / pitchRow.length;
      this.gain.gain.setValueAtTime(0.6, startTime);
      pitchRow.forEach((p, i) => {
        this.osc.frequency.setValueAtTime(p, startTime + (timePerNote * i));
      });
    };
  }

  start(time) {
    this.osc.start(time);
  }

  stop(time) {
    this.osc.stop(time);
  }
};
