import { createGeographyFetchError } from './error-utils';
import { createRotationAngles, createParallels } from '../types';
import type {
    Coordinates,
    ProjectionConfig,
    GeographySecurityConfig,
    SRIConfig,
} from '../types';

export interface ValidationConfig {
    strictMode: boolean;
    allowUnsafeContent: boolean;
    maxStringLength: number;
    maxArrayLength: number;
    maxObjectDepth: number;
}

export const DEFAULT_VALIDATION_CONFIG: ValidationConfig = {
    strictMode: true,
    allowUnsafeContent: false,
    maxStringLength: 10000,
    maxArrayLength: 1000,
    maxObjectDepth: 10,
};

let currentValidationConfig: ValidationConfig = DEFAULT_VALIDATION_CONFIG;

export function configureValidation(config: Partial<ValidationConfig>): void {
    currentValidationConfig = {
        ...DEFAULT_VALIDATION_CONFIG,
        ...config,
    };
}

export function sanitizeString(
    input: unknown,
    allowHTML: boolean = false,
): string {
    if (typeof input !== 'string') {
        throw createGeographyFetchError(
            'VALIDATION_ERROR',
            'VALIDATION_ERROR',
            `Expected string, got ${typeof input}`,
        );
    }

    if (input.length > currentValidationConfig.maxStringLength) {
        throw createGeographyFetchError(
            'VALIDATION_ERROR',
            'VALIDATION_ERROR',
            `String too long: ${input.length} characters (max: ${currentValidationConfig.maxStringLength})`,
        );
    }

    let sanitized = input;

    if (!allowHTML) {
        sanitized = sanitized
            .replace(/<[^>]*>/g, '')
            .replace(/&[^;]+;/g, '')
            .replace(/javascript:/gi, '')
            .replace(/data:/gi, '')
            .replace(/vbscript:/gi, '');
    }

    // eslint-disable-next-line no-control-regex
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    return sanitized;
}

export function validateURL(input: unknown): string {
    const sanitized = sanitizeString(input);

    try {
        const url = new URL(sanitized);

        const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
        if (
            dangerousProtocols.some((protocol) =>
                url.protocol.toLowerCase().startsWith(protocol),
            )
        ) {
            throw createGeographyFetchError(
                'VALIDATION_ERROR',
                'SECURITY_ERROR',
                `Dangerous protocol detected: ${url.protocol}`,
            );
        }

        if (url.hostname.includes('..') || url.hostname.includes('%')) {
            throw createGeographyFetchError(
                'VALIDATION_ERROR',
                'SECURITY_ERROR',
                `Invalid hostname: ${url.hostname}`,
            );
        }

        return url.toString();
    } catch (error) {
        if (error instanceof TypeError) {
            throw createGeographyFetchError(
                'VALIDATION_ERROR',
                'VALIDATION_ERROR',
                `Invalid URL format: ${sanitized}`,
            );
        }
        throw error;
    }
}

export function validateNumber(
    input: unknown,
    min: number = -Infinity,
    max: number = Infinity,
): number {
    if (typeof input !== 'number') {
        throw createGeographyFetchError(
            'VALIDATION_ERROR',
            'VALIDATION_ERROR',
            `Expected number, got ${typeof input}`,
        );
    }

    if (!Number.isFinite(input)) {
        throw createGeographyFetchError(
            'VALIDATION_ERROR',
            'VALIDATION_ERROR',
            'Number must be finite',
        );
    }

    if (input < min || input > max) {
        throw createGeographyFetchError(
            'VALIDATION_ERROR',
            'VALIDATION_ERROR',
            `Number ${input} is outside allowed range [${min}, ${max}]`,
        );
    }

    return input;
}

export function validateCoordinates(input: unknown): Coordinates {
    if (!Array.isArray(input) || input.length !== 2) {
        throw createGeographyFetchError(
            'VALIDATION_ERROR',
            'VALIDATION_ERROR',
            'Coordinates must be an array of exactly 2 numbers',
        );
    }

    const [lon, lat] = input;

    const validatedLon = validateNumber(lon, -180, 180);
    const validatedLat = validateNumber(lat, -90, 90);

    return [validatedLon, validatedLat] as Coordinates;
}

