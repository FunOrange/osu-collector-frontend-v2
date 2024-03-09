import { cn } from "@/utils/shadcn-utils";

export interface TabSwitcherProps {
  items: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}
export default function TabSwitcher({ items, value, onChange }: TabSwitcherProps) {
  return (
    <div className="flex flex-row items-center">
      {items.map((item) => {
        const isActive = item.value === value;
        return (
          <>
            <button
              key={item.value}
              onClick={() => onChange(item.value)}
              className={cn(
                "px-4 pt-4 pb-3 text-sm transition-all",
                isActive
                  ? "border-slate-50 border-b-4 text-slate-50 font-medium"
                  : "border-slate-600 border-b text-slate-300"
              )}
            >
              {item.label}
            </button>
            <button
              className="pt-4 pb-3 text-sm font-medium border-b-4"
              style={{ width: 0, opacity: 0 }}
            >
              a {/* hack to make the height consistent during border width changes */}
            </button>
          </>
        );
      })}
    </div>
  );
}
