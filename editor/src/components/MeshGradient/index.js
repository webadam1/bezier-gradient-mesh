import React from 'react';
import { parseTree } from '../../helpers';
import ControlPoint from '../../helpers/controlPoint';

class MeshGradient extends React.Component {
  constructor(props) {
    super(props);

    this.state = { trigger: false };
    this.canvas = React.createRef();
    this.renderObjects = this.renderObjects.bind(this);
    this.ctrlPoints = [];
  }

  componentDidMount() {
    this.ctrlPoints = [
      new ControlPoint({
        x: 100,
        y: 100,
        canvas: this.canvas,
        color: "#F00",
        trigger: this.renderObjects,
      }),
      new ControlPoint({
        x: 200,
        y: 300,
        canvas: this.canvas,
        color: "#0F0",
        trigger: this.renderObjects,
      }),
    ];
    this.renderObjects();
  }

  renderTree(tree) {
    tree.rows.forEach(row => {
      row.patches.forEach(patch => {
        patch.stops.forEach(stop => {
          
        });
      });
    });
  }

  clearCanvas() {
    if (this.canvas.current) {
      const ctx = this.canvas.current.getContext('2d');
      ctx.clearRect(0, 0, this.props.width, this.props.height);
    }
  }

  renderObjects() {
    this.clearCanvas();
    this.ctrlPoints.forEach(p => p.draw());
  }

  render() {
    const { width, height } = this.props;
    console.log('CANVAS')
    return (
      <canvas
        ref={this.canvas}
        width={width}
        height={height}
        style={{ border: '1px solid red' }}
      />
    )
  }
}

export default MeshGradient;
