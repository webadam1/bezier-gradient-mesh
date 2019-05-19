import React from 'react';
import { parseTree } from '../../helpers';
import ControlPoint from '../../helpers/controlPoint';
import HandlePoint from '../../helpers/handlePoint';
import HermiteCurve from '../../helpers/hermiteCurve';
import PatchRenderer from '../../helpers/patchRenderer';

class MeshGradient extends React.Component {
  constructor(props) {
    super(props);

    this.state = { trigger: false };
    this.canvas = React.createRef();
    this.renderObjects = this.renderObjects.bind(this);
    this.ctrlPoints = [];
    this.curves = [];
    this.parsedTree = parseTree(props);
  }

  componentDidMount() {
    const refs = [];
    const rows = this.parsedTree;

    for (let i = 0; i < rows.length; i++) {
      const patches = rows[i];
      if (!refs[i]) refs[i] = [];

      for (let j = 0; j < patches.length; j++) {
        const stops = patches[j];
        if (!refs[i][j]) refs[i][j] = [];

        for (let k = 0; k < stops.length; k++) {
          const stop = stops[k];
          refs[i][j][k] = null;

          if (stop) {
            const ctrlPnt = new ControlPoint({
              x: stop.pos.x,
              y: stop.pos.y,
              canvas: this.canvas,
              color: stop.color,
              trigger: this.renderObjects,
            });

            const handlePnts = stop.handles.map(handle => (
              handle ? new HandlePoint({
                x: handle.x - stop.pos.x,
                y: handle.y - stop.pos.y,
                canvas: this.canvas,
                color: "#f5f5f5",
                trigger: this.renderObjects,
                size: 4,
                parent: ctrlPnt,
              }) : null
            ));

            refs[i][j][k] = ctrlPnt;
            ctrlPnt.attachHandles(handlePnts);
            this.ctrlPoints.push(ctrlPnt);
          }
        }
      }
    }

    for (let i = 0; i < refs.length; i++) {
      const patches = refs[i];

      for (let j = 0; j < patches.length; j++) {
        const stops = patches[j];

        for (let k = 0; k < stops.length; k++) {
          const stop = stops[k];

          if (stop) {
            let curve = null;
            if (j > 0) { // patches except the first
              curve = new HermiteCurve({
                p0: patches[j - 1][k],
                m0: patches[j - 1][k].handles[1],
                p1: patches[j][k],
                m1: patches[j][k].handles[3], 
                canvas: this.canvas,
              });
              this.curves.push(curve);
            } else { // first column
              if (k === 0) {
                curve = new HermiteCurve({
                  p0: refs[i][j][k],
                  m0: refs[i][j][k].handles[1],
                  p1: refs[i][j][k + 1],
                  m1: refs[i][j][k + 1].handles[3],
                  canvas: this.canvas,
                });
                this.curves.push(curve);
              }
              if (k === 2) {
                curve = new HermiteCurve({
                  p0: refs[i][j][k],
                  m0: refs[i][j][k].handles[3],
                  p1: refs[i][j][k + 1],
                  m1: refs[i][j][k + 1].handles[1],
                  canvas: this.canvas,
                });
                this.curves.push(curve);
              }
            }
            if (i > 0) { // patches except the first
              curve = new HermiteCurve({
                p0: refs[i - 1][j][k],
                m0: refs[i - 1][j][k].handles[2],
                p1: refs[i][j][k],
                m1: refs[i][j][k].handles[0],
                canvas: this.canvas,
              });
              this.curves.push(curve);
            } else { // first row
              if (k === 1) {
                curve = new HermiteCurve({
                  p0: refs[i][j][k],
                  m0: refs[i][j][k].handles[2],
                  p1: refs[i][j][k + 1],
                  m1: refs[i][j][k + 1].handles[0],
                  canvas: this.canvas,
                });
                this.curves.push(curve);
              }
              if (k === 3) {
                curve = new HermiteCurve({
                  p0: refs[i][j][k],
                  m0: refs[i][j][k].handles[0],
                  p1: refs[i][j][0],
                  m1: refs[i][j][0].handles[2],
                  canvas: this.canvas,
                });
                this.curves.push(curve);
              }
            }
          }
        }
      }
    }
    
    this.patch = new PatchRenderer({
      patch: refs[0][0],
      canvas: this.canvas,
    });

    this.renderObjects();
  }

  clearCanvas() {
    const ctx = this.canvas.current.getContext('2d');
    ctx.clearRect(0, 0, this.props.width, this.props.height);
  }

  renderObjects() {
    if (this.canvas.current) {
      const ctx = this.canvas.current.getContext('2d');
      ctx.translate(-0.5, -0.5);
      
      this.clearCanvas();
      this.curves.forEach(c => c.draw());
      this.ctrlPoints.forEach(p => p.draw());
      // TEST
      this.patch.draw();

      ctx.translate(.5, .5);
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
