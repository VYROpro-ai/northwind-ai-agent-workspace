import type { SVGProps } from 'react';
import { icons, type IconName } from './icons';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  /** Pixel size of the square icon. Defaults to 18. */
  size?: number;
  /** Stroke width on the 24 px grid. Defaults to 1.75 (kit standard). */
  strokeWidth?: number;
  /** Accessible label. When omitted the icon is decorative (aria-hidden). */
  label?: string;
}

/** Stroke icon from the Northwind set. Colour follows `currentColor`, so style it with `text-*`. */
export function Icon({ name, size = 18, strokeWidth = 1.75, label, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      {...props}
    >
      {icons[name]}
    </svg>
  );
}

export type { IconName };
