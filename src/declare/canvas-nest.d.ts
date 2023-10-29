declare module 'canvas-nest.js' {
    interface CanvasNestConfig {
        /** color of lines, default: '0,0,0'; RGB values: (R,G,B).(note: use ',' to separate.) */
        color?: string;
        /** color of points, default: '0,0,0'; RGB values: (R,G,B).(note: use ',' to separate.) */
        pointColor?: string;
        /** the opacity of line (0~1), default: 0.5. */
        opacity?: number;
        /** the number of lines, default: 99. */
        count?: number;
        /**  z-index property of the background, default: -1. */
        zIndex?: number;
    }

    export default class CanvasNest {
        static version: string;

        constructor(element: HTMLElement, config?: CanvasNestConfig): CanvasNest;

        bindEvent(): void;

        randomPoints(): {
            x: number;
            y: number;
            xa: number;
            ya: number;
            max: number;
        }[];

        newCanvas(): HTMLCanvasElement;

        requestFrame(func: (_this: CanvasNest) => void): void;

        drawCanvas(): void;

        destroy(): void;
    }
}
