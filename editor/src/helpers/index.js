import { NAMES } from './constants';

const isComponent = name => item => item.type && item.type.name === name;

const isRow = isComponent(NAMES.MESH_ROW);

const isPatch = isComponent(NAMES.MESH_PATCH);

const isStop = isComponent(NAMES.MESH_STOP);

const parseStops = ({ stops, rowInd, colInd, topPatch, leftPatch }) => {
  return stops
    .filter(stop => isStop(stop))
    .reduce((result, stop, stopInd, filteredStops) => {
      // First patch
      if (rowInd === 0 && colInd === 0) {
        result.push({
          color: stop.props.stopColor,
          path: stop.props.path,
        });
      // Patches in first row
      } else if (rowInd === 0) {
        if (filteredStops.length > 3) {
          throw new Error('In the first row patches should contain maximum of three stops except the first patch');
        }

        let color = stop.props.stopColor;
        if (stopInd === 0) {
          color = leftPatch.props.children[1].props.stopColor
        }
        
        result.push({
          color,
          path: stop.props.path,
        });

        if (stopInd === 2) {
          result.push({
            color: leftPatch.props.children[2].props.stopColor,
            path: leftPatch.props.children[2].props.path, // TODO: reverse path
          });
        }
      // Patches in first column
      } else if (colInd === 0) {
        if (filteredStops.length > 3) {
          throw new Error('In the first column patches should contain maximum of three stops except the first patch');
        }

        if (stopInd === 0) {
          result.push({
            color: topPatch.props.children[2].props.stopColor,
            path: topPatch.props.children[2].props.path, // TODO: reverse path
          });
        }

        let color = stop.props.stopColor;
        if (stopInd === 0) {
          color = topPatch.props.children[2].props.stopColor
        }

        result.push({
          color,
          path: stop.props.path,
        });
      // Every other patch
      } else {
        if (filteredStops.length > 2) {
          throw new Error('An average patch should contain maximum of two stops except the first row | colums');
        }

        if (stopInd === 0) {
          result.push({
            color: topPatch.props.children[2].props.stopColor,
            path: topPatch.props.children[2].props.path, // TODO: reverse path
          });
        }

        let color = stop.props.stopColor;
        if (stopInd === 0) {
          color = topPatch.props.children[2].props.stopColor
        }

        result.push({
          color,
          path: stop.props.path,
        });

        if (stopInd === 1) {
          result.push({
            color: leftPatch.props.children[2].props.stopColor,
            path: leftPatch.props.children[2].props.path, // TODO: reverse path
          });
        }
      }
      return result;
    }, []);
}

const parsePatches = ({ patches, rowInd, topRow }) => {
  return patches
    .filter(patch => isPatch(patch))
    .map((patch, colInd) => ({
      stops: parseStops({
        stops: patch.props.children,
        rowInd,
        colInd,
        topPatch: topRow && topRow.props.children[colInd],
        leftPatch: patches[colInd - 1],
      }),
    }));
}

const parseRows = rows => {
  return rows
    .filter(row => isRow(row))
    .map((row, index) => ({
      patches: parsePatches({
        patches: row.props.children,
        rowInd: index,
        topRow: rows[index - 1],
      })
    }));
}

export const parseTree = (reactTree) => {
  try {
    return {
      x: reactTree.x || 0,
      y: reactTree.y || 0,
      rows: parseRows(reactTree.children),
    }
  } catch (err) {
    console.error(err)
  }
}