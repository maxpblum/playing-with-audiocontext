export const Instrument = class {
  initialize() {
    throw new Error('Instrument must have an initializer.');
  }

  start(time) {
    this.soundCreators.forEach(c => c.start(time));
  }

  stop(time) {
    this.soundCreators.forEach(c => c.stop(time));
  }
}
