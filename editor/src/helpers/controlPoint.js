import BoundingBox from './boundingBox';

class ControlPoint {
  constructor({ x, y, canvas, color, trigger, size, handles, parentPosition }) {
    this.x = x;
    this.y = y;
    this.canvas = canvas;
    this.handles = handles;
    this.parentPosition = parentPosition;
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
    this.drawHandles = this.drawHandles.bind(this);

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
      this.updateHandles({ x: this.x, y: this.y });
      this.boundingBox.set({ x: x - this.radius, y: y - this.radius });
      this.render();
    }
  }

  draw() {
    if (this.selected) {
      this.drawRect();
      this.drawHandles();
    } else {
      this.drawHandles(); // TODO delete
      this.drawCircle();
    }
  }

  drawHandles() {
    if (this.handles) {
      this.handles.forEach(handle => handle && handle.draw());
    }
  }

  updateHandles({ x, y }) {
    this.handles.forEach(handle => {
      if (handle) {
        handle.parentPosition = { x, y }
      }
    });
  }

  drawCircle() {
    const fullCircle = 2 * Math.PI;
    const ctx = this.canvas.current.getContext('2d');
    ctx.translate(-0.5, -0.5);
    const x = this.parentPosition ? this.parentPosition.x + this.x : this.x;
    const y = this.parentPosition ? this.parentPosition.y + this.y : this.y;

    ctx.beginPath();
    ctx.arc(x, y, this.radius, 0, fullCircle);
    ctx.fillStyle = this.fillStyle;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, this.radius, 0, fullCircle);
    ctx.strokeStyle = this.strokeStyle;
    ctx.lineWidth = this.lineWidth;
    ctx.stroke();

    ctx.translate(0.5, 0.5);
  }

  drawRect() {
    const radius = this.radius * 1.2;
    const ctx = this.canvas.current.getContext('2d');
    ctx.translate(-0.5, -0.5);
    const x = this.parentPosition ? this.parentPosition.x + this.x : this.x;
    const y = this.parentPosition ? this.parentPosition.y + this.y : this.y;
    
    ctx.beginPath();
    ctx.fillStyle = this.fillStyle;
    ctx.moveTo(x, y - radius);
    ctx.lineTo(x + radius, y);
    ctx.lineTo(x, y + radius);
    ctx.lineTo(x - radius, y);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = this.strokeStyle;
    ctx.lineWidth = this.lineWidth;
    ctx.moveTo(x, y - radius);
    ctx.lineTo(x + radius, y);
    ctx.lineTo(x, y + radius);
    ctx.lineTo(x - radius, y);
    ctx.closePath();
    ctx.stroke();

    ctx.translate(0.5, 0.5);
  }
}

export default ControlPoint;