const fs = require("fs");
const path = require("path");
const minimatch = require("minimatch");

const watchFiles = ["src/utils.js"];
const rootPath = path.join(__dirname, "../..");

const TrackLines = () => {
  const uncoveredLines = {};
  let minLine = -1;
  let maxLine = -1;

  const push = (line) => {
    uncoveredLines[line] = true;
    if (minLine == -1 || line < minLine) {
      minLine = line;
    }
    if (line > maxLine) {
      maxLine = line;
    }
  };

  const getMap = () => uncoveredLines;
  const getMinLine = () => minLine;
  const getMaxLine = () => maxLine;

  return {
    push,
    getMap,
    getMinLine,
    getMaxLine,
  };
};

const mergeLines = (linesMap, minLine, maxLine) => {
  const result = [];
  if (minLine === -1) return result;

  let current = null;
  for (let i = minLine; i <= maxLine; i++) {
    if (current && !linesMap[i]) {
      current = null;
    } else if (!current && linesMap[i]) {
      current = { start: i, end: i };
      result.push(current);
    } else if (current && linesMap[i]) {
      current.end = i;
    }
  }

  return result;
};

const getAnnotationLevel = (levels, filePath) => {
  for ({ glob, level } of levels) {
    if (minimatch(filePath, glob)) {
      return level;
    }
  }
  return "failure";
};

const getUncoveredLines = (fileCoverage) => {
  const uncoveredLines = TrackLines();

  const { s: statementsCoverage, statementMap } = fileCoverage;
  Object.entries(statementsCoverage).forEach(([sId, tests]) => {
    if (tests === 0) {
      const statement = statementMap[sId];
      for (let i = statement.start.line; i <= statement.end.line; i++) {
        uncoveredLines.push(i);
      }
    }
  });

  return mergeLines(uncoveredLines.getMap(), uncoveredLines.getMinLine(), uncoveredLines.getMaxLine());
};

const getAnnotations = (levels, watchFiles) => {
  const coverage = JSON.parse(fs.readFileSync(path.join(rootPath, "coverage/json.json")));

  const annotations = [];

  Object.entries(coverage)
    .map(([filePath, fileCoverage]) => {
      return [path.relative(rootPath, filePath), fileCoverage];
    })
    .filter(([filePath]) => watchFiles.includes(filePath))
    .forEach(([filePath, fileCoverage]) => {
      if (!watchFiles.includes(filePath)) {
        return;
      }

      const level = getAnnotationLevel(levels, filePath);
      if (level === "ignore") return;

      const lines = getUncoveredLines(fileCoverage);
      lines.forEach((line) => {
        annotations.push({
          path: filePath,
          start_line: line.start,
          end_line: line.end,
          annotation_level: level,
          message: line.start == line.end ? "Uncovered line" : `Uncovered lines ${line.start}-${line.end}`,
        });
      });
    });
  return annotations;
};

module.exports = { getAnnotations, mergeLines, TrackLines, getUncoveredLines, getAnnotationLevel };
