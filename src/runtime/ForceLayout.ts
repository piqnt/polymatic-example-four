/*
 * Force layout implementation, based on D3
 * Copyright (c) 2013, Michael Bostock
 * Released under the ISC License
 */

interface ForceLayoutVertex {
  x: number;
  y: number;

  py?: number;
  px?: number;
  weight?: number;
  fixed?: boolean;
  index?: number;
}

interface ForceLayoutEdge {
  source: ForceLayoutVertex;
  target: ForceLayoutVertex;
}

export class ForceLayout {
  _size = [1, 1];
  _friction = 0.9;
  _edgeDistance: number | (() => number) = 20;
  _edgeStrength: number | (() => number) = 1;
  _charge: number | (() => number) = -30;
  _gravity = 0.1;
  _theta = 0.8;
  _minAlpha = 0.005;

  _vertices: ForceLayoutVertex[];
  _edges: ForceLayoutEdge[];

  _alpha: number;
  _distances: number[];
  _strengths: number[];
  _charges: number[];
  _quad: QuadTree;

  constructor(vertices: ForceLayoutVertex[], edges: ForceLayoutEdge[]) {
    this._vertices = vertices;
    this._edges = edges;
  }

  onStart(n: number) {
    // to be implemented by user
  }

  onTick(n: number) {
    // to be implemented by user
  }

  onEnd(n: number) {
    // to be implemented by user
  }

  start() {
    const ns = this._vertices.length;
    const ls = this._edges.length;
    const w = this._size[0];
    const h = this._size[1];

    let i: number;
    let j: number;

    for (i = 0; i < ns; ++i) {
      const o = this._vertices[i];
      o.index = i;
      o.weight = 0;
    }

    for (i = 0; i < ls; ++i) {
      const o = this._edges[i];
      if (typeof o.source == "number") o.source = this._vertices[o.source];
      if (typeof o.target == "number") o.target = this._vertices[o.target];
      ++o.source.weight;
      ++o.target.weight;
    }

    for (i = 0; i < ns; ++i) {
      const o = this._vertices[i];
      if (isNaN(o.x)) o.x = position("x", w);
      if (isNaN(o.y)) o.y = position("y", h);
      if (isNaN(o.px)) o.px = o.x;
      if (isNaN(o.py)) o.py = o.y;
    }

    this._distances = [];
    if (typeof this._edgeDistance === "function") {
      for (i = 0; i < ls; ++i) {
        this._distances[i] = +this._edgeDistance.call(this, this._edges[i], i);
      }
    } else {
      for (i = 0; i < ls; ++i) {
        this._distances[i] = this._edgeDistance;
      }
    }

    this._strengths = [];
    if (typeof this._edgeStrength === "function") {
      for (i = 0; i < ls; ++i) {
        this._strengths[i] = +this._edgeStrength.call(this, this._edges[i], i);
      }
    } else {
      for (i = 0; i < ls; ++i) {
        this._strengths[i] = this._edgeStrength;
      }
    }

    this._charges = [];
    if (typeof this._charge === "function") {
      for (i = 0; i < ns; ++i) {
        this._charges[i] = +this._charge.call(this, this._vertices[i], i);
      }
    } else {
      for (i = 0; i < ns; ++i) {
        this._charges[i] = this._charge;
      }
    }

    // initialize edge position based on first neighbor
    function position(dimension: string, size: number) {
      const neighbors = neighbor(i);
      let j = -1;
      const m = neighbors.length;
      let x: number;
      while (++j < m) {
        if (!isNaN((x = neighbors[j][dimension]))) {
          return x;
        }
      }
      return Math.random() * size;
    }

    // initialize neighbors lazily
    let neighbors: ForceLayoutVertex[][];
    function neighbor(i?: number) {
      if (!neighbors) {
        neighbors = [];
        for (j = 0; j < ns; ++j) {
          neighbors[j] = [];
        }
        for (j = 0; j < ls; ++j) {
          const o = this._edges[j];
          neighbors[o.source.index].push(o.target);
          neighbors[o.target.index].push(o.source);
        }
      }
      return neighbors[i];
    }

    return this.resume();
  }

