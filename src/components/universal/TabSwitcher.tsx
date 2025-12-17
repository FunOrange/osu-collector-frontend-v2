import { cn } from '@/utils/shadcn-utils';
import React from 'react';

export interface TabSwitcherProps {
  items: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}
export default function TabSwitcher({ items, value, onChange }: TabSwitcherProps) {
  return (
    <div className='flex flex-row flex-wrap items-center'>
      {items.map((item, i) => {
        const isActive = item.value === value;
        return (
          <React.Fragment key={i}>
            <button
              key={item.value}
              onClick={() => onChange(item.value)}
              className={cn(
                'px-4 pb-3 pt-4 text-sm transition-all',
                isActive
                  ? 'border-b-4 border-slate-50 font-medium text-slate-50'
                  : 'border-b border-slate-600 text-slate-300',
              )}
            >
              {item.label}
            </button>
            <button className='border-b-4 pb-3 pt-4 text-sm font-medium' style={{ width: 0, opacity: 0 }}>
              a {/* hack to make the height consistent during border width changes */}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}
