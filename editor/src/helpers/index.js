import { NAMES, SUPPORTED_PATH_COMMANDS } from './constants';

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
  const handles = [null, null, null, null];

  for (let i = 0; i < rows.length; i++) {
    const patches = rows[i].props.children.filter(p => isPatch(p));
    // console.log('--- ROWS ---')
    if (!result[i]) result[i] = [];

    for (let j = 0; j < patches.length; j++) {
      const stops = patches[j].props.children.filter(s => isStop(s));
      // console.log('--- PATCHES ---')
      if (!result[i][j]) result[i][j] = [];
      
      let lastStop = { x, y };
      for (let k = 0; k < stops.length; k++) {
        // console.log('--- STOPS ---')
        if (!result[i][j][k]) result[i][j][k] = [];
        const color = stops[k].props.stopColor;
        const path = stops[k].props.path;
        const parsed = parsePath(path);

        // FIRST PATCH
        if (i === 0 && j == 0) {
          // FIRST STOP
          if (k === 0) {
            result[i][j][k] = {
              pos: { x, y },
              color,
              handles,
            }
          } else {
            result[i][j][k] = {
              pos: {...lastStop},
              color,
              handles,
            }
          }
          if (parsed[2]) {
            lastStop = {
              x: lastStop.x + parsed[2][0],
              y: lastStop.y + parsed[2][1]
            }
          }
          continue;
        }

        // FIRST ROW
        if (i === 0) {
          // FIRST STOP
          if (k === 0) {
            result[i][j][0] = null;
            const refStop = {...result[i][j - 1][1].pos}
            lastStop = {
              x: refStop.x + parsed[2][0],
              y: refStop.y + parsed[2][1]
            }
          } else if (parsed[2]) {
            lastStop = {
              x: lastStop.x + parsed[2][0],
              y: lastStop.y + parsed[2][1]
            }
          }

          if (k === 2) {
            result[i][j][k + 1] = null;
          } else {
            result[i][j][k + 1] = {
              pos: {...lastStop},
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

            lastStop = {
              x: refStop.x + parsed[2][0],
              y: refStop.y + parsed[2][1]
            }
          } else if (parsed[2]) {
            lastStop = {
              x: lastStop.x + parsed[2][0],
              y: lastStop.y + parsed[2][1]
            }
          }

          if (k === 1) {
            result[i][j][1] = null;
          }

          if (k === 0 || k === 1) {
            result[i][j][k + 2] = {
              pos: {...lastStop},
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

            lastStop = {
              x: refStop.x + parsed[2][0],
              y: refStop.y + parsed[2][1]
            }
            
            result[i][j][k + 2] = {
              pos: {...lastStop},
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