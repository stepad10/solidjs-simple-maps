import { JSX } from "solid-js";
import { GeoPath, GeoProjection } from "d3-geo";
import { Feature, FeatureCollection, Geometry } from "geojson";
import { Topology } from "topojson-specification";

// Modern React patterns types -> Solid Function Components don't strictly need this, but we keep fallback type
export type ErrorBoundaryFallback = (error: Error, retry: () => void) => JSX.Element;

// Branded types for better type safety
export type Longitude = number & { __brand: "longitude" };
export type Latitude = number & { __brand: "latitude" };
export type Coordinates = [Longitude, Latitude];

// Additional branded types for specific coordinate patterns
export type ScaleExtent = [number, number] & { __brand: "scaleExtent" };
export type TranslateExtent = [Coordinates, Coordinates] & {
    __brand: "translateExtent";
};
export type RotationAngles = [number, number, number] & {
    __brand: "rotationAngles";
};
export type Parallels = [number, number] & { __brand: "parallels" };
export type GraticuleStep = [number, number] & { __brand: "graticuleStep" };

// Helpers
export const createLongitude = (value: number): Longitude => value as Longitude;
export const createLatitude = (value: number): Latitude => value as Latitude;
export const createCoordinates = (lon: number, lat: number): Coordinates => [createLongitude(lon), createLatitude(lat)];
export const createScaleExtent = (min: number, max: number): ScaleExtent => [min, max] as ScaleExtent;
export const createTranslateExtent = (topLeft: Coordinates, bottomRight: Coordinates): TranslateExtent => [topLeft, bottomRight] as TranslateExtent;
export const createRotationAngles = (x: number, y: number, z: number): RotationAngles => [x, y, z] as RotationAngles;
export const createParallels = (p1: number, p2: number): Parallels => [p1, p2] as Parallels;
export const createGraticuleStep = (x: number, y: number): GraticuleStep => [x, y] as GraticuleStep;

export const createZoomConfig = (minZoom: number, maxZoom: number) => ({
    minZoom,
    maxZoom,
    scaleExtent: createScaleExtent(minZoom, maxZoom),
    enableZoom: true,
});

export const createPanConfig = (bounds: [Coordinates, Coordinates]) => ({
    translateExtent: createTranslateExtent(bounds[0], bounds[1]),
    enablePan: true,
});

export const createZoomPanConfig = (minZoom: number, maxZoom: number, bounds: [Coordinates, Coordinates]) => ({
    ...createZoomConfig(minZoom, maxZoom),
    ...createPanConfig(bounds),
});

export type ConditionalProps<T, K extends keyof T> = T[K] extends undefined ? Partial<T> : Required<T>;

export type StyleVariant = "default" | "hover" | "pressed" | "focused";
export type ConditionalStyle<T = JSX.CSSProperties> = {
    [K in StyleVariant]?: T;
};

export type GeographyPropsWithErrorHandling<T extends boolean> = T extends true
    ? {
          errorBoundary: true;
          onGeographyError: (error: Error) => void;
          fallback: ErrorBoundaryFallback;
      }
    : {
          errorBoundary?: false;
          onGeographyError?: (error: Error) => void;
          fallback?: never;
      };

export type ZoomBehaviorProps<T extends boolean> = T extends true
    ? {
          enableZoom: true;
          minZoom: number;
          maxZoom: number;
          scaleExtent: ScaleExtent;
      }
    : {
          enableZoom?: false;
          minZoom?: never;
          maxZoom?: never;
          scaleExtent?: never;
      };

export type PanBehaviorProps<T extends boolean> = T extends true
    ? {
          enablePan: true;
          translateExtent: TranslateExtent;
      }
    : {
          enablePan?: false;
          translateExtent?: never;
      };

export type ProjectionConfigConditional<T extends string> = T extends "geoAlbers"
    ? ProjectionConfig & Required<Pick<ProjectionConfig, "parallels">>
    : T extends "geoConicEqualArea" | "geoConicConformal"
      ? ProjectionConfig & Required<Pick<ProjectionConfig, "parallels">>
      : ProjectionConfig;

export type ExtractStyleVariant<T> = T extends ConditionalStyle<infer U> ? U : never;

export type RequiredKeys<T> = {
    [K in keyof T]-?: object extends Pick<T, K> ? never : K;
}[keyof T];

