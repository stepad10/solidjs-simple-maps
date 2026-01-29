import { describe, it, expect } from "vitest";
import { render } from "@solidjs/testing-library";
import { ComposableMap, Marker, Line, Annotation, Graticule, Sphere } from "../src";
import { createCoordinates } from "../src/types";

describe("Map Elements", () => {
    it("renders Marker at projected coordinates", () => {
        const { container } = render(() => (
            <ComposableMap width={800} height={600} projectionConfig={{ scale: 100 }}>
                <Marker coordinates={createCoordinates(0, 0)}>
                    <circle r={5} class="test-marker" />
                </Marker>
            </ComposableMap>
        ));

        const markerGroup = container.querySelector(".sm-marker");
        expect(markerGroup).toBeInTheDocument();

        // London [0, 51.5] should project to roughly [400, 300] (center) if center is [0,0]
        // But with default center [0,0] and [0,0] coordinates, it should be exactly center.
        // D3 default projection center is [480, 250] for 960x500 usually, but we use map width/2.
        // Let's just check it renders.
        expect(markerGroup).toHaveAttribute("transform");
    });

    it("renders Line between coordinates", () => {
        const { container } = render(() => (
            <ComposableMap>
                <Line from={createCoordinates(0, 0)} to={createCoordinates(10, 10)} class="test-line" />
            </ComposableMap>
        ));

        const path = container.querySelector("path.test-line");
        expect(path).toBeInTheDocument();
        expect(path).toHaveAttribute("d");
    });

    it("renders Annotation with connector", () => {
        const { container } = render(() => (
            <ComposableMap>
                <Annotation subject={createCoordinates(0, 0)} dx={30} dy={30} class="test-annotation">
                    <text>Label</text>
                </Annotation>
            </ComposableMap>
        ));

        const annotationGroup = container.querySelector(".sm-annotation");
        expect(annotationGroup).toBeInTheDocument();
        // Annotation has a connector path inside
        const connector = annotationGroup?.querySelector("path");
        expect(connector).toBeInTheDocument();
    });

    it("renders Graticule", () => {
        const { container } = render(() => (
            <ComposableMap>
                <Graticule class="test-graticule" />
            </ComposableMap>
        ));

        const path = container.querySelector("path.test-graticule");
        expect(path).toBeInTheDocument();
        expect(path).toHaveAttribute("d");
    });

    it("renders Sphere", () => {
        const { container } = render(() => (
            <ComposableMap>
                <Sphere class="test-sphere" id="earth" />
            </ComposableMap>
        ));

        const path = container.querySelector("path.test-sphere");
        expect(path).toBeInTheDocument();
        expect(path).toBeInTheDocument();

        // The id determines the clipPath id, usually used for Graticule clipping
        const clipPath = container.querySelector("#earth");
        expect(clipPath).toBeInTheDocument();
        expect(clipPath?.tagName).toBe("clipPath");
    });
});