  tick() {
    // simulated annealing, basically
    if ((this._alpha *= 0.99) < this._minAlpha) {
      this.onEnd((this._alpha = 0));
      return true;
    }

    const ns = this._vertices.length;
    const ls = this._edges.length;

    // temp index, source, target, distance, force, x, y
    // let i, s, t, l, k, x, y;

    // gauss-seidel relaxation for edges
    for (let i = 0; i < ls; ++i) {
      const o = this._edges[i];
      const s = o.source;
      const t = o.target;
      let x = t.x - s.x;
      let y = t.y - s.y;
      let l = x * x + y * y;
      if (l) {
        l = (this._alpha * this._strengths[i] * ((l = Math.sqrt(l)) - this._distances[i])) / l;
        x *= l;
        y *= l;
        let k = s.weight / (t.weight + s.weight);
        t.x -= x * k;
        t.y -= y * k;
        k = 1 - k;
        s.x += x * k;
        s.y += y * k;
      }
    }

    // apply gravity forces
    const k = this._alpha * this._gravity;
    if (k) {
      const x = this._size[0] / 2;
      const y = this._size[1] / 2;
      let i = -1;
      if (k)
        while (++i < ns) {
          const o = this._vertices[i];
          o.x += (x - o.x) * k;
          o.y += (y - o.y) * k;
        }
    }

    // compute quadtree center of mass and apply charge forces
    if (this._charge) {
      this._quad = new QuadTree(this._vertices);
      this.accumulate(this._quad);
      let i = -1;
      while (++i < ns) {
        const o = this._vertices[i];
        if (!o.fixed) {
          this._quad.visit(this.repulse(o));
        }
      }
    }

    // position verlet integration
    let i = -1;
    while (++i < ns) {
      const o = this._vertices[i];
      if (o.fixed) {
        o.x = o.px;
        o.y = o.py;
      } else {
        o.x -= (o.px - (o.px = o.x)) * this._friction;
        o.y -= (o.py - (o.py = o.y)) * this._friction;
      }
    }

    this.onTick(this._alpha);
  }

  alpha(alpha?: number) {
    if (!arguments.length) return this._alpha;

    alpha = +alpha;
    if (this._alpha) {
      // if we"re already running
      if (alpha > 0)
        this._alpha = alpha; // we might keep it hot
      else this._alpha = 0; // or, next tick will dispatch "end"
    } else if (alpha > 0) {
      // otherwise, fire it up!
      this.onStart((this._alpha = alpha));
      // timer(this.tick);
    }

    return this;
  }

  resume() {
    return this.alpha(0.1);
  }

  stop() {
    return this.alpha(0);
  }

  getSize() {
    return this._size;
  }

  setSize(size) {
    this._size = size;
    return this;
  }

  getEdgeDistance() {
    return this._edgeDistance;
  }
  setEdgeDistance(edgeDistance) {
    this._edgeDistance = typeof edgeDistance === "function" ? edgeDistance : +edgeDistance;
    return this;
  }

  getEdgeStrength() {
    return this._edgeStrength;
  }
  setEdgeStrength(edgeStrength) {
    this._edgeStrength = typeof edgeStrength === "function" ? edgeStrength : +edgeStrength;
    return this;
  }

  getFriction() {
    return this._friction;
  }
  setFriction(friction) {
    this._friction = +friction;
    return this;
  }

  getCharge() {
    return this._charge;
  }
  setCharge(charge) {
    this._charge = typeof charge === "function" ? charge : +charge;
    return this;
  }

  getGravity() {
    return this._gravity;
  }
  setGravity(gravity) {
    this._gravity = +gravity;
    return this;
  }

  getTheta() {
    return this._theta;
  }
  setTheta(theta) {
    this._theta = +theta;
    return this;
  }

  getMinAlpha() {
    return this._minAlpha;
  }
  setMinAlpha(minAlpha) {
    this._minAlpha = +minAlpha;
    return this;
  }

  accumulate(quad: QuadTree) {
    let cx = 0;
    let cy = 0;
    quad.charge = 0;
    if (!quad.leaf) {
      // edge
      const edges = quad.quads;
      const n = edges.length;
      let i = -1;
      let child;
      while (++i < n) {
        child = edges[i];
        if (child) {
          this.accumulate(child);
          quad.charge += child.charge;
          cx += child.charge * child.cx;
          cy += child.charge * child.cy;
        }
      }
    }
    if (quad.point) {
      // jitter internal edges that are coincident
      if (!quad.leaf) {
        quad.point.x += Math.random() - 0.5;
        quad.point.y += Math.random() - 0.5;
      }
      const pc = this._alpha * this._charges[quad.point.index];
      quad.charge += quad.pointCharge = pc;
      cx += pc * quad.point.x;
      cy += pc * quad.point.y;
    }
    quad.cx = cx / quad.charge;
    quad.cy = cy / quad.charge;
  }

