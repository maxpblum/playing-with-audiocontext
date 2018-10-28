class OscillatorGroup {
  constructor(ctx, size) {
    this.oscillators = [];
    for (var i = 0; i < size; i++) {
      this.oscillators.push(ctx.createOscillator());
    }
  }

  setType(type) {
    this.oscillators.forEach(o => {
      o.type = type;
    });
  }

  connect(output) {
    this.oscillators.forEach(o => o.connect(output));
  }

  start(time) {
    this.oscillators.forEach(o => o.start(time));
  }

  stop(time) {
    this.oscillators.forEach(o => o.stop(time));
  }

  setChordAtTime(chord, time) {
    if (chord.length !== this.oscillators.length) {
      throw new Exception(
        `Expected a chord of size ${this.oscillators.length}, found a chord ` +
        `of size ${chord.length}.`);
    }
    chord.forEach((freq, i) => {
      this.oscillators[i].frequency.setValueAtTime(freq, time);
    });
  }
}
