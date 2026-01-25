import { GeographyError } from '../types';

export function createGeographyFetchError(
    type: GeographyError['type'],
    message: string,
    url?: string,
    originalError?: Error,
): GeographyError {
    const error = new Error(message) as GeographyError;
    error.name = 'GeographyError';
    error.type = type;
    error.timestamp = new Date().toISOString();

    if (url) {
        error.geography = url;
    }

    if (originalError) {
        error.cause = originalError;
        if (originalError.stack) {
            error.stack = originalError.stack;
        }
        error.details = {
            originalMessage: originalError.message,
            originalName: originalError.name,
        };
    }

    return error;
}

export function createValidationError(
    message: string,
    field: string,
    value: unknown,
): GeographyError {
    const error = createGeographyFetchError('VALIDATION_ERROR', message);

    (error as GeographyError & { field?: string; value?: unknown }).field = field;
    (error as GeographyError & { field?: string; value?: unknown }).value = value;

    return error;
}

export function createSecurityError(
    message: string,
    operation: string,
): GeographyError {
    const error = createGeographyFetchError('SECURITY_ERROR', message);

    (error as GeographyError & { operation?: string }).operation = operation;

    return error;
}

// Originally in src/utils.ts
export function createGeographyError(
    type: GeographyError['type'],
    message: string,
    geography?: string,
    details?: Record<string, unknown>,
): GeographyError {
    const error = new Error(message) as GeographyError;
    error.type = type;
    if (geography) error.geography = geography;
    if (details) error.details = details;
    return error;
}
