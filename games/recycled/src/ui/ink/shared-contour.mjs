// Supply the two hexCorners(x, y, SIZE) strings from the game's existing board
// transform. Full cell size is needed so neighbouring corners meet.
export function sharedContour(first, second) {
  const parse = text => text.trim().split(/\s+/).map(pair => pair.split(',').map(Number));
  const a = parse(first);
  const b = parse(second);
  const near = (p, q) => Math.hypot(p[0]-q[0], p[1]-q[1]) < 0.035;
  if (a.length !== 6 || b.length !== 6) throw new Error('Expected two pointy-top hexagons');
  for (let i = 0; i < 6; i++) {
    const j = b.findIndex((point, k) => near(point, a[(i+1)%6]) && near(b[(k+1)%6], a[i]));
    if (j === -1) continue;
    const points = Array.from({length:6}, (_, n) => a[(i+1+n)%6]);
    for (let n = 2; n < 6; n++) points.push(b[(j+n)%6]);
    return 'M' + points.map(p => p.join(',')).join(' L') + ' Z';
  }
  throw new Error('Expected adjacent cells with one shared edge');
}
