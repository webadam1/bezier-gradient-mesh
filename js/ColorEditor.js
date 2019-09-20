function createInput(onChange) {
  const input = document.createElement('input');
  input.setAttribute('type', 'number');
  input.setAttribute('max', '255');
  input.setAttribute('min', '0');
  input.setAttribute('value', '255');
  input.addEventListener('keydown', e => {
    e.stopPropagation();
  });
  input.addEventListener('change', e => {
    onChange(e);
  });
  return input;
}

class ColorEditor {
  constructor(container, onSetColor) {
    this.color = { r: 1, g: 1, b: 1, a: 1 };
    this.onSetColor = onSetColor;
    this.container = container;
    this.initDomElement();
  }

  initDomElement() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('color-editor');
    this.indicator = document.createElement('div');
    this.indicator.classList.add('color-editor__indicator');
    this.inputs = {
      r: createInput((e) => this.setColorAttribute('r', e.target.value / 255)),
      g: createInput((e) => this.setColorAttribute('g', e.target.value / 255)),
      b: createInput((e) => this.setColorAttribute('b', e.target.value / 255)),
      a: createInput((e) => this.setColorAttribute('b', e.target.value)),
    };
    this.wrapper.appendChild(this.indicator);
    this.wrapper.appendChild(this.inputs.r);
    this.wrapper.appendChild(this.inputs.g);
    this.wrapper.appendChild(this.inputs.b);
    this.container.appendChild(this.wrapper);
  }

  setColorAttribute(attr, value) {
    this.color[attr] = value;
    this.setColor(this.color);
  }

  setColor(color) {
    console.log(color);
    this.color = color;
    this.onSetColor(color);
    this.indicator.setAttribute('style', `background-color: rgba(${color.r * 255},${color.g * 255},${color.b * 255},${color.a})`)
  }
}