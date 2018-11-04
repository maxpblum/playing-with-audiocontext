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

export const withPolyphony = (InstClass, polyphony, ...methods) => {
  class Polyphonic extends Instrument {
    initialize(ctx, destination) {
      this.insts = [];
      for (let i = 0; i < polyphony; i++) {
        this.insts.push(new InstClass());
      }
      this.insts.forEach(i => i.initialize(ctx, destination));
      this.nextInst = 0;

      this.soundCreators = this.insts;
    }
  }

  methods.forEach(m => {
    Polyphonic.prototype[m] = function({startTime, stopTime, data}) {
      this.insts[this.nextInst][m]({startTime, stopTime, data});
      this.nextInst = (this.nextInst + 1) % this.insts.length;
    };
  });

  return new Polyphonic();
};
