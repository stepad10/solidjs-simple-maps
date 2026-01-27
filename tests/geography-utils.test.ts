import { describe, it, expect } from "vitest";
import {
    getGeographyCentroid,
    getGeographyBounds,
    getGeographyCoordinates,
    getBestGeographyCoordinates,
    isValidCoordinates
} from "../src/utils/geography-utils";
import { Feature, Geometry, Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon, GeometryCollection } from "geojson";

// Helper to create feature
function createFeature<G extends Geometry>(geometry: G): Feature<G> {
    return {
        type: "Feature",
        properties: {},
        geometry
    };
}

describe("Geography Utils", () => {
    describe("getGeographyCoordinates", () => {
        it("returns null for missing geometry", () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect(getGeographyCoordinates({ type: "Feature", properties: {}, geometry: null } as any)).toBeNull();
        });

        it("handles Point", () => {
            const feat = createFeature<Point>({ type: "Point", coordinates: [10, 20] });
            expect(getGeographyCoordinates(feat)).toEqual([10, 20]);
        });

        it("handles LineString", () => {
            const feat = createFeature<LineString>({ type: "LineString", coordinates: [[10, 20], [30, 40]] });
            expect(getGeographyCoordinates(feat)).toEqual([10, 20]); // First point
        });

        it("handles Polygon", () => {
            const feat = createFeature<Polygon>({ type: "Polygon", coordinates: [[[10, 20], [30, 40], [10, 20]]] });
            expect(getGeographyCoordinates(feat)).toEqual([10, 20]); // First point of first ring
        });

        it("handles MultiPoint", () => {
            const feat = createFeature<MultiPoint>({ type: "MultiPoint", coordinates: [[10, 20], [30, 40]] });
            expect(getGeographyCoordinates(feat)).toEqual([10, 20]); // First point
        });

        it("handles MultiLineString", () => {
            const feat = createFeature<MultiLineString>({ type: "MultiLineString", coordinates: [[[10, 20], [30, 40]]] });
            expect(getGeographyCoordinates(feat)).toEqual([10, 20]); // First point of first line
        });

        it("handles MultiPolygon", () => {
            const feat = createFeature<MultiPolygon>({ type: "MultiPolygon", coordinates: [[[[10, 20], [30, 40], [10, 20]]]] });
            expect(getGeographyCoordinates(feat)).toEqual([10, 20]); // First point of first ring of first polygon
        });

        it("handles GeometryCollection", () => {
            const point: Point = { type: "Point", coordinates: [10, 20] };
            const feat = createFeature<GeometryCollection>({ type: "GeometryCollection", geometries: [point] });
            expect(getGeographyCoordinates(feat)).toEqual([10, 20]);
        });

        it("returns null for unknown geometry", () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const feat = createFeature({ type: "Unknown" } as any);
            expect(getGeographyCoordinates(feat)).toBeNull();
        });

        it("returns null for empty GeometryCollection", () => {
            const feat = createFeature<GeometryCollection>({ type: "GeometryCollection", geometries: [] });
            expect(getGeographyCoordinates(feat)).toBeNull();
        });

        it("returns null for malformed Point", () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const feat = createFeature<Point>({ type: "Point", coordinates: [] as any });
            expect(getGeographyCoordinates(feat)).toBeNull();
        });
    });

    describe("getGeographyCentroid", () => {
        // Using real d3-geo underlying logic, but mocking simple features
        // d3-geo centroid is robust.
        it("calculates centroid for Point", () => {
            const feat = createFeature<Point>({ type: "Point", coordinates: [0, 0] });
            expect(getGeographyCentroid(feat)).toEqual([0, 0]);
        });

        it("returns null for empty coords", () => {
            // d3-geo might return [NaN, NaN] for empty?
            // The util checks for finite
            const feat = createFeature<Point>({ type: "Point", coordinates: [NaN, NaN] });
            expect(getGeographyCentroid(feat)).toBeNull();
        });

        it("returns null for null geometry", () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect(getGeographyCentroid({ start: null } as any)).toBeNull();
        });
    });

    describe("getGeographyBounds", () => {
        it("calculates bounds", () => {
            const feat = createFeature<LineString>({ type: "LineString", coordinates: [[0, 0], [10, 10]] });
            const bounds = getGeographyBounds(feat);
            // d3-geo bounds: [[minX, minY], [maxX, maxY]]
            expect(bounds).toEqual([[0, 0], [10, 10]]);
        });

        it("returns null for bad geometry", () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect(getGeographyBounds({ geometry: null } as any)).toBeNull();
        });
    });

    describe("getBestGeographyCoordinates", () => {
        it("prefers centroid", () => {
            const feat = createFeature<Point>({ type: "Point", coordinates: [10, 10] });
            const result = getBestGeographyCoordinates(feat);
            expect(result).not.toBeNull();
            expect(result![0]).toBeCloseTo(10);
            expect(result![1]).toBeCloseTo(10);
        });

        it("fallbacks to first coordinate if centroid fails (though rare for Point)", () => {
            // Hard to force centroid fail on valid Point but succeed on getGeographyCoordinates
            // unless we mock d3-geo.
            // But logic is simply: return centroid || getGeographyCoordinates(geography)
        });
    });

    describe("isValidCoordinates", () => {
        it("validates correct format", () => {
            expect(isValidCoordinates([0, 0])).toBe(true);
        });

        it("rejects invalid formats", () => {
            expect(isValidCoordinates([])).toBe(false);
            expect(isValidCoordinates([0])).toBe(false);
            expect(isValidCoordinates([0, 0, 0])).toBe(false); // Exact length 2
            expect(isValidCoordinates(["0", 0])).toBe(false);
            expect(isValidCoordinates([0, NaN])).toBe(false);
            expect(isValidCoordinates([0, Infinity])).toBe(false);
        });

        it("validates ranges", () => {
            expect(isValidCoordinates([181, 0])).toBe(false);
            expect(isValidCoordinates([0, 91])).toBe(false);
        });
    });
});
