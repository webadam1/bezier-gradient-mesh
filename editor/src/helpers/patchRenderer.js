import HermiteCurve from './hermiteCurve';

class PatchRenderer {
  constructor({ patch, canvas }) {
    this.patch = patch;
    this.canvas = canvas;

    this.getDivider1 = this.getDivider1.bind(this);
    this.getDivider2 = this.getDivider2.bind(this);
  }

  getDivider1() {
    const x1 = HermiteCurve.interpolate(
      .5,
      this.patch[0].x,
      this.patch[0].handles[1].x,
      this.patch[1].x,
      -this.patch[1].handles[3].x
    );

    const y1 = HermiteCurve.interpolate(
      .5,
      this.patch[0].y,
      this.patch[0].handles[1].y,
      this.patch[1].y,
      -this.patch[1].handles[3].y
    );

    const mx1 = (this.patch[0].handles[2].x + this.patch[1].handles[2].x) / 2;
    const my1 = (this.patch[0].handles[2].y + this.patch[1].handles[2].y) / 2;

    const x2 = HermiteCurve.interpolate(
      .5,
      this.patch[3].x,
      this.patch[3].handles[1].x,
      this.patch[2].x,
      -this.patch[2].handles[3].x
    );

    const y2 = HermiteCurve.interpolate(
      .5,
      this.patch[3].y,
      this.patch[3].handles[1].y,
      this.patch[2].y,
      -this.patch[2].handles[3].y
    );

    const mx2 = (this.patch[2].handles[0].x + this.patch[3].handles[0].x) / 2;
    const my2 = (this.patch[2].handles[0].y + this.patch[3].handles[0].y) / 2;

    return {
      x1: this.patch[0].x + x1,
      y1: this.patch[0].y + y1,
      mx1,
      my1,
      x2: this.patch[3].x + x2,
      y2: this.patch[3].y + y2,
      mx2,
      my2
    };
  }

  getDivider2() {
    const x1 = HermiteCurve.interpolate(
      .5,
      this.patch[0].x,
      this.patch[0].handles[2].x,
      this.patch[3].x,
      -this.patch[3].handles[0].x
    );

    const y1 = HermiteCurve.interpolate(
      .5,
      this.patch[0].y,
      this.patch[0].handles[2].y,
      this.patch[3].y,
      -this.patch[3].handles[0].y
    );

    const mx1 = (this.patch[0].handles[1].x + this.patch[3].handles[1].x) / 2;
    const my1 = (this.patch[0].handles[1].y + this.patch[3].handles[1].y) / 2;

    const x2 = HermiteCurve.interpolate(
      .5,
      this.patch[1].x,
      this.patch[1].handles[2].x,
      this.patch[2].x,
      -this.patch[2].handles[0].x
    );

    const y2 = HermiteCurve.interpolate(
      .5,
      this.patch[1].y,
      this.patch[1].handles[2].y,
      this.patch[2].y,
      -this.patch[2].handles[0].y
    );

    const mx2 = (this.patch[1].handles[3].x + this.patch[2].handles[3].x) / 2;
    const my2 = (this.patch[2].handles[3].y + this.patch[1].handles[3].y) / 2;

    return {
      x1: this.patch[0].x + x1,
      y1: this.patch[0].y + y1,
      mx1,
      my1,
      x2: this.patch[1].x + x2,
      y2: this.patch[1].y + y2,
      mx2,
      my2
    };
  }

  drawDivider(source) {
    const { x1, y1, mx1, my1, x2, y2, mx2, my2 } = source();
    const c = new HermiteCurve({
      p0: { x: x1, y: y1 },
      m0: { x: mx1, y: my1 },
      p1: { x: x2, y: y2 },
      m1: { x: mx2, y: my2 },
      canvas: this.canvas,
    });
    c.draw();
  };

  draw() {
    this.drawDivider(this.getDivider1);
    this.drawDivider(this.getDivider2);
  }
}

export default PatchRenderer;