export type Position = {
  x: number;
  y: number;

}

export type Relative = {
  relativeX: number;
  relativeY: number;
};

export type Offset = {
  offsetX: number;
  offsetY: number;
}

export type RelPosition = Position & Relative;
