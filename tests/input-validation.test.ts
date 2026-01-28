import { describe, it, expect, afterEach } from "vitest";
import {
    validateNumber,
    validateCoordinates,
    sanitizeString,
    validateProjectionConfig,
    validateSecurityConfig,
    validateURL,
    configureValidation,
    DEFAULT_VALIDATION_CONFIG,
    validateArray,
    validateObject,
    sanitizeSVG,
    validateStyleObject,
    validateEventHandler,
    validateComponentProps,
} from "../src/utils/input-validation";
import { createRotationAngles, createParallels, ProjectionConfig } from "../src/types";

describe("Input Validation Utils", () => {
    afterEach(() => {
        configureValidation(DEFAULT_VALIDATION_CONFIG);
    });

    describe("validateNumber", () => {
        it("validates correct numbers", () => {
            expect(validateNumber(10)).toBe(10);
            expect(validateNumber(0)).toBe(0);
            expect(validateNumber(-10)).toBe(-10);
        });

        it("throws for non-numbers", () => {
            expect(() => validateNumber("10")).toThrow("Expected number");
            expect(() => validateNumber(null)).toThrow("Expected number");
        });

        it("throws for infinite numbers", () => {
            expect(() => validateNumber(Infinity)).toThrow("Number must be finite");
            expect(() => validateNumber(-Infinity)).toThrow("Number must be finite");
            expect(() => validateNumber(NaN)).toThrow("Number must be finite");
        });

        it("enforces range constraints", () => {
            expect(() => validateNumber(10, 0, 5)).toThrow("outside allowed range");
            expect(() => validateNumber(-1, 0, 10)).toThrow("outside allowed range");
            expect(validateNumber(5, 0, 10)).toBe(5);
        });
    });

    describe("validateCoordinates", () => {
        it("validates correct coordinates", () => {
            const coords = [100, 50];
            const result = validateCoordinates(coords);
            expect(result).toEqual(coords);
        });

        it("throws for invalid formats", () => {
            expect(() => validateCoordinates([100])).toThrow("exactly 2 numbers");
            expect(() => validateCoordinates([100, 50, 20])).toThrow("exactly 2 numbers");
            expect(() => validateCoordinates("100,50")).toThrow("must be an array");
        });

        it("validates ranges for lon/lat", () => {
            expect(() => validateCoordinates([190, 0])).toThrow("outside allowed range");
            expect(() => validateCoordinates([0, 95])).toThrow("outside allowed range");
        });
    });

    describe("sanitizeString", () => {
        it("returns clean strings as is", () => {
            expect(sanitizeString("Hello World")).toBe("Hello World");
        });

        it("strips HTML tags when not allowed", () => {
            expect(sanitizeString("Hello <b>World</b>")).toBe("Hello World");
            expect(sanitizeString("<script>alert(1)</script>")).toBe("alert(1)");
        });

        it("removes dangerous prefixes", () => {
            expect(sanitizeString("javascript:alert(1)")).toBe("alert(1)");
            expect(sanitizeString("data:text/plain,hello")).toBe("text/plain,hello");
            expect(sanitizeString("vbscript:run()")).toBe("run()");
        });

        it("enforces max length", () => {
            configureValidation({ maxStringLength: 5 });
            expect(() => sanitizeString("Too long")).toThrow("String too long");
        });
    });

    describe("validateURL", () => {
        it("allows valid URLs", () => {
            expect(validateURL("https://example.com")).toBe("https://example.com/");
        });

        it("throws for invalid URL format", () => {
            expect(() => validateURL("not-a-url")).toThrow("Invalid URL format");
        });

        it("blocks dangerous protocols", () => {
            expect(() => validateURL("javascript:alert(1)")).toThrow(/Invalid URL format|Dangerous protocol/);
            expect(() => validateURL("file:///etc/passwd")).toThrow("Dangerous protocol detected");
        });

        it("blocks invalid hostnames", () => {
            expect(() => validateURL("https://example.com/../../etc")).not.toThrow();
            expect(() => validateURL("https://%2e%2e/")).toThrow("Invalid hostname");
        });
    });

    describe("validateProjectionConfig", () => {
        it("validates valid config", () => {
            const input = {
                scale: 100,
                center: [0, 0],
                rotate: [0, -10, 0],
            };
            const result = validateProjectionConfig(input);
            expect(result.scale).toBe(100);
            expect(result.center).toEqual([0, 0]);
            expect(result.rotate).toEqual(createRotationAngles(0, -10, 0));
        });

        it("ignores extra properties but validates shape", () => {
            const input = {
                scale: 100,
                unknownProp: "test",
            };
            const result = validateProjectionConfig(input);
            expect(result.scale).toBe(100);
            expect((result as Record<string, unknown>).unknownProp).toBeUndefined();
        });

        it("validates parallels", () => {
            const input = { parallels: [10, 20] };
            const result = validateProjectionConfig(input);
            expect(result.parallels).toEqual(createParallels(10, 20));
        });

        it("rejects invalid rotation", () => {
            const input = { rotate: [0, "bad", 0] };
            expect(() => validateProjectionConfig(input)).toThrow("Expected number");
        });

        it("rejects invalid input type", () => {
            expect(() => validateProjectionConfig("invalid" as unknown as ProjectionConfig)).toThrow("Expected object");
        });
    });

    describe("validateSecurityConfig", () => {
        it("validates valid config", () => {
            const result = validateSecurityConfig({
                TIMEOUT_MS: 5000,
                MAX_RESPONSE_SIZE: 2048,
                STRICT_HTTPS_ONLY: true,
            });
            expect(result.TIMEOUT_MS).toBe(5000);
            expect(result.MAX_RESPONSE_SIZE).toBe(2048);
            expect(result.STRICT_HTTPS_ONLY).toBe(true);
        });

        it("throws for out of range numbers", () => {
            expect(() => validateSecurityConfig({ TIMEOUT_MS: 10 })).toThrow("outside allowed range");
        });
    });

    describe("validateArray", () => {
        it("validates array structure", () => {
            expect(validateArray([1, 2, 3])).toEqual([1, 2, 3]);
        });

        it("throws for non-arrays", () => {
            expect(() => validateArray("not-array")).toThrow("Expected array");
        });

        it("enforces max length", () => {
            configureValidation({ maxArrayLength: 2 });
            expect(() => validateArray([1, 2, 3])).toThrow("Array too long");
        });

        it("uses item validator", () => {
            const validator = (item: unknown) => validateNumber(item as number);
            expect(validateArray([1, 2], validator)).toEqual([1, 2]);
            expect(() => validateArray([1, "bad"], validator)).toThrow("Invalid array item at index 1");
        });
    });

    describe("validateObject", () => {
        it("validates object structure", () => {
            expect(validateObject({ a: 1 })).toEqual({ a: 1 });
        });

        it("throws for non-objects", () => {
            expect(() => validateObject("not-object")).toThrow("Expected object");
            expect(() => validateObject(null)).toThrow("Expected object");
            expect(() => validateObject([])).toThrow("Expected object");
        });

        it("enforces max depth", () => {
            configureValidation({ maxObjectDepth: 1 });
            expect(() => validateObject({ a: { b: { c: 1 } } })).toThrow("Object nesting too deep");
        });

        it("recursively validates", () => {
            const input = { a: { b: 1 } };
            expect(validateObject(input)).toEqual(input);
        });
    });

    describe("sanitizeSVG", () => {
        it("sanitizes dangerous tags", () => {
            const input = "<script>alert(1)</script><svg>content</svg>";
            expect(sanitizeSVG(input)).toBe("<svg>content</svg>");
        });

        it("sanitizes dangerous attributes", () => {
            const input = '<svg onclick="alert(1)">content</svg>';
            expect(sanitizeSVG(input)).toBe("<svg>content</svg>");
        });

        it("allows safe content when allowUnsafeContent is true", () => {
            configureValidation({ allowUnsafeContent: true });
            const input = "<script>alert(1)</script>";
            expect(sanitizeSVG(input)).toBe(input);
        });
        it("returns empty string for invalid input", () => {
            expect(sanitizeSVG({} as unknown as string)).toBe("");
        });
        it("allows safe style properties", () => {
            const style = { fill: "red", "stroke-width": 2, fontSize: "12px" };
            expect(validateStyleObject(style)).toEqual(style);
        });

        it("strips unknown properties", () => {
            expect(validateStyleObject({ unknown: "value", fill: "red" })).toEqual({ fill: "red" });
        });

        it("sanitizes string values", () => {
            const style = { fill: "url(javascript:alert(1))", stroke: "blue" };
            expect(validateStyleObject(style)).toEqual({ stroke: "blue" });
        });
    });

    describe("validateEventHandler", () => {
        it("allows safe functions", () => {
            const handler = () => {};
            expect(validateEventHandler(handler)).toBe(handler);
        });

        it("throws on dangerous code patterns", () => {
            const dangerous = () => eval("alert(1)");
            expect(() => validateEventHandler(dangerous)).toThrow("potentially dangerous code");
        });

        it("returns undefined for null/undefined", () => {
            expect(validateEventHandler(null)).toBeUndefined();
        });
    });

    describe("validateComponentProps", () => {
        it("filters props", () => {
            const props = {
                class: "test-class",
                style: { fill: "red" },
                onClick: () => {},
                unknown: "value",
            };
            const allowed = ["class", "style", "onClick"];

            const result = validateComponentProps(props, allowed);
            expect(result.class).toBe("test-class");
            expect(result.style).toEqual({ fill: "red" });
            expect(result.onClick).toBeDefined();
            expect(result.unknown).toBeUndefined();
        });
    });
});
