import ControlPoint from './controlPoint';
import BoundingBox from './boundingBox';

export default class HandlePoint extends ControlPoint {
  constructor({ x, y, canvas, color, trigger, size, parent }) {
    super({ x, y, canvas, color, trigger, size });

    this.parent = parent;
    this.boundingBox = new BoundingBox({
      x: this.parent.x + x - this.radius,
      y: this.parent.y + y - this.radius,
      width: this.radius * 2,
      height: this.radius * 2,
      canvas: canvas,
      // debug: true,
    });
  }

  draw() {
    this.drawLine();
    super.draw({
      x: this.parent.x + this.x,
      y: this.parent.y + this.y,
    });
  }

  drawLine() {
    const ctx = this.canvas.current.getContext('2d');

    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.moveTo(this.parent.x, this.parent.y);
    ctx.lineTo(this.parent.x + this.x, this.parent.y + this.y);
    ctx.stroke();
    ctx.closePath();
  }

  onMove(e) {
    const x = e.clientX - e.target.offsetTop - this.parent.x;
    const y = e.clientY - e.target.offsetLeft - this.parent.y;

    if (this.move) {
      this.x = x;
      this.y = y;
      this.boundingBox.set({
        x: this.parent.x + x - this.radius,
        y: this.parent.y + y - this.radius,
      });
      this.render();
    }
  }
}