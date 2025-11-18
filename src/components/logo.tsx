import * as React from 'react';

export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 12v2a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-2" />
      <path d="M16 10V6a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v4" />
      <path d="m12 8 3 3 3-3" />
      <path d="m12 16-3-3-3 3" />
    </svg>
  );
}
