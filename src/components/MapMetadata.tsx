import { JSX, Show } from "solid-js";
import { Title, Meta, Link } from "@solidjs/meta";

export interface MapMetadataProps {
    title?: string;
    description?: string;
    keywords?: string[];
    author?: string;
    viewport?: string;
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogUrl?: string;
    twitterCard?: "summary" | "summary_large_image" | "app" | "player";
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
    jsonLd?: object;
    children?: JSX.Element;
}

/**
 * MapMetadata component using SolidJS meta tags
 * Provides SEO and social media optimization for map components
 */
export function MapMetadata(props: MapMetadataProps) {
    const merged = () => ({
        keywords: [],
        viewport: "width=device-width, initial-scale=1",
        twitterCard: "summary_large_image" as const,
        ...props,
    });

    return (
        <>
            {/* Basic metadata */}
            <Show when={props.title}>
                <Title>{props.title}</Title>
            </Show>
            <Show when={props.description}>
                <Meta name="description" content={props.description} />
            </Show>
            <Show when={merged().keywords && merged().keywords!.length > 0}>
                <Meta name="keywords" content={merged().keywords!.join(", ")} />
            </Show>
            <Show when={props.author}>
                <Meta name="author" content={props.author} />
            </Show>
            <Meta name="viewport" content={merged().viewport} />

            {/* Canonical URL */}
            <Show when={props.canonicalUrl}>
                <Link rel="canonical" href={props.canonicalUrl} />
            </Show>

            {/* Open Graph metadata */}
            <Show when={props.ogTitle}>
                <Meta property="og:title" content={props.ogTitle} />
            </Show>
            <Show when={props.ogDescription}>
                <Meta property="og:description" content={props.ogDescription} />
            </Show>
            <Show when={props.ogImage}>
                <Meta property="og:image" content={props.ogImage} />
            </Show>
            <Show when={props.ogUrl}>
                <Meta property="og:url" content={props.ogUrl} />
            </Show>
            <Meta property="og:type" content="website" />

            {/* Twitter Card metadata */}
            <Meta name="twitter:card" content={merged().twitterCard} />
            <Show when={props.twitterTitle}>
                <Meta name="twitter:title" content={props.twitterTitle} />
            </Show>
            <Show when={props.twitterDescription}>
                <Meta name="twitter:description" content={props.twitterDescription} />
            </Show>
            <Show when={props.twitterImage}>
                <Meta name="twitter:image" content={props.twitterImage} />
            </Show>

            {/* JSON-LD structured data */}
            <Show when={props.jsonLd}>
                <script type="application/ld+json" textContent={JSON.stringify(props.jsonLd)} />
            </Show>

            {/* Map-specific metadata */}
            <Meta name="geo.region" content="world" />
            <Meta name="geo.placename" content="World Map" />
            <Meta name="ICBM" content="0, 0" />

            {/* Preload critical resources */}
            <Link rel="preload" href="/fonts/map-font.woff2" as="font" type="font/woff2" crossorigin="anonymous" />

            {props.children}
        </>
    );
}

export default MapMetadata;

/**
 * Predefined metadata configurations for common map types
 */
export const mapMetadataPresets = {
    worldMap: {
        title: "Interactive World Map",
        description: "Explore the world with our interactive map featuring countries, cities, and geographic data.",
        keywords: ["world map", "interactive map", "geography", "countries", "atlas"],
        author: "Solid Simple Maps",
        ogTitle: "Interactive World Map",
        ogDescription: "Explore the world with our interactive map featuring countries, cities, and geographic data.",
        twitterTitle: "Interactive World Map",
        twitterDescription: "Explore the world with our interactive map featuring countries, cities, and geographic data.",
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "Map",
            name: "Interactive World Map",
            description: "An interactive world map showing countries and geographic features",
            mapType: "https://schema.org/VenueMap",
        },
    },

    countryMap: (countryName: string) => ({
        title: `${countryName} Map - Interactive Geographic Data`,
        description: `Explore ${countryName} with detailed geographic information, cities, and regional data.`,
        keywords: [countryName.toLowerCase(), "map", "geography", "interactive", "regions"],
        author: "Solid Simple Maps",
        ogTitle: `${countryName} Interactive Map`,
        ogDescription: `Explore ${countryName} with detailed geographic information, cities, and regional data.`,
        twitterTitle: `${countryName} Interactive Map`,
        twitterDescription: `Explore ${countryName} with detailed geographic information, cities, and regional data.`,
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "Map",
            name: `${countryName} Map`,
            description: `Interactive map of ${countryName} with geographic features`,
            mapType: "https://schema.org/VenueMap",
            about: {
                "@type": "Country",
                name: countryName,
            },
        },
    }),

    cityMap: (cityName: string, countryName?: string) => ({
        title: `${cityName} Map${countryName ? ` - ${countryName}` : ""} - Interactive City Guide`,
        description: `Explore ${cityName} with our interactive map featuring neighborhoods, landmarks, and local information.`,
        keywords: [cityName.toLowerCase(), "city map", "urban planning", "neighborhoods", "interactive"],
        author: "Solid Simple Maps",
        ogTitle: `${cityName} Interactive City Map`,
        ogDescription: `Explore ${cityName} with our interactive map featuring neighborhoods, landmarks, and local information.`,
        twitterTitle: `${cityName} Interactive City Map`,
        twitterDescription: `Explore ${cityName} with our interactive map featuring neighborhoods, landmarks, and local information.`,
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "Map",
            name: `${cityName} City Map`,
            description: `Interactive map of ${cityName} with city features`,
            mapType: "https://schema.org/VenueMap",
            about: {
                "@type": "City",
                name: cityName,
                ...(countryName && {
                    containedInPlace: {
                        "@type": "Country",
                        name: countryName,
                    },
                }),
            },
        },
    }),

    dataVisualization: (dataType: string) => ({
        title: `${dataType} Data Visualization - Interactive Map`,
        description: `Visualize ${dataType} data on an interactive map with real-time updates and detailed analytics.`,
        keywords: [dataType.toLowerCase(), "data visualization", "analytics", "interactive map", "statistics"],
        author: "Solid Simple Maps",
        ogTitle: `${dataType} Data Visualization`,
        ogDescription: `Visualize ${dataType} data on an interactive map with real-time updates and detailed analytics.`,
        twitterTitle: `${dataType} Data Visualization`,
        twitterDescription: `Visualize ${dataType} data on an interactive map with real-time updates and detailed analytics.`,
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "Dataset",
            name: `${dataType} Geographic Dataset`,
            description: `Geographic visualization of ${dataType} data`,
            distribution: {
                "@type": "DataDownload",
                encodingFormat: "application/json",
            },
        },
    }),
};
