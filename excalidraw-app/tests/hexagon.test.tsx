import { render, screen } from "@excalidraw/excalidraw/tests/test-utils";
import { UI } from "@excalidraw/excalidraw/tests/helpers/ui";
import ExcalidrawApp from "../App";
import { API } from "@excalidraw/excalidraw/tests/helpers/api";

const { h } = window;

describe("Hexagon tool", () => {
  it("should add hexagon to the scene", async () => {
    await render(<ExcalidrawApp />);
    const canvas = await screen.findByTestId("excalidraw-canvas");

    // select hexagon tool
    const hexagonTool = await screen.findByTestId("toolbar-hexagon");
    UI.click(hexagonTool);

    // create hexagon
    UI.drag(canvas, {
      from: { x: 100, y: 100 },
      to: { x: 200, y: 200 },
    });

    const elements = h.elements;
    expect(elements.length).toBe(1);
    expect(elements[0].type).toBe("hexagon");
    expect(elements[0].x).toBe(100);
    expect(elements[0].y).toBe(100);
    expect(elements[0].width).toBe(100);
    expect(elements[0].height).toBe(100);

    // Check that it can be selected
    UI.click(canvas, { x: 150, y: 150 });
    expect(API.getSelectedElements().length).toBe(1);
    expect(API.getSelectedElements()[0].type).toBe("hexagon");
  });
});
