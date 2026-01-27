import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { MapProvider, useMapContext } from "../src/components/MapProvider";
import { ZoomPanProvider, useZoomPanContext } from "../src/components/ZoomPanProvider";
import { createCoordinates, createRotationAngles } from "../src/types";

// Helper component to consume context
const MapConsumer = () => {
    const context = useMapContext();
    return <div>Projection: {context.projection() ? "Defined" : "Undefined"}</div>;
};

const ZoomPanConsumer = () => {
    const context = useZoomPanContext();
    return <div>Transform: {context.transformString}</div>;
};

describe("MapProvider", () => {
    it("provides default values", () => {
        render(() => (
            <MapProvider>
                <MapConsumer />
            </MapProvider>
        ));
        expect(screen.getByText("Projection: Defined")).toBeInTheDocument();
    });

    it("throws error when used outside provider", () => {
        // Suppress console.error for expected throw
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => { });

        expect(() => {
            render(() => <MapConsumer />);
        }).toThrow("useMapContext must be used within a MapProvider");

        consoleSpy.mockRestore();
    });

    it("applies projection config options", () => {
        const config = {
            center: createCoordinates(10, 10),
            rotate: createRotationAngles(0, 0, 0),
            scale: 200
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let projection: any;

        render(() => (
            <MapProvider projectionConfig={config} projection="geoMercator">
                {(() => {
                    const ctx = useMapContext();
                    projection = ctx.projection;
                    return <div>Test</div>;
                })()}
            </MapProvider>
        ));

        const proj = projection();
        expect(proj.center()).toEqual([10, 10]);
        expect(proj.scale()).toBe(200);
        // Rotation is harder to check directly on d3 projection object output sometimes, but if it didn't throw it's good.
    });

    it("supports function projection", () => {
        const mockProjection = () => "custom-projection";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const projAny = mockProjection as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let projection: any;

        render(() => (
            <MapProvider projection={projAny}>
                {(() => {
                    const ctx = useMapContext();
                    projection = ctx.projection;
                    return <div>Test</div>;
                })()}
            </MapProvider>
        ));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((projection() as any)()).toBe("custom-projection");
    });

    it("throws error for unknown projection sting", () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => { });

        // We need to render this inside an ErrorBoundary to catch it gracefully in Solid tests usually, 
        // or expect the render function to throw if it happens during render phase.
        // MapProvider creates projection in a memo, so it might throw during render.

        expect(() => {
            render(() => (
                <MapProvider projection="invalid-projection">
                    <div />
                </MapProvider>
            ));
        }).toThrow(/Unknown projection/);

        consoleSpy.mockRestore();
    });
});

describe("ZoomPanProvider", () => {
    it("provides default values", () => {
        render(() => (
            <ZoomPanProvider>
                <ZoomPanConsumer />
            </ZoomPanProvider>
        ));
        screen.debug();
        expect(screen.getByText(/Transform:/)).toBeInTheDocument();
    });

    it("throws error when used outside provider", () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => { });

        expect(() => {
            render(() => <ZoomPanConsumer />);
        }).toThrow("useZoomPanContext must be used within a ZoomPanProvider");

        consoleSpy.mockRestore();
    });
});
