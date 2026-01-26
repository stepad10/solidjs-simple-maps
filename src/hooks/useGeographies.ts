import { createResource, createMemo } from 'solid-js';
import { FeatureCollection } from 'geojson';
import { Topology } from 'topojson-specification';
import { useMapContext } from '../components/MapProvider';
import { UseGeographiesProps, GeographyData } from '../types';
import {
    getFeatures,
    getMesh,
    prepareFeatures,
    prepareMesh,
    isString,
} from '../utils';

// Simple fetcher function
const fetchGeographyData = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch geography: ${response.statusText}`);
    }
    return await response.json();
};

export default function useGeographies(props: UseGeographiesProps) {
    const mapContext = useMapContext();

    const [geographyData] = createResource(
        () => (isString(props.geography) ? props.geography : null),
        fetchGeographyData
    );

    const loadedGeographies = createMemo(() => {
        if (isString(props.geography)) {
            // Prevent throwing if there is an error
            if (geographyData.error) return null;
            return geographyData();
        }
        return props.geography;
    });

    const features = createMemo(() => {
        const data = loadedGeographies();
        if (!data) return [];
        return getFeatures(data, props.parseGeographies);
    });

    const mesh = createMemo(() => {
        const data = loadedGeographies();
        // getMesh handles type checking internally (Topology check)
        if (!data) return null;
        return getMesh(data);
    });

    const preparedFeatures = createMemo(() => {
        return prepareFeatures(features(), mapContext.path());
    });

    const preparedMesh = createMemo(() => {
        return prepareMesh(mesh()?.outline || null, mesh()?.borders || null, mapContext.path());
    });

    return {
        geographies: preparedFeatures,
        outline: () => preparedMesh().outline,
        borders: () => preparedMesh().borders,
        loading: () => isString(props.geography) && geographyData.loading,
        error: () => isString(props.geography) && geographyData.error,
    };
}
