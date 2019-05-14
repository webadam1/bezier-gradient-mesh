import React from 'react';
import { parseTree } from '../../helpers';
import ControlPoint from '../../helpers/controlPoint';
import HermiteCurve from '../../helpers/hermiteCurve';

class MeshGradient extends React.Component {
  constructor(props) {
    super(props);

    this.state = { trigger: false };
    this.canvas = React.createRef();
    this.renderObjects = this.renderObjects.bind(this);
    this.ctrlPoints = [];
    this.curve = null;
    this.parsedTree = parseTree(props);
  }

  componentDidMount() {
    this.parsedTree.forEach(row => {
      row.forEach(patch => {
        patch.forEach(stop => {
          if (stop) {
            this.ctrlPoints.push(
              new ControlPoint({
                x: stop.pos.x,
                y: stop.pos.y,
                canvas: this.canvas,
                color: stop.color,
                handles: stop.handles.map(handle => (
                  handle ? new ControlPoint({
                    x: handle.x - stop.pos.x,
                    y: handle.y - stop.pos.y,
                    parentPosition: {...stop.pos}, 
                    canvas: this.canvas,
                    color: "#f5f5f5",
                    trigger: this.renderObjects,
                    size: 4
                  }) : null
                )),
                trigger: this.renderObjects,
              })
            );
          }
        })
      });
    });

    this.curve = new HermiteCurve({
      p0: this.ctrlPoints[0],
      m0: this.ctrlPoints[0].handles[1],
      p1: this.ctrlPoints[1],
      m1: this.ctrlPoints[1].handles[1],
      canvas: this.canvas,
    });

    this.renderObjects();
  }

  clearCanvas() {
    if (this.canvas.current) {
      const ctx = this.canvas.current.getContext('2d');
      ctx.clearRect(0, 0, this.props.width, this.props.height);
    }
  }

  renderObjects() {
    this.clearCanvas();
    if (this.canvas.current) {
      this.ctrlPoints.forEach(p => p.draw());
      this.curve.draw();
    }
  }

  render() {
    const { width, height } = this.props;
    return (
      <canvas
        ref={this.canvas}
        width={width}
        height={height}
        style={{ border: '1px solid gray' }}
      />
    )
  }
}

export default MeshGradient;
