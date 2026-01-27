import { describe, it, expect } from "vitest";
import { createGeographyFetchError, createValidationError, createSecurityError, createGeographyError } from "../src/utils/error-utils";
import { GeographyError } from "../src/types";

describe("Error Utils", () => {
    describe("createGeographyFetchError", () => {
        it("creates basic error", () => {
            const err = createGeographyFetchError("GEOGRAPHY_LOAD_ERROR", "Failed");
            expect(err.message).toBe("Failed");
            expect(err.type).toBe("GEOGRAPHY_LOAD_ERROR");
            expect(err.name).toBe("GeographyError");
            expect(err.timestamp).toBeDefined();
        });

        it("includes url info", () => {
            const err = createGeographyFetchError("GEOGRAPHY_LOAD_ERROR", "Failed", "http://example.com");
            expect(err.geography).toBe("http://example.com");
        });

        it("wraps original error", () => {
            const original = new Error("Network");
            const err = createGeographyFetchError("GEOGRAPHY_LOAD_ERROR", "Failed", undefined, original);
            expect(err.cause).toBe(original);
            expect(err.details?.originalMessage).toBe("Network");
            expect(err.details?.originalName).toBe("Error");
            expect(err.stack).toBe(original.stack);
        });
    });

    describe("createValidationError", () => {
        it("creates validation error with field info", () => {
            const err = createValidationError("Invalid input", "username", "bob");
            expect(err.type).toBe("VALIDATION_ERROR");
            expect(err.message).toBe("Invalid input");
            expect((err as GeographyError & { field: string }).field).toBe("username");
            expect((err as GeographyError & { value: string }).value).toBe("bob");
        });
    });

    describe("createSecurityError", () => {
        it("creates security error with operation info", () => {
            const err = createSecurityError("XSS detected", "sanitize");
            expect(err.type).toBe("SECURITY_ERROR");
            expect(err.message).toBe("XSS detected");
            expect((err as GeographyError & { operation: string }).operation).toBe("sanitize");
        });
    });

    describe("createGeographyError", () => {
        it("creates simple error", () => {
            const err = createGeographyError("GEOGRAPHY_PARSE_ERROR", "Bad JSON");
            expect(err.type).toBe("GEOGRAPHY_PARSE_ERROR");
            expect(err.message).toBe("Bad JSON");
        });

        it("includes optional details", () => {
            const details = { line: 1 };
            const err = createGeographyError("GEOGRAPHY_PARSE_ERROR", "Bad JSON", "file.json", details);
            expect(err.geography).toBe("file.json");
            expect(err.details).toEqual(details);
        });
    });
});
