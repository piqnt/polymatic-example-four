// Copyright (c) Ali Shakiba
// Licensed under the MIT License

// todo: move this to Graph
export const Config = {
  get scale() {
    return 1;
  },
  get vertexRadius() {
    return 14 * this.scale;
  },
  get vertexSnap() {
    return this.vertexRadius * 2;
  },
  get vertexMark() {
    return this.vertexRadius * 5;
  },
  get distRange() {
    return 50 * this.scale;
  },
  get distOffset() {
    return 100 * this.scale;
  },
};
