import React from 'react';

const SIZE = 10;

class Anchor extends React.Component {
  constructor(props) {
    super(props);
    this.isEditing = false;

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
  }

  componentWillMount() {
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
  }

  onMouseDown() {
    this.isEditing = true;
  }
  
  onMouseMove(e) {
    const { onChange } = this.props;
    if (this.isEditing) {
      onChange({
        x1: e.clientX - SIZE / 2,
        y1: e.clientY - SIZE / 2,
      });
    }
  }

  onMouseUp() {
    this.isEditing = false;
  }

  render() {
    const { x, y } = this.props;
    return (
      <circle
        r={SIZE} 
        cx={x}
        cy={y}
        onMouseDown={this.onMouseDown}
      />
    )
  }
}

export default Anchor;