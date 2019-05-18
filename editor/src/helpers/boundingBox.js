class BoundingBox {
  constructor({ x, y, width, height, canvas, debug }) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.canvas = canvas;
    this.debug = debug;
  }

  contains({ x, y }) {
    return x > this.x
      && y > this.y
      && x < this.x + this.width
      && y < this.y + this.height
  }

  set({ x, y }) {
    this.x = x;
    this.y = y;
  }

  draw () {
    if (!this.debug) {
      return;
    }

    const ctx = this.canvas.current.getContext('2d');
    ctx.translate(-0.5, -0.5);
    
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "red";
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';
    ctx.stroke();

    ctx.translate(.5, .5);
  }
}

export default BoundingBox;