import HermiteCurve from './hermiteCurve';

class PatchRenderer {
  constructor({ patch, canvas }) {
    this.patch = patch;
    this.canvas = canvas;
  }

  draw() {
    const x = HermiteCurve.interpolate(
      .5,
      this.patch[0].x,
      this.patch[0].handles[1].x,
      this.patch[1].x,
      -this.patch[1].handles[3].x
    );

    const y = HermiteCurve.interpolate(
      .5,
      this.patch[0].y,
      this.patch[0].handles[1].y,
      this.patch[1].y,
      -this.patch[1].handles[3].y
    );

    const ctx = this.canvas.current.getContext('2d');

    ctx.beginPath();
    ctx.fillRect(this.patch[0].x + x - 3, this.patch[0].y + y - 3, 5, 5);
    ctx.fill();
  };
}

export default PatchRenderer;