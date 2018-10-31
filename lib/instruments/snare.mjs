export const SnareEffect = class {
  initialize(ctx, destination, gainTarget) {
    // Pink noise code adapted from https://noisehack.com/generate-noise-web-audio-api/
    const bufferSize = 4096;
    this.pinkNoise = (() => {
      let b0, b1, b2, b3, b4, b5, b6;
      b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
      const node = ctx.createScriptProcessor(bufferSize, 1, 1);
      node.onaudioprocess = function(e) {
          var output = e.outputBuffer.getChannelData(0);
          for (var i = 0; i < bufferSize; i++) {
              var white = Math.random() * 2 - 1;
              b0 = 0.99886 * b0 + white * 0.0555179;
              b1 = 0.99332 * b1 + white * 0.0750759;
              b2 = 0.96900 * b2 + white * 0.1538520;
              b3 = 0.86650 * b3 + white * 0.3104856;
              b4 = 0.55000 * b4 + white * 0.5329522;
              b5 = -0.7616 * b5 - white * 0.0168980;
              output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
              output[i] *= 0.11; // (roughly) compensate for gain
              b6 = white * 0.115926;
          }
      }
      return node;
    })();

    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 880; // Cut-off point.

    this.gainTarget = gainTarget;
    this.gain = ctx.createGain();
    this.gain.gain.value = 0;

    this.pinkNoise.connect(this.filter);
    this.filter.connect(this.gain);
    this.gain.connect(destination);
  }

  snare() {
    return (startTime) => {
      this.gain.gain.setValueAtTime(this.gainTarget, startTime);
      this.gain.gain.setTargetAtTime(0, startTime + 0.07, 0.07);
    };
  }

  start(time) {}

  stop(time) {}
}

export const SnarePartial = class {
  initialize(ctx, destination, type, freq, gainTarget) {
    this.gainTarget = gainTarget;

    this.gain = ctx.createGain();
    this.gain.gain.value = 0;
    this.gain.connect(destination);

    this.osc = ctx.createOscillator();
    this.osc.connect(this.gain);
    this.osc.frequency.value = freq;
  }

  snare() {
    return (startTime) => {
      this.gain.gain.setValueAtTime(this.gainTarget, startTime);
      this.gain.gain.setTargetAtTime(0, startTime + 0.1, 0.1);
    }
  }

  start(time) {
    this.osc.start(time);
  }

  stop(time) {
    this.osc.stop(time);
  }
}

export const Snare = class {
  initialize(ctx, destination) {
    const partialData = [
      ['triangle', 286, 0.1],
      ['triangle', 335, 0.1],
      ['sine',     180, 0.1],
      ['sine',     330, 0.1],
    ];
    this.partials = [];
    partialData.forEach((d, i) => {
      this.partials.push(new SnarePartial());
      this.partials[i].initialize(ctx, destination, ...d);
    });
    const snareEffect = new SnareEffect();
    snareEffect.initialize(ctx, destination, 0.8);
    this.partials.push(snareEffect);
  }

  snare() {
    const playerFns = this.partials.map(p => p.snare());
    return (startTime) => playerFns.forEach(f => f(startTime));
  }

  start(time) {
    this.partials.forEach(p => p.start(time));
  }

  stop(time) {
    this.partials.forEach(p => p.stop(time));
  }
}
