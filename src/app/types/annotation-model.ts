import { RelativeRect } from './position';

export interface AnnotationModel {
  id: string;
  rect: RelativeRect;
  text: string;
}