export function validateArray<T>(
    input: unknown,
    itemValidator?: (item: unknown, index: number) => T,
): T[] {
    if (!Array.isArray(input)) {
        throw createGeographyFetchError(
            'VALIDATION_ERROR',
            'VALIDATION_ERROR',
            `Expected array, got ${typeof input}`,
        );
    }

    if (input.length > currentValidationConfig.maxArrayLength) {
        throw createGeographyFetchError(
            'VALIDATION_ERROR',
            'VALIDATION_ERROR',
            `Array too long: ${input.length} items (max: ${currentValidationConfig.maxArrayLength})`,
        );
    }

    if (itemValidator) {
        return input.map((item, index) => {
            try {
                return itemValidator(item, index);
            } catch (error) {
                throw createGeographyFetchError(
                    'VALIDATION_ERROR',
                    'VALIDATION_ERROR',
                    `Invalid array item at index ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`,
                );
            }
        });
    }

    return input as T[];
}

export function validateObject(
    input: unknown,
    depth: number = 0,
): Record<string, unknown> {
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
        throw createGeographyFetchError(
            'VALIDATION_ERROR',
            'VALIDATION_ERROR',
            `Expected object, got ${typeof input}`,
        );
    }

    if (depth > currentValidationConfig.maxObjectDepth) {
        throw createGeographyFetchError(
            'VALIDATION_ERROR',
            'VALIDATION_ERROR',
            `Object nesting too deep: ${depth} levels (max: ${currentValidationConfig.maxObjectDepth})`,
        );
    }

    const obj = input as Record<string, unknown>;
    const validated: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = sanitizeString(key);

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            validated[sanitizedKey] = validateObject(value, depth + 1);
        } else {
            validated[sanitizedKey] = value;
        }
    }

    return validated;
}

export function validateProjectionConfig(input: unknown): ProjectionConfig {
    const obj = validateObject(input);
    const config: ProjectionConfig = {};

    if ('center' in obj && obj.center !== undefined) {
        config.center = validateCoordinates(obj.center);
    }

    if ('rotate' in obj && obj.rotate !== undefined) {
        if (Array.isArray(obj.rotate)) {
            const rotateArray = validateArray(obj.rotate, (item) =>
                validateNumber(item, -360, 360),
            );
            if (
                rotateArray.length === 3 &&
                rotateArray[0] !== undefined &&
                rotateArray[1] !== undefined &&
                rotateArray[2] !== undefined
            ) {
                config.rotate = createRotationAngles(
                    rotateArray[0],
                    rotateArray[1],
                    rotateArray[2],
                );
            }
        }
    }

    if ('scale' in obj && obj.scale !== undefined) {
        config.scale = validateNumber(obj.scale, 0.1, 10000);
    }

    if ('parallels' in obj && obj.parallels !== undefined) {
        if (Array.isArray(obj.parallels)) {
            const parallelsArray = validateArray(obj.parallels, (item) =>
                validateNumber(item, -90, 90),
            );
            if (
                parallelsArray.length === 2 &&
                parallelsArray[0] !== undefined &&
                parallelsArray[1] !== undefined
            ) {
                config.parallels = createParallels(
                    parallelsArray[0],
                    parallelsArray[1],
                );
            }
        }
    }

    return config;
}

