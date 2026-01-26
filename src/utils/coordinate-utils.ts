import { ZoomTransform } from "d3-zoom";
import { Coordinates, createCoordinates } from "../types";

export function getCoords(w: number, h: number, t: ZoomTransform): Coordinates {
    const xOffset = (w * t.k - w) / 2;
    const yOffset = (h * t.k - h) / 2;
    const lon = w / 2 - (xOffset + t.x) / t.k;
    const lat = h / 2 - (yOffset + t.y) / t.k;
    return createCoordinates(lon, lat);
}

export function screenToMapCoordinates(screenX: number, screenY: number, width: number, height: number, transform: ZoomTransform): Coordinates {
    const mapX = (screenX - transform.x) / transform.k;
    const mapY = (screenY - transform.y) / transform.k;

    const lon = (mapX / width) * 360 - 180;
    const lat = 90 - (mapY / height) * 180;

    return createCoordinates(lon, lat);
}

export function mapToScreenCoordinates(coordinates: Coordinates, width: number, height: number, transform: ZoomTransform): [number, number] {
    const [lon, lat] = coordinates;

    const mapX = ((lon + 180) / 360) * width;
    const mapY = ((90 - lat) / 180) * height;

    const screenX = mapX * transform.k + transform.x;
    const screenY = mapY * transform.k + transform.y;

    return [screenX, screenY];
}

export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;

    const R = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

export function toDegrees(radians: number): number {
    return radians * (180 / Math.PI);
}

export function normalizeLongitude(longitude: number): number {
    while (longitude > 180) longitude -= 360;
    while (longitude < -180) longitude += 360;
    return longitude;
}

export function normalizeLatitude(latitude: number): number {
    return Math.max(-90, Math.min(90, latitude));
}

export function createNormalizedCoordinates(lon: number, lat: number): Coordinates {
    return createCoordinates(normalizeLongitude(lon), normalizeLatitude(lat));
}
