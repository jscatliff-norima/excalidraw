import {
  newArrowElement,
  newDiamondElement,
  newEllipseElement,
  newFreedrawElement,
  newIframeElement,
  newImageElement,
  newEmbeddableElement,
  newTextElement,
  newRectangleElement,
  newFrameElement,
  newMagicFrameElement,
  newLinearElement,
  newTextElementWithContainer,
  newSelectionElement,
  newElementWith,
  newHexagonElement,
} from "./newElementImpl";
import { randomId } from "@excalidraw/common";
import type {
  ExcalidrawElement,
  ExcalidrawGenericElement,
  NonDeleted,
  ExcalidrawTextElement,
  ExcalidrawFrameElement,
  ExcalidrawMagicFrameElement,
  ExcalidrawLinearElement,
  Arrowhead,
  ExcalidrawFreeDrawElement,
  ExcalidrawImageElement,
  ExcalidrawTextElementWithContainer,
  ExcalidrawSelectionElement,
  FileId,
  ExcalidrawIframeElement,
  ExcalidrawEmbeddableElement,
  ExcalidrawRectangleElement,
  ExcalidrawEllipseElement,
  ExcalidrawDiamondElement,
  ExcalidrawHexagonElement,
} from "./types";
import { getNewGroupIdsForDuplication } from "../groups";
import { getCopiedStyles } from "../utils";
import { getElementMap, getSceneVersion } from "../scene/comparisons";
import type { ElementsMap } from "../scene/types";
import { syncInvalidIndices } from "./comparisons";
import { getElementAbsoluteCoords } from "./bounds";

/**
 * Creates a new generic element, whose properties can be particularly used
 * for embedding scenarios, such as image scenes.
 *
 * It's particularly useful to create a new element that's not added to the scene,
 * but needs to be displayed in a different UI context.
 *
 * @returns a new Excalidraw generic element
 */
export const newGenericElement = (
  opts: {
    type: ExcalidrawGenericElement["type"];
  } & Omit<
    ExcalidrawGenericElement,
    "id" | "type" | "version" | "versionNonce" | "updated"
  >,
): NonDeleted<ExcalidrawGenericElement> => {
  return newElementWith(
    {
      ...opts,
    },
    {},
  );
};

export {
  newArrowElement,
  newDiamondElement,
  newEllipseElement,
  newFreedrawElement,
  newIframeElement,
  newImageElement,
  newEmbeddableElement,
  newTextElement,
  newRectangleElement,
  newFrameElement,
  newMagicFrameElement,
  newLinearElement,
  newTextElementWithContainer,
  newSelectionElement,
  newHexagonElement,
};

export const newElement = (opts: {
  type: ExcalidrawElement["type"];
  x?: number;
  y?: number;
  strokeColor?: string;
  backgroundColor?: string;
  fillStyle?: string;
  strokeWidth?: number;
  strokeStyle?: ExcalidrawElement["strokeStyle"];
  roughness?: number;
  opacity?: number;
  width?: number;
  height?: number;
  angle?: number;
  groupIds?: string[];
  roundness?: ExcalidrawElement["roundness"];
  boundElements?: ExcalidrawElement["boundElements"];
  link?: ExcalidrawElement["link"];
  locked?: ExcalidrawElement["locked"];
  // text element
  text?: string;
  fontFamily?: number;
  fontSize?: number;
  textAlign?: string;
  verticalAlign?: string;
  containerId?: ExcalidrawTextElement["containerId"];
  originalText?: ExcalidrawTextElement["originalText"];
  lineHeight?: ExcalidrawTextElement["lineHeight"];
  // linear element
  startArrowhead?: Arrowhead;
  endArrowhead?: Arrowhead;
  points?: ExcalidrawLinearElement["points"];
  // freedraw element
  pressures?: ExcalidrawFreeDrawElement["pressures"];
  simulatePressure?: boolean;
  // image element
  status?: ExcalidrawImageElement["status"];
  fileId?: FileId;
  scale?: ExcalidrawImageElement["scale"];
  // frame element
  name?: string;
}): NonDeleted<ExcalidrawElement> => {
  const { type, ...rest } = opts;
  switch (type) {
    case "selection": {
      let element: ExcalidrawSelectionElement = newSelectionElement({
        ...rest,
      });
      if (rest.customData) {
        element = newElementWith(element, {
          customData: rest.customData,
        });
      }
      return element;
    }

    case "rectangle":
    case "diamond":
    case "ellipse":
    case "hexagon":
    case "image":
    case "text":
      const element = newGenericElement({
        type: type as
          | ExcalidrawRectangleElement["type"]
          | ExcalidrawDiamondElement["type"]
          | ExcalidrawEllipseElement["type"]
          | ExcalidrawHexagonElement["type"]
          | ExcalidrawImageElement["type"]
          | ExcalidrawTextElement["type"],
        ...rest,
      });

      return element;

    case "freedraw": {
      let element: ExcalidrawFreeDrawElement = newFreedrawElement({
        ...rest,
      });

      if (rest.customData) {
        element = newElementWith(element, {
          customData: rest.customData,
        });
      }
      return element;
    }
    case "arrow":
    case "line":
      let element: ExcalidrawLinearElement = newLinearElement({
        type: type,
        ...rest,
      });
      if (rest.customData) {
        element = newElementWith(element, {
          customData: rest.customData,
        });
      }

      return element;
    // We don't have a constructor for these
    case "frame":
    case "magicframe":
    case "iframe":
    case "embeddable":
      throw new Error(`Element type "${type}" does not have a constructor.`);
  }
};

