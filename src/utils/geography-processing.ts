import { feature, mesh } from "topojson-client";
import { Feature, FeatureCollection, Geometry, MultiLineString, LineString } from "geojson";
import { Topology } from "topojson-specification";
import { GeoPath } from "d3-geo";
import { PreparedFeature } from "../types";

type MeshGeometry = MultiLineString | LineString;

export function isString(geo: string | Topology | FeatureCollection | Feature<Geometry>[]): geo is string {
    return typeof geo === "string";
}

function extractFeaturesFromTopology(topology: Topology, parseGeographies?: (geographies: Feature<Geometry>[]) => Feature<Geometry>[]): Feature<Geometry>[] {
    const objectKeys = Object.keys(topology.objects);
    if (objectKeys.length === 0) {
        return [];
    }

    const firstObjectKey = objectKeys[0];
    if (!firstObjectKey) {
        return [];
    }

    const geometryObject = topology.objects[firstObjectKey];
    if (!geometryObject) {
        return [];
    }

    const featureCollection = feature(topology, geometryObject);
    const features = "features" in featureCollection ? featureCollection.features || [] : [];
    return parseGeographies ? parseGeographies(features) : features;
}

function extractFeaturesFromCollection(
    featureCollection: FeatureCollection,
    parseGeographies?: (geographies: Feature<Geometry>[]) => Feature<Geometry>[],
): Feature<Geometry>[] {
    const features = featureCollection.features || [];
    return parseGeographies ? parseGeographies(features) : features;
}

export function getFeatures(
    geographies: Topology | FeatureCollection | Feature<Geometry>[],
    parseGeographies?: (geographies: Feature<Geometry>[]) => Feature<Geometry>[],
): Feature<Geometry>[] {
    if (Array.isArray(geographies)) {
        return parseGeographies ? parseGeographies(geographies) : geographies;
    }

    if (geographies.type === "Topology") {
        return extractFeaturesFromTopology(geographies, parseGeographies);
    }

    if (geographies.type === "FeatureCollection") {
        return extractFeaturesFromCollection(geographies, parseGeographies);
    }

    return [];
}

function extractMeshFromTopology(topology: Topology): {
    outline: MeshGeometry | null;
    borders: MeshGeometry | null;
} | null {
    const objectKeys = Object.keys(topology.objects);
    if (objectKeys.length === 0) {
        return null;
    }

    const firstObjectKey = objectKeys[0];
    if (!firstObjectKey) {
        return null;
    }

    const geometryObject = topology.objects[firstObjectKey];
    if (!geometryObject) {
        return null;
    }

    try {
        const outline = mesh(topology, geometryObject as Parameters<typeof mesh>[1], (a, b) => a === b) as MeshGeometry;

        const borders = mesh(topology, geometryObject as Parameters<typeof mesh>[1], (a, b) => a !== b) as MeshGeometry;

        return { outline, borders };
    } catch {
        return null;
    }
}

export function getMesh(
    geographies: Topology | FeatureCollection | Feature<Geometry>[],
): { outline: MeshGeometry | null; borders: MeshGeometry | null } | null {
    if (geographies && typeof geographies === "object" && !Array.isArray(geographies) && "type" in geographies && geographies.type === "Topology") {
        return extractMeshFromTopology(geographies as Topology);
    }

    return null;
}

export function prepareMesh(outline: MeshGeometry | null, borders: MeshGeometry | null, path: GeoPath): { outline?: string; borders?: string } {
    const result: { outline?: string; borders?: string } = {};

    if (outline) {
        const outlinePath = path(outline);
        if (outlinePath) {
            result.outline = outlinePath;
        }
    }

    if (borders) {
        const bordersPath = path(borders);
        if (bordersPath) {
            result.borders = bordersPath;
        }
    }

    return result;
}

export function prepareFeatures(features: Feature<Geometry>[] | undefined, path: GeoPath): PreparedFeature[] {
    if (!features || features.length === 0) {
        return [];
    }

    return features
        .map((feature) => {
            const svgPath = path(feature);
            if (!svgPath) {
                return null;
            }

            return {
                ...feature,
                svgPath,
            } as PreparedFeature;
        })
        .filter((feature): feature is PreparedFeature => feature !== null);
}

export function createConnectorPath(start: [number, number], end: [number, number], curve: unknown): string {
    if (typeof curve !== "function") {
        return "";
    }

    try {
        const curveFactory = curve as () => {
            x: (fn: (d: [number, number]) => number) => {
                y: (fn: (d: [number, number]) => number) => (data: [number, number][]) => string;
            };
            y: (fn: (d: [number, number]) => number) => (data: [number, number][]) => string;
        };

        const line = curveFactory()
            .x((d: [number, number]) => d[0])
            .y((d: [number, number]) => d[1]);

        return line([start, end]) || "";
    } catch {
        return "";
    }
}
