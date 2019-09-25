class ControlPoint {
  constructor({ x, y, r, g, b, a = 1, id, xTangentLength = 0, yTangentLength = 0 }, editor) {
    this.editor = editor;
    this.x = x;
    this.y = y;
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
    this.id = id;
    this.xTangent = { x: xTangentLength, y: 0 };
    this.yTangent = { x: 0, y: yTangentLength };
    this.initializeDom();
  }

  initializeDom() {
    this.element = document.createElement('div');
    this.element.classList.add('control-point');
    this.element.setAttribute('style', `top: ${100 * this.y}%; left: ${100 * this.x}%;`);
    this.element.addEventListener('mousedown', this.onMouseDown.bind(this));
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    if (this.element) {
      this.element.setAttribute('style', `top: ${100 * y}%; left: ${100 * x}%;`);
    }
  }

  setColor({ r, g, b, a = 1 }) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  onMouseDown() {
    this.editor.onCpMouseDown(this);
  }
}