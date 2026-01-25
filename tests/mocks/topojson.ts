export const mockTopoJSON = {
    type: 'Topology',
    objects: {
        default: {
            type: 'GeometryCollection',
            geometries: [
                {
                    type: 'Polygon',
                    id: '100',
                    properties: { name: 'Test Country' },
                    arcs: [[0]],
                },
            ],
        },
    },
    arcs: [
        [
            [0, 0],
            [0, 10],
            [10, 10],
            [10, 0],
            [0, 0],
        ],
    ],
};
