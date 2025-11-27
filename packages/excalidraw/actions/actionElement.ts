import {
  isBindableElement,
  isBindingElement,
  isFrameLikeElement,
  isTextBindableContainer,
  isTextElement,
} from "@excalidraw/element";
import { getBoundTextElement } from "@excalidraw/element/textElement";
import {
  getElementsInGroup,
  selectGroupsForSelectedElements,
} from "../groups";
import type { AppClass } from "../components/App";
import type { ExcalidrawElement } from "@excalidraw/element/types";
import { AppState } from "../types";
import { getSelectedElements, isSomeElementSelected } from "../scene";
import { newElementWith } from "@excalidraw/element";

type ChangeProperty<T> = (
  elements: readonly ExcalidrawElement[],
  appState: Readonly<AppState>,
  fn: (element: ExcalidrawElement) => T,
  app: AppClass,
  includeBoundText: boolean,
) => (T & { strokeColor: ExcalidrawElement["strokeColor"] })[];

export const changeProperty: ChangeProperty<any> = (
  elements,
  appState,
  fn,
  app,
  includeBoundText,
) => {
  const selectedElements = getSelectedElements(elements, appState, {
    includeBoundText,
  });

  const selectedElementsMap = new Map(selectedElements.map((el) => [el.id, el]));

  const individualElements = new Set(selectedElements);

  // when in group, we want to apply property to all elements in the group
  // even if elements outside the group are selected
  const selectedGroupIds = selectGroupsForSelectedElements(
    {
      selectedElements,
      // has to be all elements because we need to get containing groups
      // of selected elements
      elements,
    },
    app.scene.getNonDeletedElementsMap(),
  ).selectedGroupIds;

  if (Object.keys(selectedGroupIds).length > 0) {
    const elementsInGroup = getElementsInGroup(
      elements,
      Object.keys(selectedGroupIds)[0],
    );

    for (const element of elementsInGroup) {
      if (!selectedElementsMap.has(element.id)) {
        individualElements.add(element);
      }
    }
  }

  return Array.from(individualElements).map((element) => {
    const changes = fn(element);

    if (
      changes.strokeColor &&
      element.type !== "image" &&
      !isBindingElement(element)
    ) {
      if (
        isTextElement(element) &&
        !isBoundToContainer(element) &&
        !element.text
      ) {
        return newElementWith(element, changes);
      }
      if (
        isBindableElement(element) ||
        isTextBindableContainer(element) ||
        isFrameLikeElement(element)
      ) {
        const boundTextElement = getBoundTextElement(
          element,
          app.scene.getNonDeletedElementsMap(),
        );

        if (boundTextElement) {
          app.scene.mutateElement(boundTextElement, {
            strokeColor: changes.strokeColor,
          });
        }
      }
    }

    return newElementWith(element, changes);
  });
};
