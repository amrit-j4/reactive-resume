import { cn } from "@reactive-resume/utils/style";

type Props = React.ComponentProps<"img"> & {
	/** Kept for existing call sites; both variants use the same Job4online logo. */
	variant?: "logo" | "icon";
};

/** The Job4online logo (transparent PNG, same file as the Job4online nav bar), shown unchanged in light and dark mode. Size it by height, e.g. `h-10 w-auto`. */
export function BrandIcon({ variant: _variant, className, ...props }: Props) {
	return <img src="/logo/job4online.png" alt="Job4online" className={cn("h-12 w-auto object-contain", className)} {...props} />;
}
