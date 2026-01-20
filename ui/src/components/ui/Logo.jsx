import React from "react";

const Logo = ({ strokeWidth = 4, size = 100, strokeColor = "black" }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 360 520" fill="none">
            <path
                d="M 240 10 C 257 36, 324 132, 340 152"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
            />

            <path
                d="M 238 12 C 210 27, 102 83, 74 100"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
            />

            <path
                d="M 76 96 C 82 113, 101 178, 107 196"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
            />

            <path
                d="M 235 16 C 234 31, 232 73, 231 102"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
            />

            <path
                d="M 234 98 C 210 115, 146 167, 107 197"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
            />

            <path
                d="M 232 98 C 250 107, 315 145, 342 155"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
            />

            <path
                d="M 75 96 C 65 121, 23 212, 13 240"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
            />

            <path
                d="M 12 240 C 30 276, 90 415, 108 453"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
            />

            <path
                d="M 108 190 C 109 235, 111 410, 115 456"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
            />

            <path
                d="M 106 197 C 131 248, 206 445, 258 500"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
            />

            <path
                d="M 258 503 C 234 496, 158 478, 110 454"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
            />

            <path
                d="M 342 153 C 333 206, 319 358, 292 456"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
            />

            <path
                d="M 289 455 C 283 464, 265 486, 254 499"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
            />
        </svg>
    );
};

export default Logo;
