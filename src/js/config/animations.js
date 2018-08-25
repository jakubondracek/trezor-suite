import { keyframes } from 'styled-components';
import colors from 'config/colors';

export const ROTATE_180_UP = keyframes`
    from { transform: rotate(0deg) }
    to { transform: rotate(180deg) }
`;

export const ROTATE_180_DOWN = keyframes`
    from { transform: rotate(180deg) }
    to { transform: rotate(0deg) }
`;

export const DASH = keyframes`
    0% {
        stroke-dasharray: 1, 200;
        stroke-dashoffset: 0;
    }
    50% {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: -35;
    }
    100% {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: -124;
    }
`;

export const GREEN_COLOR = keyframes`
    100%, 0% {
        stroke: ${colors.GREEN_PRIMARY};
    }
    40% {
        stroke: ${colors.GREEN_PRIMARY};
    }
    66% {
        stroke: ${colors.GREEN_SECONDARY};
    }
    80%, 90% {
        stroke: ${colors.GREEN_TERTIARY};
    }
`;