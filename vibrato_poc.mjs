class {
  initialize(audioContext, destination) {
    this.gain = audioContext.createGain();
    this.gain.gain.value = 0;
    this.gain.connect(destination);
    this.osc = audioContext.createOscillator();
    this.osc.connect(this.gain);
  }

  play({startTime, stopTime, data}) {
    this.osc.frequency.setValueAtTime(data, startTime);
    this.gain.gain.setTargetAtTime(0.5, startTime, 0.03);
    this.gain.gain.setTargetAtTime(0,    stopTime, 0.03);
    // Apply vibrato
    const upperLimit = data * Math.pow(2, (0.3 / 12));
    const lowerLimit = data / Math.pow(2, (0.3 / 12));
    const timeInterval = 0.05;
    let vibratoTime = startTime + timeInterval;
    let prevLimit = lowerLimit;
    while (vibratoTime < stopTime) {
      let nextLimit = (prevLimit < data) ? upperLimit : lowerLimit;
      this.osc.frequency.exponentialRampToValueAtTime(nextLimit, vibratoTime);
      vibratoTime += timeInterval;
      prevLimit = nextLimit;
    }
  }

  start(time) {
    this.osc.start(time);
  }

  stop(time) {
    this.osc.stop(time);
  }
}
