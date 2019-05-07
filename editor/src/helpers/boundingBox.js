class BoundingBox {
  constructor({ x, y, width, height }) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
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

  debug() {
    console.log({ x: this.x, y: this.y })
  }
}

export default BoundingBox;