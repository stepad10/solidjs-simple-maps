import { createContext, useContext, createMemo, mergeProps, JSX } from 'solid-js';
import * as d3Geo from 'd3-geo';
import { GeoProjection } from 'd3-geo';
import { MapContextType, ProjectionConfig } from '../types';
import { createGeographyError } from '../utils';
import {
    validateProjectionConfig,
    sanitizeString,
} from '../utils/input-validation';

const { geoPath, ...projections } = d3Geo;

export const MapContext = createContext<MapContextType | undefined>(undefined);

interface MakeProjectionParams {
    projectionConfig?: ProjectionConfig;
    projection: string | GeoProjection;
    width: number;
    height: number;
}

const makeProjection = ({
    projectionConfig = {},
    projection = 'geoEqualEarth',
    width = 800,
    height = 600,
}: MakeProjectionParams): GeoProjection => {
    const isFunc = typeof projection === 'function';

    if (isFunc) return projection as GeoProjection;

    // Validate and sanitize projection input
    const sanitizedProjection = sanitizeString(projection);

    // Validate projection configuration
    const validatedConfig = validateProjectionConfig(projectionConfig);

    const projectionName = sanitizedProjection as keyof typeof projections;
    if (!(projectionName in projections)) {
        throw createGeographyError(
            'PROJECTION_ERROR',
            `Unknown projection: ${sanitizedProjection}`,
            undefined,
            { availableProjections: Object.keys(projections) },
        );
    }

    let proj = (projections[projectionName] as () => GeoProjection)().translate([
        width / 2,
        height / 2,
    ]);

    // Apply validated projection configuration
    if (validatedConfig.center && proj.center) {
        proj = proj.center(validatedConfig.center);
    }
    if (validatedConfig.rotate && proj.rotate) {
        proj = proj.rotate(validatedConfig.rotate);
    }
    if (validatedConfig.scale && proj.scale) {
        proj = proj.scale(validatedConfig.scale);
    }

    return proj;
};

interface MapProviderProps {
    width?: number; // Optional because we use mergeProps
    height?: number;
    projection?: string | GeoProjection;
    projectionConfig?: ProjectionConfig;
    children: JSX.Element;
}

export const MapProvider = (props: MapProviderProps) => {
    const merged = mergeProps(
        {
            width: 800,
            height: 600,
            projection: 'geoEqualEarth',
            projectionConfig: {},
        },
        props,
    );

    const projMemo = createMemo(() => {
        return makeProjection({
            projectionConfig: merged.projectionConfig,
            projection: merged.projection,
            width: merged.width,
            height: merged.height,
        });
    });

    const pathMemo = createMemo(() => {
        return geoPath().projection(projMemo());
    });

    const value: MapContextType = {
        // Return accessors for reactivity
        width: () => merged.width,
        height: () => merged.height,
        projection: projMemo,
        path: pathMemo,
    };

    return <MapContext.Provider value={value}>{merged.children}</MapContext.Provider>;
};

export const useMapContext = (): MapContextType => {
    const context = useContext(MapContext);
    if (context === undefined) {
        throw createGeographyError(
            'CONTEXT_ERROR',
            'useMapContext must be used within a MapProvider',
        );
    }
    return context;
};