export function sanitizeSVG(svgContent: string): string {
    if (!currentValidationConfig.allowUnsafeContent) {
        let sanitized = svgContent
            .replace(/<script[^>]*>.*?<\/script>/gis, '')
            .replace(/<iframe[^>]*>.*?<\/iframe>/gis, '')
            .replace(/<object[^>]*>.*?<\/object>/gis, '')
            .replace(/<embed[^>]*>/gis, '')
            .replace(/on\w+\s*=/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/data:(?!image\/)/gi, '')
            .replace(/vbscript:/gi, '');

        const dangerousAttrs = [
            'onload',
            'onerror',
            'onclick',
            'onmouseover',
            'onmouseout',
            'onfocus',
            'onblur',
            'onchange',
            'onsubmit',
            'onreset',
        ];

        dangerousAttrs.forEach((attr) => {
            const regex = new RegExp(`\\s${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
            sanitized = sanitized.replace(regex, '');
        });

        return sanitized;
    }

    return svgContent;
}

export function validateSecurityConfig(
    input: unknown,
): Partial<GeographySecurityConfig> {
    const obj = validateObject(input);
    const config: Partial<GeographySecurityConfig> = {};

    if ('TIMEOUT_MS' in obj && obj.TIMEOUT_MS !== undefined) {
        config.TIMEOUT_MS = validateNumber(obj.TIMEOUT_MS, 1000, 60000);
    }

    if ('MAX_RESPONSE_SIZE' in obj && obj.MAX_RESPONSE_SIZE !== undefined) {
        config.MAX_RESPONSE_SIZE = validateNumber(
            obj.MAX_RESPONSE_SIZE,
            1024,
            100 * 1024 * 1024,
        );
    }

    if (
        'ALLOWED_CONTENT_TYPES' in obj &&
        obj.ALLOWED_CONTENT_TYPES !== undefined
    ) {
        config.ALLOWED_CONTENT_TYPES = validateArray(
            obj.ALLOWED_CONTENT_TYPES,
            (item) => sanitizeString(item),
        );
    }

    if ('ALLOWED_PROTOCOLS' in obj && obj.ALLOWED_PROTOCOLS !== undefined) {
        config.ALLOWED_PROTOCOLS = validateArray(obj.ALLOWED_PROTOCOLS, (item) => {
            const protocol = sanitizeString(item);
            if (!['https:', 'http:'].includes(protocol)) {
                throw createGeographyFetchError(
                    'VALIDATION_ERROR',
                    'VALIDATION_ERROR',
                    `Invalid protocol: ${protocol}`,
                );
            }
            return protocol;
        });
    }

    if ('ALLOW_HTTP_LOCALHOST' in obj && obj.ALLOW_HTTP_LOCALHOST !== undefined) {
        if (typeof obj.ALLOW_HTTP_LOCALHOST !== 'boolean') {
            throw createGeographyFetchError(
                'VALIDATION_ERROR',
                'VALIDATION_ERROR',
                'ALLOW_HTTP_LOCALHOST must be a boolean',
            );
        }
        config.ALLOW_HTTP_LOCALHOST = obj.ALLOW_HTTP_LOCALHOST;
    }

    if ('STRICT_HTTPS_ONLY' in obj && obj.STRICT_HTTPS_ONLY !== undefined) {
        if (typeof obj.STRICT_HTTPS_ONLY !== 'boolean') {
            throw createGeographyFetchError(
                'VALIDATION_ERROR',
                'VALIDATION_ERROR',
                'STRICT_HTTPS_ONLY must be a boolean',
            );
        }
        config.STRICT_HTTPS_ONLY = obj.STRICT_HTTPS_ONLY;
    }

    return config;
}

export function validateSRIConfig(input: unknown): SRIConfig {
    const obj = validateObject(input);

    if (
        !('algorithm' in obj) ||
        !('hash' in obj) ||
        !('enforceIntegrity' in obj)
    ) {
        throw createGeographyFetchError(
            'VALIDATION_ERROR',
            'VALIDATION_ERROR',
            'SRI config must have algorithm, hash, and enforceIntegrity properties',
        );
    }

    const algorithm = sanitizeString(obj.algorithm);
    if (!['sha256', 'sha384', 'sha512'].includes(algorithm)) {
        throw createGeographyFetchError(
            'VALIDATION_ERROR',
            'VALIDATION_ERROR',
            `Invalid SRI algorithm: ${algorithm}`,
        );
    }

    const hash = sanitizeString(obj.hash);
    if (!hash.startsWith(`${algorithm}-`)) {
        throw createGeographyFetchError(
            'VALIDATION_ERROR',
            'VALIDATION_ERROR',
            `SRI hash must start with ${algorithm}-`,
        );
    }

    if (typeof obj.enforceIntegrity !== 'boolean') {
        throw createGeographyFetchError(
            'VALIDATION_ERROR',
            'VALIDATION_ERROR',
            'enforceIntegrity must be a boolean',
        );
    }

    return {
        algorithm: algorithm as 'sha256' | 'sha384' | 'sha512',
        hash,
        enforceIntegrity: obj.enforceIntegrity,
    };
}

export function validateClassName(input: unknown): string {
    const sanitized = sanitizeString(input);
    const cleanClassName = sanitized
        .replace(/[^a-zA-Z0-9\-_\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    if (cleanClassName.length === 0) {
        return '';
    }

    return cleanClassName;
}

export function validateStyleObject(
    input: unknown,
): Record<string, string | number> {
    if (input === null || input === undefined) {
        return {};
    }

    const obj = validateObject(input);
    const sanitizedStyle: Record<string, string | number> = {};

    const allowedProperties = [
        'fill',
        'stroke',
        'strokeWidth',
        'strokeDasharray',
        'strokeLinecap',
        'strokeLinejoin',
        'opacity',
        'fillOpacity',
        'strokeOpacity',
        'transform',
        'cursor',
        'pointerEvents',
        'transition',
        'fontSize',
        'fontFamily',
        'fontWeight',
        'textAnchor',
        'alignmentBaseline',
        'dominantBaseline',
    ];

    for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = sanitizeString(key);

        if (!allowedProperties.includes(sanitizedKey)) {
            continue;
        }

        if (typeof value === 'string') {
            const sanitizedValue = sanitizeString(value);

            if (
                sanitizedValue.includes('javascript:') ||
                sanitizedValue.includes('expression(') ||
                sanitizedValue.includes('url(') ||
                sanitizedValue.includes('@import')
            ) {
                continue;
            }

            sanitizedStyle[sanitizedKey] = sanitizedValue;
        } else if (typeof value === 'number' && isFinite(value)) {
            sanitizedStyle[sanitizedKey] = value;
        }
    }

    return sanitizedStyle;
}

export function validateEventHandler(input: unknown): Function | undefined {
    if (input === null || input === undefined) {
        return undefined;
    }

    if (typeof input !== 'function') {
        throw createGeographyFetchError(
            'VALIDATION_ERROR',
            'VALIDATION_ERROR',
            `Event handler must be a function, got ${typeof input}`,
        );
    }

    const funcString = input.toString();
    const dangerousPatterns = [
        'eval(',
        'Function(',
        'setTimeout(',
        'setInterval(',
        'document.write',
        'innerHTML',
        'outerHTML',
        'insertAdjacentHTML',
    ];

    for (const pattern of dangerousPatterns) {
        if (funcString.includes(pattern)) {
            throw createGeographyFetchError(
                'VALIDATION_ERROR',
                'SECURITY_ERROR',
                `Event handler contains potentially dangerous code: ${pattern}`,
            );
        }
    }

    return input as Function;
}

export function validateComponentProps(
    props: unknown,
    allowedProps: readonly string[],
): Record<string, unknown> {
    const obj = validateObject(props);
    const validatedProps: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = sanitizeString(key);

        if (!allowedProps.includes(sanitizedKey)) {
            continue;
        }

        if (sanitizedKey === 'className') {
            validatedProps[sanitizedKey] = validateClassName(value);
        } else if (sanitizedKey === 'style') {
            validatedProps[sanitizedKey] = validateStyleObject(value);
        } else if (sanitizedKey.startsWith('on') && typeof value === 'function') {
            validatedProps[sanitizedKey] = validateEventHandler(value);
        } else if (typeof value === 'string') {
            validatedProps[sanitizedKey] = sanitizeString(value);
        } else if (typeof value === 'number' && isFinite(value)) {
            validatedProps[sanitizedKey] = value;
        } else if (typeof value === 'boolean') {
            validatedProps[sanitizedKey] = value;
        } else if (Array.isArray(value)) {
            validatedProps[sanitizedKey] = validateArray(value);
        } else if (value !== null && typeof value === 'object') {
            validatedProps[sanitizedKey] = validateObject(value);
        }
    }

    return validatedProps;
}
