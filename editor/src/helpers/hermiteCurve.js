class HermiteCurve {
  constructor({ p0, m0, p1, m1, canvas }) {
    this.canvas = canvas;
    this.p0 = p0;
    this.m0 = m0;
    this.p1 = p1;
    this.m1 = m1;
    this.DIV = 20;

    this.draw = this.draw.bind(this);
  }

  draw() {
    const ctx = this.canvas.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(this.p0.x, this.p0.y);
    
    for(let j = 0; j < this.DIV + 1; j++) {
      const ratio = j / this.DIV;
      const x = this.p0.x + HermiteCurve.interpolate(
        ratio,
        this.p0.x,
        this.m0.x,
        this.p1.x,
        -this.m1.x,
      );
      const y = this.p0.y + HermiteCurve.interpolate(
        ratio,
        this.p0.y,
        this.m0.y,
        this.p1.y,
        -this.m1.y,
      );
      ctx.lineTo(x, y);
    }
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  static interpolate(t, p0, m0, p1, m1) {
    return (
      (2 * (t ** 3) - 3 * (t ** 2)) * p0 + 
      ((t ** 3) - 2 * (t ** 2) + t) * m0 + 
      (-2 * (t ** 3) + 3 * (t ** 2)) * p1 +
      (t ** 3 - t ** 2) * m1
    );
  }
}

export default HermiteCurve;