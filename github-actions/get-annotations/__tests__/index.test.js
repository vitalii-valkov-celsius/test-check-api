const { mergeLines, TrackLines, getUncoveredLines, getAnnotationLevel } = require("../");

describe("mergeLines", () => {
  it("should return empty array if minLine is -1", () => {
    expect(mergeLines({}, -1, -1)).toEqual([]);
  });

  it("should merge lines into one object where possible", () => {
    expect(mergeLines({ 1: true, 3: true, 4: true, 5: true, 8: true }, 1, 8)).toEqual([
      {
        start: 1,
        end: 1,
      },
      {
        start: 3,
        end: 5,
      },
      {
        start: 8,
        end: 8,
      },
    ]);
  });
});

describe("TrackLines", () => {
  it("default state", () => {
    const track = TrackLines();
    expect(track.getMinLine()).toBe(-1);
    expect(track.getMaxLine()).toBe(-1);
    expect(track.getMap()).toEqual({});
  });

  it("single line", () => {
    const track = TrackLines();
    track.push(5);
    expect(track.getMinLine()).toBe(5);
    expect(track.getMaxLine()).toBe(5);
    expect(track.getMap()).toEqual({ 5: true });
  });

  it("two lines", () => {
    const track = TrackLines();
    track.push(5);
    track.push(10);
    expect(track.getMinLine()).toBe(5);
    expect(track.getMaxLine()).toBe(10);
    expect(track.getMap()).toEqual({ 5: true, 10: true });
  });

  it("min line", () => {
    const track = TrackLines();
    track.push(5);
    track.push(10);
    track.push(4);
    expect(track.getMinLine()).toBe(4);
    expect(track.getMaxLine()).toBe(10);
  });

  it("max line", () => {
    const track = TrackLines();
    track.push(5);
    track.push(10);
    track.push(11);
    expect(track.getMinLine()).toBe(5);
    expect(track.getMaxLine()).toBe(11);
  });
});

it("getUncoveredLines", () => {
  const report = {
    statementMap: {
      0: { start: { line: 1, column: 12 }, end: { line: 3, column: 1 } },
      1: { start: { line: 2, column: 2 }, end: { line: 2, column: 15 } },
      2: { start: { line: 5, column: 17 }, end: { line: 7, column: 1 } },
      3: { start: { line: 6, column: 2 }, end: { line: 6, column: 15 } },
      4: { start: { line: 9, column: 15 }, end: { line: 12, column: 1 } },
      5: { start: { line: 10, column: 2 }, end: { line: 10, column: 23 } },
      6: { start: { line: 10, column: 14 }, end: { line: 10, column: 23 } },
      7: { start: { line: 11, column: 2 }, end: { line: 11, column: 15 } },
      8: { start: { line: 14, column: 0 }, end: { line: 14, column: 43 } },
    },
    s: { 0: 1, 1: 1, 2: 1, 3: 0, 4: 1, 5: 0, 6: 0, 7: 0, 8: 1 },
  };

  expect(getUncoveredLines(report)).toEqual([
    { end: 6, start: 6 },
    { end: 11, start: 10 },
  ]);
});

describe("getAnnotationLevel", () => {
  it("should return `failure` by default", () => {
    expect(getAnnotationLevel([], "src/file.js")).toBe("failure");
  });

  it("should return first matching glob", () => {
    expect(
      getAnnotationLevel(
        [
          { glob: "src/*.ts", level: "warning" },
          { glob: "src/**", level: "notice" },
          { glob: "src/*.js", level: "ignore" },
        ],
        "src/file.js"
      )
    ).toBe("notice");
  });
});
