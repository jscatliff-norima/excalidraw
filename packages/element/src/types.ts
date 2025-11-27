import type {
  ColorPickerColor,
  ColorTuple,
  ValueOf,
} from "@excalidraw/common/utility-types";
import type {
  PointerType,
  Align,
  VerticalAlign,
  FontFamilyValues,
  ExcalidrawSelectionElement,
  ExcalidrawRectangleElement,
  ExcalidrawDiamondElement,
  ExcalidrawEllipseElement,
  ExcalidrawImageElement,
  ExcalidrawFreeDrawElement,
  ExcalidrawLinearElement,
  ExcalidrawTextElement,
  ExcalidrawFrameElement,
  ExcalidrawMagicFrameElement,
  ExcalidrawIframeElement,
  ExcalidrawEmbeddableElement,
  ExcalidrawTextElementWithContainer,
  ExcalidrawTextContainer,
  FileId,
  ExcalidrawGenericElement,
  Arrowhead,
  ExcalidrawArrowElement,
} from "../../excalidraw/element/types";
import type { Point } from "@excalidraw/math";

// -----------------------------------------------------------------------------
// FIXME temporary until we have a better way to share types cross-packages
// -----------------------------------------------------------------------------

export type {
  ExcalidrawSelectionElement,
  ExcalidrawRectangleElement,
  ExcalidrawDiamondElement,
  ExcalidrawEllipseElement,
  ExcalidrawImageElement,
  ExcalidrawFreeDrawElement,
  ExcalidrawLinearElement,
  ExcalidrawTextElement,
  ExcalidrawFrameElement,
  ExcalidrawMagicFrameElement,
  ExcalidrawIframeElement,
  ExcalidrawEmbeddableElement,
  ExcalidrawTextElementWithContainer,
  ExcalidrawTextContainer,
  FileId,
  ExcalidrawGenericElement,
  Arrowhead,
  ExcalidrawArrowElement,
};

export type Point = Readonly<Point>;

export type Collaborator = {
  pointer?: {
    x: number;
    y: number;
    tool: "pointer" | "laser";
  };
  button?: "up" | "down";
  selectedElementIds?: AppState["selectedElementIds"];
  cursor?: {
    x: number;
    y: number;
  };
  // The url of the collaborator's avatar, defaults to username initials
  // if not present
  avatarUrl?: string;
  // The collaborator's user name
  username?: string;
};

export type AppState = {
  isLoading: boolean;
  errorMessage: React.ReactNode;
  activeTool: {
    type: typeof import("@excalidraw/common").TOOL_TYPE[keyof typeof import("@excalidraw/common").TOOL_TYPE];
    customType: string | null;
  } & {
    locked: boolean;
  } & {
    lastActiveTool: ActiveTool | null;
  };
  //
  //...
  //
};
// --------------------------------------------------------------------------—

export type ExcalidrawHexagonElement = ExcalidrawGenericElement & {
  type: "hexagon";
};

export type ExcalidrawGenericElementType =
  | "selection"
  | "rectangle"
  | "diamond"
  | "ellipse"
  | "hexagon"
  | "image"
  | "arrow"
  | "freedraw"
  | "line";

export type ExcalidrawElement =
  | ExcalidrawSelectionElement
  | ExcalidrawRectangleElement
  | ExcalidrawDiamondElement
  | ExcalidrawEllipseElement
  | ExcalidrawHexagonElement
  | ExcalidrawImageElement
  | ExcalidrawFreeDrawElement
  | ExcalidrawLinearElement
  | ExcalidrawTextElement
  | ExcalidrawFrameElement
  | ExcalidrawMagicFrameElement
  | ExcalidrawIframeElement
  | ExcalidrawEmbeddableElement;

// -----------------------------------------------------------------------------
// a subset of AppState that can be saved excalidraw files
// --------------------------------------------------------------------------—

export interface ExportedAppState {
  gridSize: number | null;
  showGrid: boolean;
  viewBackgroundColor: string;
}

// -----------------------------------------------------------------------------
// fields that are saved excalidraw files, but not part of AppState
// --------------------------------------------------------------------------—
export interface ExportedFields {
  type: string;
  version: number;
  source: string;
}

export type Theme = "light" | "dark";

export type LastUsedColor = {
  strokeColor: ColorTuple | string;
  backgroundColor: ColorTuple | string;
};

export type LastUsedColors = Record<ColorPickerColor, LastUsedColor>;

/** A branding to ensure that the value is a FontString */
type FontStringBrand = {
  readonly FONT_STRING: unique symbol;
};
/** A string that is a valid CSS font value */
export type FontString = string & FontStringBrand;

/** A branding to ensure that the value is a Data URL */
type DataURLBrand = {
  readonly DATA_URL: unique symbol;
};
/** A string that is a valid Data URL */
export type DataURL = string & DataURLBrand;

export type ActiveTool =
  | {
      type:
        | "rectangle"
        | "ellipse"
        | "diamond"
        | "hexagon"
        | "line"
        | "arrow"
        | "freedraw"
        | "text"
        | "image"
        | "selection"
        | "eraser"
        | "hand"
        | "frame"
        | "magicframe"
        | "embeddable"
        | "laser";
      customType: null;
    }
  | {
      type: "custom";
      customType: string;
    };
export type ToolType = ActiveTool["type"];

export type Ordinal = number & { _brand: "Ordinal" };

export type FixedPoint = readonly [number, number] & { _brand: "FixedPoint" };

export type BindMode = "orbit" | "inside";

export type FixedPointBinding = {
  elementId: ExcalidrawBindableElement["id"];
  focus: number;
  gap: number;
} & (
  | {
      mode: "orbit";
      fixedPoint: FixedPoint;
    }
  | {
      mode: "inside";
      fixedPoint?: undefined;
    }
);

export type PointsPositionUpdates = Map<
  number,
  {
    point: Point;
    maybeSuggestBinding?: ExcalidrawBindableElement["id"] | null;
  }
>;

/** branded type for storing frame element's children as a list of ids */
export type FrameId = string & { _brand: "frameId" };

export type ElementsMap = Map<string, ExcalidrawElement>;
export type ReadonlyElementsMap = ReadonlyMap<string, ExcalidrawElement>;
export type NonDeletedSceneElementsMap = ReadonlyMap<
  string,
  NonDeleted<ExcalidrawElement>
>;

// non-subtype of ExcalidrawElement, instead serving as a branded type
// to ensure elements are only used after ordering is applied
export type Ordered<T extends ExcalidrawElement> = T & {
  _brand: "OrderedExcalidrawElement";
};
export type OrderedExcalidrawElement = Ordered<ExcalidrawElement>;

export type NonDeleted<TElement extends ExcalidrawElement> = TElement & {
  isDeleted: false;
};

export type Deleted<TElement extends ExcalidrawElement> = TElement & {
  isDeleted: true;
};

export type ExcalidrawBindableElement =
  | ExcalidrawRectangleElement
  | ExcalidrawDiamondElement
  | ExcalidrawEllipseElement
  | ExcalidrawHexagonElement
  | ExcalidrawImageElement
  | ExcalidrawIframeElement
  | ExcalidrawEmbeddableElement
  | ExcalidrawFrameElement
  | ExcalidrawMagicFrameElement
  | (ExcalidrawTextElement & { containerId: null });

export type { FontFamilyValues };

export type { Align, VerticalAlign };

export type { PointerType };