/**
 * Clones a single element, changing only the properties passed in `updates`
 * and `opts`.
 *
 * If you need to clone more than one element, use `duplicateElements`.
 */
export const cloneElement = <T extends ExcalidrawElement>(
  element: T,
  updates?: Omit<
    Partial<T>,
    "id" | "version" | "versionNonce" | "seed" | "boundElements"
  > & {
    boundElements?: ExcalidrawElement["boundElements"];
  },
  opts?: {
    /**
     * if false, the element's `seed` will be regenerated. This is not desirable
     * when you want to create a derived element (e.g. text element for a
     * container) and want it to be deterministic.
     */
    newSeed?: boolean;
  },
): T => {
  const { newSeed = true } = opts || {};

  const clonedElement: T = newElementWith(
    element,
    {
      id: randomId(),
      ...(newSeed ? {} : { seed: element.seed }),
      ...updates,
    },
    {},
  );

  return clonedElement;
};

/**
 * Duplicates a set of elements, respecting relative positions and group ids.
 *
 * NOTE: it is preferred to use this function over `cloneElement` when you want
 * to duplicate a set of elements.
 */
export const duplicateElements = (
  elements: readonly ExcalidrawElement[],
  opts?: {
    /** if not supplied, will be derived from the relative positions of the
     * duplicated elements
     */
    offsetX?: number;
    offsetY?: number;
  },
) => {
  const { offsetX, offsetY } = opts || {};
  const clonedElements: ExcalidrawElement[] = [];

  const oldElementsMap = getElementMap(elements);
  const oldIdToNewId = new Map<string, string>();
  const newGroupIds = getNewGroupIdsForDuplication(
    elements,
    oldElementsMap,
    (oldId) => oldIdToNewId.get(oldId),
  );

  const [minX, minY] = getElementAbsoluteCoords(elements[0], oldElementsMap);
  let newMinX = minX;
  let newMinY = minY;
  if (offsetX !== undefined || offsetY !== undefined) {
    newMinX += offsetX ?? 0;
    newMinY += offsetY ?? 0;
  } else {
    newMinX += 10;
    newMinY += 10;
  }

  for (const oldElement of elements) {
    const newElement: Mutable<ExcalidrawElement> = cloneElement(oldElement);
    oldIdToNewId.set(oldElement.id, newElement.id);

    newElement.x = newElement.x - minX + newMinX;
    newElement.y = newElement.y - minY + newMinY;

    if (newElement.groupIds) {
      newElement.groupIds = newElement.groupIds.map(
        (gid) => newGroupIds[gid] || gid,
      );
    }

    if (newElement.boundElements) {
      newElement.boundElements = newElement.boundElements.map((binding) => {
        return {
          ...binding,
          id: oldIdToNewId.get(binding.id) || binding.id,
        };
      });
    }

    if (
      "containerId" in newElement &&
      newElement.containerId &&
      oldIdToNewId.has(newElement.containerId)
    ) {
      (newElement as ExcalidrawTextElementWithContainer).containerId =
        oldIdToNewId.get(newElement.containerId)!;
    }

    if (newElement.startBinding) {
      const newBinding = {
        ...newElement.startBinding,
        elementId:
          oldIdToNewId.get(newElement.startBinding.elementId) ||
          newElement.startBinding.elementId,
      };

      (newElement as ExcalidrawLinearElement).startBinding = newBinding;
    }
    if (newElement.endBinding) {
      const newBinding = {
        ...newElement.endBinding,
        elementId:
          oldIdToNewId.get(newElement.endBinding.elementId) ||
          newElement.endBinding.elementId,
      };
      (newElement as ExcalidrawLinearElement).endBinding = newBinding;
    }

    clonedElements.push(newElement);
  }

  return clonedElements;
};

export const getElementsInNewScene = (
  elements: readonly ExcalidrawElement[],
) => {
  const nextElements = elements.map((element) => {
    // If we're not going to persist the elements, there's no point
    // in keeping the `isDeleted` flag
    if (element.isDeleted) {
      return null;
    }
    const newElement = newElementWith(
      element,
      {
        // we want to drop any group id related information when we create a new scene from another
        // so that new shapes are not grouped with old shapes from previous scene
        groupIds: [],
        // we want to drop any frame id related information when we create a new scene from another
        // so that new shapes are not framed with old shapes from previous scene
        frameId: null,
        // we want to drop any bound elements when we create a new scene from another
        // so that new shapes are not bound with old shapes from previous scene
        boundElements: [],
      },
      {},
    );
    return newElement;
  });

  return nextElements.filter(
    (element): element is ExcalidrawElement => element !== null,
  );
};
