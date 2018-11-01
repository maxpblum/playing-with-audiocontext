export const Twinkler = class {
  initialize(ctx, destination) {
    this.osc = ctx.createOscillator();
    this.osc.type = 'triangle';
    this.gain = ctx.createGain();
    this.gain.connect(destination);
    this.osc.connect(this.gain);
    this.gain.gain.value = 0;
  }

  arpeggiate({data, startTime, stopTime}) {
    const timePerNote = (stopTime - startTime) / data.length;
    this.gain.gain.setValueAtTime(0.6, startTime);
    data.forEach((pitch, i) => {
      this.osc.frequency.setValueAtTime(pitch, startTime + (timePerNote * i));
    });
  }

  start(time) {
    this.osc.start(time);
  }

  stop(time) {
    this.osc.stop(time);
  }
};