export type OptionalKeys<T> = {
    [K in keyof T]-?: object extends Pick<T, K> ? K : never;
}[keyof T];

export type TypeGuard<T> = (value: unknown) => value is T;

export type GeographyError = Error & {
    type:
        | "GEOGRAPHY_LOAD_ERROR"
        | "GEOGRAPHY_PARSE_ERROR"
        | "PROJECTION_ERROR"
        | "VALIDATION_ERROR"
        | "SECURITY_ERROR"
        | "CONFIGURATION_ERROR"
        | "CONTEXT_ERROR";
    geography?: string;
    details?: Record<string, unknown>;
    timestamp?: string;
};

export type ProjectionName = `geo${Capitalize<string>}`;

export interface ProjectionConfig {
    center?: Coordinates;
    rotate?: RotationAngles;
    scale?: number;
    parallels?: Parallels;
}

export interface MapContextType {
    width: () => number; // Accessor in Solid
    height: () => number; // Accessor
    projection: () => GeoProjection; // Accessor
    path: () => GeoPath; // Accessor
}

export interface ZoomPanContextType {
    x: number;
    y: number;
    k: number;
    transformString: string;
}

export interface ComposableMapProps<P extends string = string, M extends boolean = false> extends JSX.SvgSVGAttributes<SVGSVGElement> {
    width?: number;
    height?: number;
    projection?: ProjectionName | P | GeoProjection;
    projectionConfig?: ProjectionConfigConditional<P>;
    className?: string; // Solid uses class, but often className shim is supported. Sticking to className for props compatibility, mapped to class
    class?: string;
    children?: JSX.Element;

    onGeographyError?: (error: Error) => void;
    fallback?: JSX.Element;

    debug?: boolean;

    metadata?: M extends true
        ? Required<{
              title: string;
              description: string;
              keywords: string[];
              author?: string;
              canonicalUrl?: string;
          }>
        : {
              title?: string;
              description?: string;
              keywords?: string[];
              author?: string;
              canonicalUrl?: string;
          };
}

export type GeographiesProps<E extends boolean = false> = Omit<JSX.SvgSVGAttributes<SVGGElement>, "children" | "onError"> &
    GeographyPropsWithErrorHandling<E> & {
        geography: string | Topology | FeatureCollection;
        children: (props: { geographies: Feature<Geometry>[]; outline: string; borders: string; path: GeoPath; projection: GeoProjection }) => JSX.Element;
        parseGeographies?: (geographies: Feature<Geometry>[]) => Feature<Geometry>[];
        className?: string;
        class?: string;
    };

export interface GeographyEventData {
    geography: Feature<Geometry>;
    centroid: Coordinates | null;
    bounds: [Coordinates, Coordinates] | null;
    coordinates: Coordinates | null;
}

export interface GeographyProps extends Omit<
    JSX.SvgSVGAttributes<SVGPathElement>,
    "style" | "onClick" | "onMouseEnter" | "onMouseLeave" | "onMouseDown" | "onMouseUp" | "onFocus" | "onBlur"
> {
    geography: Feature<Geometry>;
    onClick?: (event: MouseEvent & { currentTarget: SVGPathElement; target: Element }, data?: GeographyEventData) => void;
    onMouseEnter?: (event: MouseEvent & { currentTarget: SVGPathElement; target: Element }, data?: GeographyEventData) => void;
    onMouseLeave?: (event: MouseEvent & { currentTarget: SVGPathElement; target: Element }, data?: GeographyEventData) => void;
    onMouseDown?: (event: MouseEvent & { currentTarget: SVGPathElement; target: Element }, data?: GeographyEventData) => void;
    onMouseUp?: (event: MouseEvent & { currentTarget: SVGPathElement; target: Element }, data?: GeographyEventData) => void;
    onFocus?: (event: FocusEvent & { currentTarget: SVGPathElement; target: Element }, data?: GeographyEventData) => void;
    onBlur?: (event: FocusEvent & { currentTarget: SVGPathElement; target: Element }, data?: GeographyEventData) => void;
    styleOptions?: ConditionalStyle<JSX.CSSProperties>;
    className?: string;
    class?: string;
}

