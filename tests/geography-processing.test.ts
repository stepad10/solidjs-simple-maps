import { describe, it, expect, vi } from "vitest";
import {
    isString,
    getFeatures,
    getMesh,
    prepareMesh,
    prepareFeatures,
    createConnectorPath
} from "../src/utils/geography-processing";
import { FeatureCollection, Feature, Point } from "geojson";
import { Topology } from "topojson-specification";

// Mocks
const mockFeature: Feature<Point> = {
    type: "Feature",
    geometry: { type: "Point", coordinates: [0, 0] },
    properties: {}
};

const mockFeatureCollection: FeatureCollection = {
    type: "FeatureCollection",
    features: [mockFeature]
};

// Minimal Topology Mock
// topojson-client feature() output depends on this structure
const mockTopology: Topology = {
    type: "Topology",
    objects: {
        default: {
            type: "GeometryCollection",
            geometries: [{ type: "Point", coordinates: [0, 0] }]
        } as any
    },
    arcs: [],
    transform: { scale: [1, 1], translate: [0, 0] }
};

describe("Geography Processing", () => {
    describe("isString", () => {
        it("identifies strings", () => {
            expect(isString("/path/to/geo.json")).toBe(true);
            expect(isString({})).toBe(false);
        });
    });

    describe("getFeatures", () => {
        it("returns features array as is", () => {
            const input = [mockFeature];
            expect(getFeatures(input)).toBe(input);
        });

        it("extracts from FeatureCollection", () => {
            const result = getFeatures(mockFeatureCollection);
            expect(result).toHaveLength(1);
            expect(result[0]).toHaveProperty("type", "Feature");
        });

        it("extracts from Topology", () => {
            // We rely on topojson-client implementation being correct, 
            // we just test our wrapper logic selecting the first object
            const result = getFeatures(mockTopology);
            expect(result).toHaveLength(1);
        });

        it("returns empty array for unknown type", () => {
            expect(getFeatures({ type: "Unknown" } as any)).toEqual([]);
        });

        it("handles empty topology objects", () => {
            const emptyTopo: Topology = { ...mockTopology, objects: {} };
            expect(getFeatures(emptyTopo)).toEqual([]);
        });
    });

    describe("getMesh", () => {
        it("extracts mesh from Topology", () => {
            const result = getMesh(mockTopology);
            // topojson.mesh returns MultiLineString or LineString (or null if empty)
            // Even if null, the structure { outline, border } is returned
            expect(result).toBeDefined();
            expect(result).toHaveProperty("outline");
            expect(result).toHaveProperty("borders");
        });

        it("returns null for non-Topology", () => {
            expect(getMesh(mockFeatureCollection)).toBeNull();
        });

        it("returns null for empty objects in Topology", () => {
            const emptyTopo: Topology = { ...mockTopology, objects: {} };
            expect(getMesh(emptyTopo)).toBeNull();
        });
    });

    describe("prepareMesh", () => {
        it("generates path strings", () => {
            const mockPath = vi.fn().mockReturnValue("M0,0L10,10");
            const mesh = { type: "LineString", coordinates: [[0, 0], [10, 10]] } as any;

            const result = prepareMesh(mesh, mesh, mockPath as any);
            expect(result.outline).toBe("M0,0L10,10");
            expect(result.borders).toBe("M0,0L10,10");
        });

        it("handles missing/null mesh", () => {
            expect(prepareMesh(null, null, vi.fn() as any)).toEqual({});
        });
    });

    describe("prepareFeatures", () => {
        it("maps features to svg paths", () => {
            const mockPath = vi.fn().mockReturnValue("M0,0");
            const features = [mockFeature];

            const result = prepareFeatures(features, mockPath as any);
            expect(result).toHaveLength(1);
            expect(result[0].svgPath).toBe("M0,0");
        });

        it("filters out features with null path", () => {
            const mockPath = vi.fn().mockReturnValue(null);
            const features = [mockFeature];
            const result = prepareFeatures(features, mockPath as any);
            expect(result).toHaveLength(0);
        });

        it("handles empty input", () => {
            expect(prepareFeatures([], vi.fn() as any)).toEqual([]);
            expect(prepareFeatures(undefined, vi.fn() as any)).toEqual([]);
        });
    });

    describe("createConnectorPath", () => {
        it("returns empty string if curve is not function", () => {
            expect(createConnectorPath([0, 0], [10, 10], "not-a-func")).toBe("");
        });

        it("generates line using d3 curve", () => {
            // Mocking d3 curve factory structure is complex
            // Using a simplified mock
            const mockLineGen = vi.fn().mockReturnValue("M0,0L10,10");
            const mockCurve = vi.fn().mockReturnValue({
                x: () => ({
                    y: () => mockLineGen
                })
            });

            // Our helper expects curveFactory() to return builder chain
            const result = createConnectorPath([0, 0], [10, 10], mockCurve);
            expect(result).toBe("M0,0L10,10");
        });

        it("returns empty string on error", () => {
            const throwingCurve = () => { throw new Error() };
            expect(createConnectorPath([0, 0], [10, 10], throwingCurve)).toBe("");
        });
    });
});
