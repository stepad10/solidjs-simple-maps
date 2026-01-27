import { describe, it, expect } from "vitest";
import {
    createLongitude,
    createLatitude,
    createCoordinates,
    createScaleExtent,
    createTranslateExtent,
    createRotationAngles,
    createParallels,
    createGraticuleStep,
    createZoomConfig,
    createPanConfig,
    createZoomPanConfig,
    Coordinates
} from "../src/types";

describe("Type Helpers", () => {
    it("creates branded types correctly", () => {
        const lon = createLongitude(10);
        expect(lon).toBe(10);

        const lat = createLatitude(20);
        expect(lat).toBe(20);

        const coords = createCoordinates(10, 20);
        expect(coords).toEqual([10, 20]);
    });

    it("creates extents and configs", () => {
        const scaleExtent = createScaleExtent(1, 10);
        expect(scaleExtent).toEqual([1, 10]);

        const translateExtent = createTranslateExtent(createCoordinates(0, 0), createCoordinates(100, 100));
        expect(translateExtent).toEqual([[0, 0], [100, 100]]);

        const rotation = createRotationAngles(0, 45, 0);
        expect(rotation).toEqual([0, 45, 0]);

        const parallels = createParallels(10, 20);
        expect(parallels).toEqual([10, 20]);

        const step = createGraticuleStep(10, 10);
        expect(step).toEqual([10, 10]);
    });

    it("creates zoom and pan configs", () => {
        const zoomConfig = createZoomConfig(1, 10);
        expect(zoomConfig).toEqual({
            minZoom: 1,
            maxZoom: 10,
            scaleExtent: [1, 10],
            enableZoom: true,
        });

        const bounds = [createCoordinates(0, 0), createCoordinates(100, 100)] as [Coordinates, Coordinates];
        const panConfig = createPanConfig(bounds);
        expect(panConfig).toEqual({
            translateExtent: bounds,
            enablePan: true,
        });

        const zoomPanConfig = createZoomPanConfig(1, 10, bounds);
        expect(zoomPanConfig).toEqual({
            minZoom: 1,
            maxZoom: 10,
            scaleExtent: [1, 10],
            translateExtent: bounds,
            enableZoom: true,
            enablePan: true,
        });
    });
});
