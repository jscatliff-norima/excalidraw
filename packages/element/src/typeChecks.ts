import { FONT_FAMILY } from "@excalidraw/common";

import type {
  ExcalidrawBindableElement,
  ExcalidrawElement,
  ExcalidrawGenericElement,
  ExcalidrawIframeElement,
  ExcalidrawImageElement,
  ExcalidrawLinearElement,
  ExcalidrawSelectionElement,
  ExcalidrawTextElement,
  Arrowhead,
  ExcalidrawFreeDrawElement,
  ExcalidrawRectangleElement,
  ExcalidrawEllipseElement,
  ExcalidrawDiamondElement,
  ExcalidrawFrameElement,
  ExcalidrawMagicFrameElement,
  ExcalidrawEmbeddableElement,
  ExcalidrawTextElementWithContainer,
  ExcalidrawTextContainer,
  ExcalidrawArrowElement,
  ExcalidrawHexagonElement,
} from "./types";
import { isFiniteNumber } from "@excalidraw/common";

export const isGenericElement = (
  element: ExcalidrawElement | null,
): element is ExcalidrawGenericElement => {
  return (
    element != null &&
    (element.type === "rectangle" ||
      element.type === "image" ||
      element.type === "ellipse" ||
      element.type === "diamond" ||
      element.type === "hexagon")
  );
};

export const isRectanguloidElement = (
  element: ExcalidrawElement | null,
): element is
  | ExcalidrawRectangleElement
  | ExcalidrawDiamondElement
  | ExcalidrawEllipseElement
  | ExcalidrawHexagonElement => {
  return (
    element?.type === "rectangle" ||
    element?.type === "diamond" ||
    element?.type === "ellipse" ||
    element?.type === "hexagon"
  );
};

export const isFrameLikeElement = (
  element: ExcalidrawElement | null,
): element is
  | ExcalidrawRectangleElement
  | ExcalidrawDiamondElement
  | ExcalidrawEllipseElement
  | ExcalidrawHexagonElement
  | ExcalidrawFrameElement
  | ExcalidrawMagicFrameElement => {
  return (
    element?.type === "rectangle" ||
    element?.type === "diamond" ||
    element?.type === "ellipse" ||
    element?.type === "hexagon" ||
    element?.type === "frame" ||
    element?.type === "magicframe"
  );
};

export const isTextElement = (
  element: ExcalidrawElement | null,
): element is ExcalidrawTextElement => {
  return element != null && element.type === "text";
};

export const isFrameElement = (
  element: ExcalidrawElement | null,
): element is ExcalidrawFrameElement => {
  return element != null && element.type === "frame";
};

export const isMagicFrameElement = (
  element: ExcalidrawElement | null,
): element is ExcalidrawMagicFrameElement => {
  return element != null && element.type === "magicframe";
};

export const isFreeDrawElement = (
  element?: ExcalidrawElement | null,
): element is ExcalidrawFreeDrawElement => {
  return element?.type === "freedraw";
};

export const isFreeDrawScene = (
  elements: readonly ExcalidrawElement[],
): boolean => {
  return elements.length > 0 && elements.every((el) => isFreeDrawElement(el));
};

export const isLinearElement = (
  element?: ExcalidrawElement | null,
): element is ExcalidrawLinearElement => {
  return element != null && isLinearElementType(element.type);
};

export const isArrowElement = (
  element?: ExcalidrawElement | null,
): element is ExcalidrawArrowElement => {
  return element?.type === "arrow";
};

export const isElbowArrow = (
  element: ExcalidrawArrowElement,
): element is ExcalidrawArrowElement & { points: [any, any, any] } => {
  return element.points.length === 3;
};

export const isLinearElementType = (
  elementType: ExcalidrawElement["type"],
): boolean => {
  return elementType === "arrow" || elementType === "line";
};

export const isBindingElement = (
  element: ExcalidrawElement | null,
  includeLocked = true,
): element is ExcalidrawLinearElement => {
  return (
    element != null &&
    (!element.locked || includeLocked === true) &&
    isLinearElement(element) &&
    (!!element.startBinding || !!element.endBinding)
  );
};

export const isBindableElement = (
  element: ExcalidrawElement | null,
  includeLocked = true,
): element is ExcalidrawBindableElement => {
  if (!element) {
    return false;
  }

  if (element.locked && !includeLocked) {
    return false;
  }

  return (
    element.type === "rectangle" ||
    element.type === "diamond" ||
    element.type === "ellipse" ||
    element.type === "hexagon" ||
    element.type === "image" ||
    (element.type === "text" && !element.containerId)
  );
};

export const isTextBindableContainer = (
  element: ExcalidrawElement | null,
  includeLocked = true,
): element is ExcalidrawTextContainer => {
  if (!element) {
    return false;
  }

  if (element.locked && !includeLocked) {
    return false;
  }
  return (
    element.type === "rectangle" ||
    element.type === "diamond" ||
    element.type === "ellipse" ||
    element.type === "image" ||
    element.type === "arrow"
  );
};

export const isImageElement = (
  element: ExcalidrawElement | null,
): element is ExcalidrawImageElement => {
  return element != null && element.type === "image";
};

export const isInitializedImageElement = (
  element: ExcalidrawElement | null,
): element is ExcalidrawImageElement & {
  fileId: FileId;
  scale: [number, number];
} => {
  return isImageElement(element) && !!element.fileId && !!element.scale;
};

export const isIframeElement = (
  element: ExcalidrawElement | null,
): element is ExcalidrawIframeElement => {
  return !!element && element.type === "iframe";
};

export const isEmbeddableElement = (
  element: ExcalidrawElement | null,
): element is ExcalidrawEmbeddableElement => {
  return !!element && element.type === "embeddable";
};

export const isIframeLikeElement = (
  element: ExcalidrawElement | null,
): element is ExcalidrawIframeElement | ExcalidrawEmbeddableElement => {
  return isIframeElement(element) || isEmbeddableElement(element);
};

export const hasBoundTextElement = (element: ExcalidrawElement | null) => {
  return isTextBindableContainer(element) && element.boundElements?.length;
};

export const isBoundToContainer = (
  element: ExcalidrawElement | null,
): element is ExcalidrawTextElementWithContainer => {
  return (
    isTextElement(element) &&
    !!element.containerId &&
    !element.isDeleted &&
    !element.link
  );
};

export const isUsingBoldFont = (element: ExcalidrawElement) => {
  return (
    isTextElement(element) &&
    // TODO: remove this check once we have proper font support
    (element.fontFamily === FONT_FAMILY.Virgil ||
      element.fontFamily === FONT_FAMILY["Comic Shanns"])
  );
};

/**
 * These are elements that can be used to construct scenes but are not
 * rendered directly.
 */
export const isVirtualElement = (
  element: ExcalidrawElement | null,
): element is ExcalidrawSelectionElement => {
  return element != null && element.type === "selection";
};

export const isVisibleElement = (
  element: ExcalidrawElement | null,
): element is ExcalidrawElement => {
  return element != null && !element.isDeleted;
};

export const isArrowhead = (
  arrowhead: string | null,
): arrowhead is Arrowhead => {
  return (
    arrowhead === "arrow" ||
    arrowhead === "bar" ||
    arrowhead === "dot" ||
    arrowhead === "triangle"
  );
};

export const isFiniteNumber = (num: any) =>
  typeof num === "number" && Number.isFinite(num);
