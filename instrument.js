// A synth instrument, somewhat like a drawbar organ.
// Accepts one oscillator type and a list of partials (overtones)
// along with their gain values. Outputs through a single merger.
class Instrument {
  constructor(ctx, type, partials) {
    this.gains = [];
    this.oscillators = partials.map(_ => ctx.createOscillator());
    this.oscillators.forEach((o, i) => {
      o.type = type;
      this.gains.push(ctx.createGain());
      this.gains[i].gain.value = partials[i];
      o.connect(this.gains[i]);
    });
  }

  setValueAtTime(value, time) {
    this.oscillators.forEach((o, i) => {
      o.frequency.setValueAtTime(value * (i + 1), time);
    });
  }

  start(time) {
    this.oscillators.forEach(o => o.start(time));
  }

  stop(time) {
    this.oscillators.forEach(o => o.stop(time));
  }

  connect(...args) {
    this.gains.map(gn => gn.connect(...args));
  }
}
