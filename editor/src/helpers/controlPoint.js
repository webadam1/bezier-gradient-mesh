import BoundingBox from './boundingBox';

class ControlPoint {
  constructor({ x, y, canvas, color, trigger, size }) {
    this.x = x;
    this.y = y;
    this.canvas = canvas;
    this.selected = false;
    this.move = false;
    this.radius = size || 9;
    this.lineWidth = 1;
    this.strokeStyle = "#111";
    this.fillStyle = color;
    this.render = trigger;
    this.boundingBox = new BoundingBox({
      x: x - this.radius,
      y: y - this.radius,
      width: this.radius * 2,
      height: this.radius * 2,
    });
    this.onClick = this.onClick.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);

    this.canvas.current.addEventListener('click', this.onClick);
    this.canvas.current.addEventListener('mousemove', this.onMove);
    this.canvas.current.addEventListener('mousedown', this.onMouseDown);
  }

  onClick(e) {
    const x = e.clientX - e.target.offsetTop;
    const y = e.clientY - e.target.offsetLeft;

    if (this.move) {
      this.move = false;
      return null;
    }

    if (this.boundingBox.contains({ x, y })) {
      this.selected = true;
      this.boundingBox.set({ x: x - this.radius, y: y - this.radius });
    } else {
      this.selected = false;
    }

    this.render();
  }

  onMouseDown(e) {
    const x = e.clientX - e.target.offsetTop;
    const y = e.clientY - e.target.offsetLeft;

    if (this.selected && this.boundingBox.contains({ x, y })) {
      this.move = true;
    }
  }

  onMove(e) {
    const x = e.clientX - e.target.offsetTop;
    const y = e.clientY - e.target.offsetLeft;

    if (this.move) {
      this.x = x;
      this.y = y;
      this.boundingBox.set({ x: x - this.radius, y: y - this.radius });
      this.render();
    }
  }

  draw() {
    if (this.selected) {
      this.drawRect();
    } else {
      this.drawCircle();
    }
  }

  drawCircle() {
    const fullCircle = 2 * Math.PI;
    const ctx = this.canvas.current.getContext('2d');
    ctx.translate(-0.5, -0.5);

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, fullCircle);
    ctx.fillStyle = this.fillStyle;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, fullCircle);
    ctx.strokeStyle = this.strokeStyle;
    ctx.lineWidth = this.lineWidth;
    ctx.stroke();

    ctx.translate(0.5, 0.5);
  }

  drawRect() {
    const radius = this.radius * 1.2;
    const ctx = this.canvas.current.getContext('2d');
    ctx.translate(-0.5, -0.5);
    
    ctx.beginPath();
    ctx.fillStyle = this.fillStyle;
    ctx.moveTo(this.x, this.y - radius);
    ctx.lineTo(this.x + radius, this.y);
    ctx.lineTo(this.x, this.y + radius);
    ctx.lineTo(this.x - radius, this.y);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = this.strokeStyle;
    ctx.lineWidth = this.lineWidth;
    ctx.moveTo(this.x, this.y - radius);
    ctx.lineTo(this.x + radius, this.y);
    ctx.lineTo(this.x, this.y + radius);
    ctx.lineTo(this.x - radius, this.y);
    ctx.closePath();
    ctx.stroke();

    ctx.translate(0.5, 0.5);
  }
}

export default ControlPoint;