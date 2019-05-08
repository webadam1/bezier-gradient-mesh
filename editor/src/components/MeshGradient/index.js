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
                trigger: this.renderObjects,
              })
            );
          }
        })
      })
    });

    this.renderObjects();
  }

  renderTree(tree) {
    tree.rows.forEach(row => {
      row.patches.forEach(patch => {
        patch.stops.forEach(stop => {
          console.log(stop);
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