  repulse(vertex: ForceLayoutVertex) {
    return (quad: QuadTree, x1: number, y1: number, x2: number, y2: number) => {
      if (quad.point !== vertex) {
        const dx = quad.cx - vertex.x,
          dy = quad.cy - vertex.y,
          dn = 1 / Math.sqrt(dx * dx + dy * dy);

        /* Barnes-Hut criterion. */
        if ((x2 - x1) * dn < this._theta) {
          const k = quad.charge * dn * dn;
          vertex.px -= dx * k;
          vertex.py -= dy * k;
          return true;
        }

        if (quad.point && isFinite(dn)) {
          const k = quad.pointCharge * dn * dn;
          vertex.px -= dx * k;
          vertex.py -= dy * k;
        }
      }
      return !quad.charge;
    };
  }
}

class QuadTree {
  leaf: boolean;
  quads = [];
  point: ForceLayoutVertex;
  x: number;
  y: number;
  charge: number;
  pointCharge: number;
  cx: number;
  cy: number;

  constructor(data?: ForceLayoutVertex[]) {
    this.leaf = true;
    this.quads = null;
    this.point = null;
    this.x = null;
    this.y = null;

    if (data) {
      let d: ForceLayoutVertex;
      let i: number;
      const n = data.length;
      let x1: number;
      let y1: number;
      let x2: number;
      let y2: number;

      x2 = y2 = -(x1 = y1 = Infinity);

      // compute bounds
      for (i = 0; i < n; i++) {
        d = data[i];
        if (d.x < x1) x1 = d.x;
        if (d.y < y1) y1 = d.y;
        if (d.x > x2) x2 = d.x;
        if (d.y > y2) y2 = d.y;
      }

      // squarify bounds
      const dx = x2 - x1;
      const dy = y2 - y1;
      if (dx > dy) {
        y2 = y1 + dx;
      } else {
        x2 = x1 + dy;
      }

      for (i = 0; i < n; i++) {
        d = data[i];
        this.insert(d, d.x, d.y, x1, y1, x2, y2);
      }
    }
  }

  visit(
    f: (q: QuadTree, x1: number, y1: number, x2: number, y2: number) => boolean,
    x1?: number,
    y1?: number,
    x2?: number,
    y2?: number,
  ) {
    if (f(this, x1, y1, x2, y2)) {
      return;
    }
    if (this.quads) {
      const sx = (x1 + x2) * 0.5;
      const sy = (y1 + y2) * 0.5;
      const children = this.quads;
      children[0] && children[0].visit(f, x1, y1, sx, sy);
      children[1] && children[1].visit(f, sx, y1, x2, sy);
      children[2] && children[2].visit(f, x1, sy, sx, y2);
      children[3] && children[3].visit(f, sx, sy, x2, y2);
    }
  }

  insert(d: ForceLayoutVertex, x: number, y: number, x1: number, y1: number, x2: number, y2: number) {
    if (isNaN(x) || isNaN(y)) return; // ignore invalid points

    if (!this.leaf) {
      this.insertChild(d, x, y, x1, y1, x2, y2);
    } else if (this.x == null) {
      this.x = x;
      this.y = y;
      this.point = d;
    } else if (Math.abs(this.x - x) + Math.abs(this.y - y) < 0.01) {
      // avoids infinite recursion(?)
      this.insertChild(d, x, y, x1, y1, x2, y2);
    } else {
      const nx = this.x;
      const ny = this.y;
      const nd = this.point;
      this.x = this.y = this.point = null;
      this.insertChild(nd, nx, ny, x1, y1, x2, y2);
      this.insertChild(d, x, y, x1, y1, x2, y2);
    }
  }

  insertChild(d: ForceLayoutVertex, x: number, y: number, x1: number, y1: number, x2: number, y2: number) {
    this.leaf = false;

    // split point and the quadrant
    const sx = (x1 + x2) * 0.5,
      sy = (y1 + y2) * 0.5;
    const right = x >= sx ? 1 : 0;
    const bottom = y >= sy ? 1 : 0;
    const i = (bottom << 1) + right;

    this.quads = this.quads || [];
    // next/new quad and bounds
    const child = this.quads[i] || (this.quads[i] = new QuadTree());
    if (right) x1 = sx;
    else x2 = sx;
    if (bottom) y1 = sy;
    else y2 = sy;

    child.insert(d, x, y, x1, y1, x2, y2);
  }
}
