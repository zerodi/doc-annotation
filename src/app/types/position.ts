export interface Position {
  x: number;
  y: number;
}

export interface Relative {
  relativeX: number;
  relativeY: number;
}

export interface RelativeRect extends Relative {
  relativeWidth: number;
  relativeHeight: number;
}

export interface Offset {
  offsetX: number;
  offsetY: number;
}

export interface RelPosition extends Relative, Position {}
