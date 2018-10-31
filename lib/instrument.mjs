// A synth instrument, somewhat like a drawbar organ.
// Accepts one oscillator type and a list of partials (overtones)
// along with their gain values. Outputs through a single merger.
export default class {
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

  linearRampToValueAtTime(value, time) {
    this.oscillators.forEach((o, i) => {
      o.frequency.linearRampToValueAtTime(value * (i + 1), time);
    });
  }

  exponentialRampToValueAtTime(value, time) {
    this.oscillators.forEach((o, i) => {
      o.frequency.exponentialRampToValueAtTime(value * (i + 1), time);
    });
  }

  setValue(value) {
    this.oscillators.forEach((o, i) => {
      o.frequency.value = value * (i + 1);
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
};
