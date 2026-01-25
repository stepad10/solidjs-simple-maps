import { geoCentroid, geoBounds } from 'd3-geo';
import { Feature, Geometry } from 'geojson';
import { Coordinates, createCoordinates } from '../types';

export function getGeographyCentroid(
    geography: Feature<Geometry>,
): Coordinates | null {
    if (!geography?.geometry) {
        return null;
    }

    const centroid = geoCentroid(geography);

    if (
        !centroid ||
        !isFinite(centroid[0]) ||
        !isFinite(centroid[1]) ||
        Math.abs(centroid[0]) > 180 ||
        Math.abs(centroid[1]) > 90
    ) {
        return null;
    }

    return createCoordinates(centroid[0], centroid[1]);
}

export function getGeographyBounds(
    geography: Feature<Geometry>,
): [Coordinates, Coordinates] | null {
    if (!geography?.geometry) {
        return null;
    }

    const bounds = geoBounds(geography);

    if (
        !bounds ||
        !Array.isArray(bounds) ||
        bounds.length !== 2 ||
        !Array.isArray(bounds[0]) ||
        !Array.isArray(bounds[1]) ||
        bounds[0].length !== 2 ||
        bounds[1].length !== 2
    ) {
        return null;
    }

    const [southwest, northeast] = bounds;

    if (
        !isFinite(southwest[0]) ||
        !isFinite(southwest[1]) ||
        !isFinite(northeast[0]) ||
        !isFinite(northeast[1]) ||
        Math.abs(southwest[0]) > 180 ||
        Math.abs(southwest[1]) > 90 ||
        Math.abs(northeast[0]) > 180 ||
        Math.abs(northeast[1]) > 90
    ) {
        return null;
    }

    return [
        createCoordinates(southwest[0], southwest[1]),
        createCoordinates(northeast[0], northeast[1]),
    ];
}

export function getGeographyCoordinates(
    geography: Feature<Geometry>,
): Coordinates | null {
    if (!geography?.geometry) {
        return null;
    }

    const { geometry } = geography;

    switch (geometry.type) {
        case 'Point':
            if (
                geometry.coordinates &&
                Array.isArray(geometry.coordinates) &&
                geometry.coordinates.length >= 2 &&
                typeof geometry.coordinates[0] === 'number' &&
                typeof geometry.coordinates[1] === 'number'
            ) {
                const [lon, lat] = geometry.coordinates;
                return createCoordinates(lon, lat);
            }
            break;

        case 'LineString':
            if (
                geometry.coordinates &&
                Array.isArray(geometry.coordinates) &&
                geometry.coordinates.length > 0 &&
                Array.isArray(geometry.coordinates[0]) &&
                geometry.coordinates[0].length >= 2 &&
                typeof geometry.coordinates[0][0] === 'number' &&
                typeof geometry.coordinates[0][1] === 'number'
            ) {
                const [lon, lat] = geometry.coordinates[0];
                return createCoordinates(lon, lat);
            }
            break;

        case 'Polygon':
            if (
                geometry.coordinates &&
                Array.isArray(geometry.coordinates) &&
                geometry.coordinates.length > 0 &&
                Array.isArray(geometry.coordinates[0]) &&
                geometry.coordinates[0].length > 0 &&
                Array.isArray(geometry.coordinates[0][0]) &&
                geometry.coordinates[0][0].length >= 2 &&
                typeof geometry.coordinates[0][0][0] === 'number' &&
                typeof geometry.coordinates[0][0][1] === 'number'
            ) {
                const [lon, lat] = geometry.coordinates[0][0];
                return createCoordinates(lon, lat);
            }
            break;

        case 'MultiPoint':
            if (
                geometry.coordinates &&
                Array.isArray(geometry.coordinates) &&
                geometry.coordinates.length > 0 &&
                Array.isArray(geometry.coordinates[0]) &&
                geometry.coordinates[0].length >= 2 &&
                typeof geometry.coordinates[0][0] === 'number' &&
                typeof geometry.coordinates[0][1] === 'number'
            ) {
                const [lon, lat] = geometry.coordinates[0];
                return createCoordinates(lon, lat);
            }
            break;

        case 'MultiLineString':
            if (
                geometry.coordinates &&
                Array.isArray(geometry.coordinates) &&
                geometry.coordinates.length > 0 &&
                Array.isArray(geometry.coordinates[0]) &&
                geometry.coordinates[0].length > 0 &&
                Array.isArray(geometry.coordinates[0][0]) &&
                geometry.coordinates[0][0].length >= 2 &&
                typeof geometry.coordinates[0][0][0] === 'number' &&
                typeof geometry.coordinates[0][0][1] === 'number'
            ) {
                const [lon, lat] = geometry.coordinates[0][0];
                return createCoordinates(lon, lat);
            }
            break;

        case 'MultiPolygon':
            if (
                geometry.coordinates &&
                Array.isArray(geometry.coordinates) &&
                geometry.coordinates.length > 0 &&
                Array.isArray(geometry.coordinates[0]) &&
                geometry.coordinates[0].length > 0 &&
                Array.isArray(geometry.coordinates[0][0]) &&
                geometry.coordinates[0][0].length > 0 &&
                Array.isArray(geometry.coordinates[0][0][0]) &&
                geometry.coordinates[0][0][0].length >= 2 &&
                typeof geometry.coordinates[0][0][0][0] === 'number' &&
                typeof geometry.coordinates[0][0][0][1] === 'number'
            ) {
                const [lon, lat] = geometry.coordinates[0][0][0];
                return createCoordinates(lon, lat);
            }
            break;

        case 'GeometryCollection':
            if (
                geometry.geometries &&
                Array.isArray(geometry.geometries) &&
                geometry.geometries.length > 0 &&
                geometry.geometries[0]
            ) {
                return getGeographyCoordinates({
                    ...geography,
                    geometry: geometry.geometries[0],
                });
            }
            break;

        default:
            return null;
    }

    return null;
}

export function getBestGeographyCoordinates(
    geography: Feature<Geometry>,
): Coordinates | null {
    const centroid = getGeographyCentroid(geography);
    if (centroid) {
        return centroid;
    }

    return getGeographyCoordinates(geography);
}

export function isValidCoordinates(coords: unknown): coords is Coordinates {
    return (
        Array.isArray(coords) &&
        coords.length === 2 &&
        typeof coords[0] === 'number' &&
        typeof coords[1] === 'number' &&
        isFinite(coords[0]) &&
        isFinite(coords[1]) &&
        Math.abs(coords[0]) <= 180 &&
        Math.abs(coords[1]) <= 90
    );
}
