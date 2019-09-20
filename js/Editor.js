let cpIdCounter = 0;

function debounce(func, wait, immediate) {
  let timeout;
  return function() {
    const context = this, args = arguments;
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

class Editor {
  constructor(initialDivisionCount, container) {
    this.container = container;
    this.divisionCount = initialDivisionCount;
    this.currentlyMovingCp = null;
    this.selectedCp = null;
    this.initControlPoints();
    this.initEventListeners();
    this.boundingRect = container.getBoundingClientRect();
    this.colorEditor = new ColorEditor(document.body, this.setColor.bind(this));
  }

  initControlPoints() {
    this.controlPointArray = [];
    this.controlPointMatrix = new Array(this.divisionCount + 1);

    for (let i = 0; i <= this.divisionCount; i++) {
      this.controlPointMatrix[i] = [];
      for (let j = 0; j <= this.divisionCount; j++) {
        const cp = {
          x: i / this.divisionCount,
          y: j / this.divisionCount,
          r: i / this.divisionCount,
          g: j / this.divisionCount,
          b: j / this.divisionCount,
          id: `control-point-${cpIdCounter++}`,
        };
        const cpObject = new ControlPoint(cp, this);
        this.container.appendChild(cpObject.element);
        this.controlPointArray.push(cpObject);
        this.controlPointMatrix[i].push(cpObject);
      }
    }
  }

  initEventListeners() {
    this.container.addEventListener('click', this.onClick.bind(this));
    this.container.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.container.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.container.addEventListener('touchend', this.onTouchEnd.bind(this));
    window.addEventListener('resize', debounce(() => {
      this.boundingRect = this.container.getBoundingClientRect();
      console.log(this.boundingRect);
    }, 500));
  }

  onMouseMove(e) {
    if (this.currentlyMovingCp) {
      const x = (e.clientX - this.boundingRect.x) / this.boundingRect.width;
      const y = (e.clientY - this.boundingRect.y) / this.boundingRect.height;
      this.currentlyMovingCp.setPosition(x, y);
    }
  }

  onClick(e) {
    if (e.target === this.container) {
      if (this.editing) {
        this.editing = false;
        this.container.classList.remove('editing');
      } else {
        this.editing = true;
        this.container.classList.add('editing');
      }
    }
  }

  onMouseUp(e) {
    this.currentlyMovingCp = null;
    if (!e.target.classList.contains('control-point') && this.selectedCp) {
      this.selectedCp.element.classList.remove('active');
      this.selectedCp = null;
    }
  }

  onTouchEnd(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  onCpMouseDown(cp) {
    this.currentlyMovingCp = cp;
    if (this.selectedCp) {
      this.selectedCp.element.classList.remove('active');
    }
    this.selectedCp = cp;
    this.selectedCp.element.classList.add('active');
    this.colorEditor.setColor(cp);
    console.log('SET CP_UNDER_EDITING', this.currentlyMovingCp.id);
  }

  setColor(color) {
    if (this.selectedCp) {
      this.selectedCp.setColor(color);
    }
  }
}