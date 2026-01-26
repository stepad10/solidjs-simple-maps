import { createMemo, mergeProps, splitProps } from "solid-js";
import { ComposableMapProps } from "../types";
import ComposableMap from "./ComposableMap";
import { MapMetadata, mapMetadataPresets } from "./MapMetadata";

// Enhanced metadata props for the wrapper component
export interface MapWithMetadataProps extends ComposableMapProps {
    // Override metadata to make it required for this component
    metadata: Required<NonNullable<ComposableMapProps["metadata"]>>;

    // Additional metadata options
    enableSEO?: boolean;
    enableOpenGraph?: boolean;
    enableTwitterCards?: boolean;
    enableJsonLd?: boolean;

    // Custom metadata presets
    preset?: keyof typeof mapMetadataPresets;
}

export default function MapWithMetadata(props: MapWithMetadataProps) {
    const merged = mergeProps(
        {
            enableSEO: true,
            enableOpenGraph: true,
            enableTwitterCards: true,
            enableJsonLd: true,
            preset: "worldMap" as const,
        },
        props,
    );

    const [local, mapProps] = splitProps(merged, ["metadata", "enableSEO", "enableOpenGraph", "enableTwitterCards", "enableJsonLd", "preset", "children"]);

    // Memoize the processed metadata to prevent unnecessary recalculations
    const processedMetadata = createMemo(() => {
        const presetData = mapMetadataPresets[local.preset];

        // Handle function presets (like countryMap)
        const resolvedPresetData =
            typeof presetData === "function"
                ? presetData("Default") // Provide a default parameter for function presets
                : presetData;

        return {
            title: local.metadata.title || resolvedPresetData.title,
            description: local.metadata.description || resolvedPresetData.description,
            keywords: local.metadata.keywords || resolvedPresetData.keywords,
            author: local.metadata.author || resolvedPresetData.author || "",
            canonicalUrl: local.metadata.canonicalUrl || "",
            ogTitle: local.enableOpenGraph ? local.metadata.title || resolvedPresetData.ogTitle : undefined,
            ogDescription: local.enableOpenGraph ? local.metadata.description || resolvedPresetData.ogDescription : undefined,
            twitterTitle: local.enableTwitterCards ? local.metadata.title || resolvedPresetData.twitterTitle : undefined,
            twitterDescription: local.enableTwitterCards ? local.metadata.description || resolvedPresetData.twitterDescription : undefined,
            jsonLd: local.enableJsonLd ? resolvedPresetData.jsonLd : undefined,
        };
    });

    return (
        <>
            {local.enableSEO && (
                <MapMetadata
                    title={processedMetadata().title}
                    description={processedMetadata().description}
                    keywords={processedMetadata().keywords}
                    author={processedMetadata().author}
                    canonicalUrl={processedMetadata().canonicalUrl}
                    ogTitle={processedMetadata().ogTitle}
                    ogDescription={processedMetadata().ogDescription}
                    twitterTitle={processedMetadata().twitterTitle}
                    twitterDescription={processedMetadata().twitterDescription}
                    jsonLd={processedMetadata().jsonLd}
                />
            )}
            <ComposableMap {...mapProps}>{local.children}</ComposableMap>
        </>
    );
}
