import { describe, it, expect } from "vitest";
import { zoomIdentity } from "d3-zoom";
import {
    getCoords,
    screenToMapCoordinates,
    mapToScreenCoordinates,
    calculateDistance,
    toDegrees,
    normalizeLongitude,
    normalizeLatitude,
    createNormalizedCoordinates,
} from "../src/utils/coordinate-utils";
import { createCoordinates } from "../src/types";

describe("Coordinate Utils", () => {
    describe("getCoords", () => {
        it("calculates coordinates from zoom transform", () => {
            const width = 800;
            const height = 600;
            const transform = zoomIdentity.translate(0, 0).scale(1);

            // At identity, center should be center
            // This function seems to reverse calculate the map center based on transform
            const result = getCoords(width, height, transform);

            // Logic check:
            // xOffset = (800 - 800) / 2 = 0
            // yOffset = (600 - 600) / 2 = 0
            // lon = 400 - (0 + 0)/1 = 400?
            // The formula in getCoords: lon = w/2 - (xOffset + t.x)/t.k
            // This suggests the "coordinates" returned are raw pixels, not geographic lon/lat?
            // Let's verify what the function actually does.
            // It returns `createCoordinates(lon, lat)`.
            // In d3-geo terms, if this is used for projection center, it might be pixel coordinates?

            expect(result).toHaveLength(2);
            expect(result[0]).toBe(400); // 800 / 2
            expect(result[1]).toBe(300); // 600 / 2
        });
    });

    describe("screenToMapCoordinates & mapToScreenCoordinates", () => {
        it("converts back and forth", () => {
            const width = 360; // Simplify math: 1px = 1 degree roughly
            const height = 180;
            const transform = zoomIdentity;

            const screenX = 180; // Middle
            const screenY = 90; // Middle

            const coords = screenToMapCoordinates(screenX, screenY, width, height, transform);
            // x=180 -> (180/360)*360 - 180 = 0
            // y=90 -> 90 - (90/180)*180 = 0

            expect(coords[0]).toBe(0);
            expect(coords[1]).toBe(0);

            const screen = mapToScreenCoordinates(coords, width, height, transform);
            expect(screen[0]).toBe(180);
            expect(screen[1]).toBe(90);
        });

        it("handles zoom and pan", () => {
            const width = 100;
            const height = 50;
            const transform = zoomIdentity.translate(10, 10).scale(2);

            // Map point 0,0
            // mapX = 50, mapY = 25
            // screenX = 50*2 + 10 = 110
            // screenY = 25*2 + 10 = 60

            const screen = mapToScreenCoordinates(createCoordinates(0, 0), width, height, transform);
            expect(screen[0]).toBe(110);
            expect(screen[1]).toBe(60);

            const map = screenToMapCoordinates(110, 60, width, height, transform);
            expect(map[0]).toBeCloseTo(0);
            expect(map[1]).toBeCloseTo(0);
        });
    });

    describe("calculateDistance", () => {
        it("calculates distance between points", () => {
            const p1 = createCoordinates(0, 0);
            const p2 = createCoordinates(0, 0);
            expect(calculateDistance(p1, p2)).toBe(0);
        });

        it("calculates approximate distance", () => {
            // Distance between London (0, 51.5) and Paris (2.35, 48.85) is ~344km
            // Using simplier coordinates to verify formula
            // (0,0) to (1,0) - 1 degree longitude at equator is ~111km
            const dist = calculateDistance(createCoordinates(0, 0), createCoordinates(1, 0));
            expect(dist).toBeCloseTo(111.19, 1);
        });
    });

    describe("Normalization", () => {
        it("normalizes longitude", () => {
            expect(normalizeLongitude(180)).toBe(180);
            expect(normalizeLongitude(190)).toBe(-170);
            expect(normalizeLongitude(540)).toBe(180);
            expect(normalizeLongitude(-190)).toBe(170);
        });

        it("normalizes latitude", () => {
            expect(normalizeLatitude(45)).toBe(45);
            expect(normalizeLatitude(100)).toBe(90);
            expect(normalizeLatitude(-100)).toBe(-90);
        });

        it("creates normalized coordinates", () => {
            expect(createNormalizedCoordinates(190, 100)).toEqual([-170, 90]);
        });
    });

    describe("Math Helpers", () => {
        it("converts radians to degrees", () => {
            // toDegrees is exported
            expect(toDegrees(Math.PI)).toBe(180);
            expect(toDegrees(Math.PI / 2)).toBe(90);
        });
    });
});
