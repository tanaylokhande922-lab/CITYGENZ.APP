import type { SVGProps } from "react";

export function PotholeIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M4 15.5C4 17.43 5.57 19 7.5 19s3.5-1.57 3.5-3.5c0-1.12-.5-2.16-1.3-2.83" />
            <path d="m14 14-1.2-1.2" />
            <path d="M16 12h-2" />
            <path d="M18 14l-1.2 1.2" />
            <path d="M20 15.5c0 1.93-1.57 3.5-3.5 3.5s-3.5-1.57-3.5-3.5c0-1.12.5-2.16 1.3-2.83" />
            <path d="M8.8 13.2 5 17" />
            <path d="m13 17 3.8-3.8" />
            <path d="M12.5 7.5c0-1.93-1.57-3.5-3.5-3.5S5.5 5.57 5.5 7.5c0 1.12.5 2.16 1.3 2.83" />
            <path d="M10.8 11.2 7 15" />
        </svg>
    )
}
