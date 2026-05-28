import { type LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  /** Color override for the icon background gradient. Default: primary violet */
  iconColor?: 'violet' | 'red' | 'green' | 'amber' | 'blue' | 'cyan';
}

const ICON_GRADIENTS: Record<NonNullable<PageHeaderProps['iconColor']>, string> = {
  violet: 'linear-gradient(135deg, hsl(262,73%,55%), hsl(282,73%,62%))',
  red:    'linear-gradient(135deg, hsl(0,72%,48%), hsl(350,72%,58%))',
  green:  'linear-gradient(135deg, hsl(160,84%,34%), hsl(150,80%,46%))',
  amber:  'linear-gradient(135deg, hsl(38,92%,46%), hsl(28,92%,56%))',
  blue:   'linear-gradient(135deg, hsl(217,91%,54%), hsl(205,91%,64%))',
  cyan:   'linear-gradient(135deg, hsl(188,84%,40%), hsl(200,84%,52%))',
};

const ICON_SHADOWS: Record<NonNullable<PageHeaderProps['iconColor']>, string> = {
  violet: '0 4px 14px -2px hsl(262 73% 55% / 0.45)',
  red:    '0 4px 14px -2px hsl(0 72% 48% / 0.45)',
  green:  '0 4px 14px -2px hsl(160 84% 34% / 0.45)',
  amber:  '0 4px 14px -2px hsl(38 92% 46% / 0.45)',
  blue:   '0 4px 14px -2px hsl(217 91% 54% / 0.45)',
  cyan:   '0 4px 14px -2px hsl(188 84% 40% / 0.45)',
};

export function PageHeader({
  icon: Icon,
  title,
  subtitle,
  badge,
  actions,
  iconColor = 'violet',
}: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 animate-slide-up">
      <div className="flex items-center gap-3.5">
        {/* Icon */}
        <div
          className="relative flex h-11 w-11 items-center justify-center rounded-2xl overflow-hidden shrink-0"
          style={{
            background: ICON_GRADIENTS[iconColor],
            boxShadow: ICON_SHADOWS[iconColor],
          }}
        >
          <Icon className="h-[22px] w-[22px] text-white relative z-10" />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 55%)' }}
          />
        </div>

        {/* Text */}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight leading-none">{title}</h1>
            {badge}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Actions slot */}
      {actions && (
        <div className="flex items-center gap-2 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
}
