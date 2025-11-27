import type { TransformHandleType } from "./transformHandles";
import type { PointerDownState } from "@excalidraw/excalidraw/types";
import { pointFrom, pointRotateRads, type Radians } from "@excalidraw/math";
import { getPerfectElementSize } from "./sizeHelpers";

const transformSingleRectangle = (
  transformHandle: TransformHandleType,
  x: number,
  y: number,
  width: number,
  height: number,
  nextX: number,
  nextY: number,
) => {
  if (transformHandle.includes("e")) {
    width = nextX - x;
  }
  if (transformHandle.includes("s")) {
    height = nextY - y;
  }
  if (transformHandle.includes("w")) {
    width = x + width - nextX;
    x = nextX;
  }
  if (transformHandle.includes("n")) {
    height = y + height - nextY;
    y = nextY;
  }

  return [x, y, width, height];
};

const transformSingleEllipse = (
  transformHandle: TransformHandleType,
  x: number,
  y: number,
  width: number,
  height: number,
  nextX: number,
  nextY: number,
) => {
  if (transformHandle.includes("e")) {
    width = nextX - x;
  }
  if (transformHandle.includes("s")) {
    height = nextY - y;
  }
  if (transformHandle.includes("w")) {
    width = x + width - nextX;
    x = nextX;
  }
  if (transformHandle.includes("n")) {
    height = y + height - nextY;
    y = nextY;
  }
  return [x, y, width, height];
};

const transformSingleFrame = (
  transformHandle: TransformHandleType,
  x: number,
  y: number,
  width: number,
  height: number,
  nextX: number,
  nextY: number,
) => {
  if (transformHandle.includes("e")) {
    width = nextX - x;
  }
  if (transformHandle.includes("s")) {
    height = nextY - y;
  }
  if (transformHandle.includes("w")) {
    width = x + width - nextX;
    x = nextX;
  }
  if (transformHandle.includes("n")) {
    height = y + height - nextY;
    y = nextY;
  }
  return [x, y, width, height];
};

const transformSingleDiamond = (
  transformHandle: TransformHandleType,
  x: number,
  y: number,
  width: number,
  height: number,
  nextX: number,
  nextY: number,
) => {
  if (transformHandle.includes("e")) {
    width = 2 * (nextX - (x + width / 2));
  }
  if (transformHandle.includes("s")) {
    height = 2 * (nextY - (y + height / 2));
  }
  if (transformHandle.includes("w")) {
    width = 2 * (x + width / 2 - nextX);
  }
  if (transformHandle.includes("n")) {
    height = 2 * (y + height / 2 - nextY);
  }
  return [x, y, width, height];
};

export const transformSingleElement = (
  transformHandle: TransformHandleType,
  pointerDownState: PointerDownState,
  type: string,
  [x, y, width, height]: [number, number, number, number],
  [nextX, nextY]: [number, number],
  isResizeWithSidesSameLength: boolean,
  isResizeFromCenter: boolean,
) => {
  if (isResizeFromCenter) {
    if (transformHandle.includes("e")) {
      width = 2 * (nextX - (x + width / 2));
    }
    if (transformHandle.includes("s")) {
      height = 2 * (nextY - (y + height / 2));
    }
    if (transformHandle.includes("w")) {
      width = 2 * (x + width / 2 - nextX);
    }
    if (transformHandle.includes("n")) {
      height = 2 * (y + height / 2 - nextY);
    }
  }

  if (isResizeWithSidesSameLength) {
    const { width: nextWidth, height: nextHeight } = getPerfectElementSize(
      type,
      width,
      height,
    );
    width = nextWidth;
    height = nextHeight;
  }

  if (!isResizeFromCenter) {
    switch (type) {
      case "rectangle":
      case "image":
      case "text":
        [x, y, width, height] = transformSingleRectangle(
          transformHandle,
          x,
          y,
          width,
          height,
          nextX,
          nextY,
        );
        break;
      case "iframe":
      case "embeddable":
      case "frame":
      case "magicframe":
        [x, y, width, height] = transformSingleFrame(
          transformHandle,
          x,
          y,
          width,
          height,
          nextX,
          nextY,
        );
        break;
      case "ellipse":
        [x, y, width, height] = transformSingleEllipse(
          transformHandle,
          x,
          y,
          width,
          height,
          nextX,
          nextY,
        );
        break;
      case "diamond":
      case "hexagon":
        [x, y, width, height] = transformSingleDiamond(
          transformHandle,
          x,
          y,
          width,
          height,
          nextX,
          nextY,
        );
        break;
    }
  }

  if (width < 0) {
    width = -width;
    x -= width;
  }
  if (height < 0) {
    height = -height;
    y -= height;
  }

  const [finalX, finalY] = pointRotateRads(
    pointFrom(x, y),
    pointFrom(
      pointerDownState.originalElements.center.x,
      pointerDownState.originalElements.center.y,
    ),
    -pointerDownState.originalElements.angle,
  );

  return [finalX, finalY, width, height];
};
