import { NAMES } from './constants';

const isComponent = name => item => item.type && item.type.name === name;

const isRow = isComponent(NAMES.MESH_ROW);

const isPatch = isComponent(NAMES.MESH_PATCH);

const isStop = isComponent(NAMES.MESH_STOP);

const parsePath = path => {
  return path
    .replace(/,\s/g, ',')
    .trim()
    .split(' ')
    .filter(v => v !== 'c')
    .map(v => v
      .split(',')
      .map(v => parseInt(v)))
}

const parseRows = ({ rows, x, y }) => {
  rows = rows.filter(r => isRow(r));
  let result = [];
  // TODO

  for (let i = 0; i < rows.length; i++) {
    const patches = rows[i].props.children.filter(p => isPatch(p));
    // console.log('--- ROWS ---')
    if (!result[i]) result[i] = [];

    for (let j = 0; j < patches.length; j++) {
      const stops = patches[j].props.children.filter(s => isStop(s));
      // console.log('--- PATCHES ---')
      if (!result[i][j]) result[i][j] = [];
      
      let nextStop = { x, y };
      let lastStop = null;
      let lastParsed = null;
      for (let k = 0; k < stops.length; k++) {
        // console.log('--- STOPS ---')
        if (!result[i][j][k]) result[i][j][k] = [];
        const color = stops[k].props.stopColor;
        const path = stops[k].props.path;
        const parsed = parsePath(path);
        let handles = [null, null, null, null];

        // FIRST PATCH
        if (i === 0 && j === 0) {
          // FIRST STOP
          if (k === 0) {
            handles[1] = {
              x: x + parsed[0][0],
              y: y + parsed[0][1],
            };
            result[i][j][k] = {
              pos: { x, y },
              color,
              handles,
            }
          } else {
            if (k === 1) {
              handles[2] = {
                x: nextStop.x + parsed[0][0],
                y: nextStop.y + parsed[0][1],
              };
              handles[3] = {
                x: lastStop.x + lastParsed[1][0],
                y: lastStop.y + lastParsed[1][1],
              };
            } else if (k === 2) {
              handles[3] = {
                x: nextStop.x + parsed[0][0],
                y: nextStop.y + + parsed[0][1],
              };
              handles[0] = {
                x: lastStop.x + lastParsed[1][0],
                y: lastStop.y + lastParsed[1][1],
              };
            } else {
              handles[0] = {
                x: nextStop.x + parsed[0][0],
                y: nextStop.y + parsed[0][1],
              };
              handles[1] = {
                x: lastStop.x + lastParsed[1][0],
                y: lastStop.y + lastParsed[1][1],
              };
              result[i][j][0].handles[2] = {
                x: nextStop.x + parsed[1][0],
                y: nextStop.y + parsed[1][1],
              }
            }
            result[i][j][k] = {
              pos: {...nextStop},
              color,
              handles,
            }
          }
          if (parsed[2]) {
            lastStop = {...nextStop};
            nextStop = {
              x: nextStop.x + parsed[2][0],
              y: nextStop.y + parsed[2][1]
            }
          }
          lastParsed = parsed;
          continue;
        }

        // FIRST ROW
        if (i === 0) {
          // FIRST STOP
          if (k === 0) {
            result[i][j][0] = null;
            const refStop = {...result[i][j - 1][1].pos}
            nextStop = {
              x: refStop.x + parsed[2][0],
              y: refStop.y + parsed[2][1]
            }
          } else if (parsed[2]) {
            nextStop = {
              x: nextStop.x + parsed[2][0],
              y: nextStop.y + parsed[2][1]
            }
          }

          if (k === 2) {
            result[i][j][k + 1] = null;
          } else {
            result[i][j][k + 1] = {
              pos: {...nextStop},
              color: stops[k + 1].props.stopColor,
              handles,
            }
          }
          continue;
        }

        // FIRST COLUMN
        if (j === 0) {
          // FIRST STOP
          if (k === 0) {
            result[i][j][0] = null;
            const refStop = {...result[i - 1][j][2].pos}

            nextStop = {
              x: refStop.x + parsed[2][0],
              y: refStop.y + parsed[2][1]
            }
          } else if (parsed[2]) {
            nextStop = {
              x: nextStop.x + parsed[2][0],
              y: nextStop.y + parsed[2][1]
            }
          }

          if (k === 1) {
            result[i][j][1] = null;
          }

          if (k === 0 || k === 1) {
            result[i][j][k + 2] = {
              pos: {...nextStop},
              color: stops[k + 1] && stops[k + 1].props.stopColor,
              handles,
            }
          }
          continue;
        }

        // OTHER
        if (i > 0 && j > 0) {
          if (k === 0) {
            result[i][j][0] = null;
            const refStop = {...result[i - 1][j][2].pos}

            nextStop = {
              x: refStop.x + parsed[2][0],
              y: refStop.y + parsed[2][1]
            }
            
            result[i][j][k + 2] = {
              pos: {...nextStop},
              color: stops[k + 1] && stops[k + 1].props.stopColor,
              handles,
            }
          }

          if (k === 1) {
            result[i][j][1] = null;
            result[i][j][3] = null;
          }
        }
      }
    }
  }
  
  console.log(result);

  return result;
}

export const parseTree = (reactTree) => {
  try {
    const x = parseInt(reactTree.x) || 0;
    const y = parseInt(reactTree.y) || 0;
    return parseRows({ 
      rows: reactTree.children,
      x,
      y,
    });
  } catch (err) {
    console.error(err)
  }
}