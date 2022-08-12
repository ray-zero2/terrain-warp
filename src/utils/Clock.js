export default class Clock {
  constructor() {
    this.isRunning = false;
    this.time = 0;
    this.lastTime = 0;
  }

  getDelta() {
    let diff = 0;
    const currentTime = performance.now();

    if (this.isRunning) {
      diff = (currentTime - this.lastTime) / 1000;
    } else {
      this.isRunning = true;
    }
    this.lastTime = currentTime;

    this.time += diff;
    return diff;
  }
}