export type ZoomableGroupProps<Z extends boolean = true, P extends boolean = true> = JSX.SvgSVGAttributes<SVGGElement> &
    ZoomBehaviorProps<Z> &
    PanBehaviorProps<P> & {
        center?: Coordinates;
        zoom?: number;
        filterZoomEvent?: (event: Event) => boolean;
        onMoveStart?: (position: Position, event: Event) => void;
        onMove?: (position: Position, event: Event) => void;
        onMoveEnd?: (position: Position, event: Event) => void;
        className?: string;
        class?: string;
        children?: JSX.Element;
    };

export interface SimpleZoomableGroupProps extends JSX.SvgSVGAttributes<SVGGElement> {
    center?: Coordinates;
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    translateExtent?: TranslateExtent;
    scaleExtent?: ScaleExtent;
    enableZoom?: boolean;
    enablePan?: boolean;
    filterZoomEvent?: (event: Event) => boolean;
    onMoveStart?: (position: Position, event: Event) => void;
    onMove?: (position: Position, event: Event) => void;
    onMoveEnd?: (position: Position, event: Event) => void;
    className?: string;
    class?: string;
    children?: JSX.Element;
}

export type ZoomableGroupPropsUnion =
    | ZoomableGroupProps<true, true>
    | ZoomableGroupProps<true, false>
    | ZoomableGroupProps<false, true>
    | ZoomableGroupProps<false, false>
    | SimpleZoomableGroupProps;

export interface MarkerProps extends Omit<JSX.SvgSVGAttributes<SVGGElement>, "style"> {
    coordinates: Coordinates;
    style?: ConditionalStyle<JSX.CSSProperties>;
    className?: string;
    class?: string;
    children?: JSX.Element;
}

export interface LineProps extends Omit<JSX.SvgSVGAttributes<SVGPathElement>, "from" | "to"> {
    from: Coordinates;
    to: Coordinates;
    coordinates?: Coordinates[];
    className?: string;
    class?: string;
}

export interface AnnotationProps extends JSX.SvgSVGAttributes<SVGGElement> {
    subject: Coordinates;
    dx?: number;
    dy?: number;
    curve?: number;
    connectorProps?: JSX.SvgSVGAttributes<SVGPathElement>;
    className?: string;
    class?: string;
    children?: JSX.Element;
}

export interface GraticuleProps extends JSX.SvgSVGAttributes<SVGPathElement> {
    step?: GraticuleStep;
    className?: string;
    class?: string;
}

export interface SphereProps extends JSX.SvgSVGAttributes<SVGPathElement> {
    id?: string;
    className?: string;
    class?: string;
}

export interface UseGeographiesProps {
    geography: string | Topology | FeatureCollection;
    parseGeographies?: (geographies: Feature<Geometry>[]) => Feature<Geometry>[];
}

export interface UseZoomPanProps {
    center: Coordinates;
    zoom: number;
    scaleExtent: ScaleExtent;
    translateExtent?: TranslateExtent;
    filterZoomEvent?: (event: Event) => boolean;
    onMoveStart?: (position: Position, event: Event) => void;
    onMove?: (position: Position, event: Event) => void;
    onMoveEnd?: (position: Position, event: Event) => void;
}

export interface PreparedFeature extends Feature<Geometry> {
    svgPath: string;
    rsmKey: string;
}

export interface GeographyData {
    geographies: PreparedFeature[];
    outline: string;
    borders: string;
    center?: Coordinates;
}

export interface ZoomPanState {
    x: number;
    y: number;
    k: number;
}

export interface Position {
    coordinates: Coordinates;
    zoom: number;
}

export interface GeographyServerProps {
    geography: string;
    children: (data: GeographyData) => JSX.Element;
    cache?: boolean;
}

export interface SRIConfig {
    algorithm: "sha256" | "sha384" | "sha512";
    hash: string;
}

export interface GeographySecurityConfig {
    sri?: SRIConfig;
    TIMEOUT_MS?: number;
    MAX_RESPONSE_SIZE?: number;
    ALLOWED_CONTENT_TYPES?: string[];
    ALLOWED_PROTOCOLS?: string[];
    ALLOW_HTTP_LOCALHOST?: boolean;
    STRICT_HTTPS_ONLY?: boolean;
    enforceIntegrity?: boolean;
}
