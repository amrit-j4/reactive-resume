import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { m } from "motion/react";
import { BrandIcon } from "@reactive-resume/ui/components/brand-icon";
import { Copyright } from "@/components/ui/copyright";
import { EASE_OUT_STRONG } from "@/libs/motion";

type FooterLinkItem = {
	url: string;
	label: string;
};

type FooterLinkGroupProps = {
	title: string;
	links: FooterLinkItem[];
};

const getResourceLinks = (): FooterLinkItem[] => [
	{ url: "https://job4online.com.au", label: t`Job4online Job Board` },
	{ url: "https://docs.rxresu.me", label: t`Documentation` },
	{ url: "https://github.com/amrit-j4/reactive-resume", label: t`Source Code` },
];

export function Footer() {
	return (
		<m.footer
			id="footer"
			className="p-4 pb-8 md:p-8 md:pb-12"
			initial={{ opacity: 0 }}
			whileInView={{ opacity: 1 }}
			viewport={{ once: true }}
			transition={{ duration: 0.45, ease: EASE_OUT_STRONG }}
		>
			<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
				{/* Brand Column */}
				<div className="space-y-4 sm:col-span-2 lg:col-span-1">
					<BrandIcon variant="logo" className="size-10" />

					<div className="space-y-2">
						<h2 className="font-semibold text-lg tracking-tight">Job4online</h2>
						<p className="max-w-xs text-muted-foreground text-sm leading-relaxed">
							<Trans>
								A free and open-source resume builder that makes it easy to create, update, and share your resume.
							</Trans>
						</p>
					</div>
				</div>

				{/* Resources Column */}
				<FooterLinkGroup title={t`Resources`} links={getResourceLinks()} />

				{/* Copyright Column */}
				<div className="space-y-4 sm:col-span-2 lg:col-span-1">
					<Copyright />
				</div>
			</div>
		</m.footer>
	);
}

function FooterLinkGroup({ title, links }: FooterLinkGroupProps) {
	return (
		<div className="space-y-4">
			<h2 className="font-medium text-muted-foreground text-sm tracking-tight">{title}</h2>

			<ul className="space-y-3">
				{links.map((link) => (
					<FooterLink key={link.url} url={link.url} label={link.label} />
				))}
			</ul>
		</div>
	);
}

function FooterLink({ url, label }: FooterLinkItem) {
	return (
		<li className="relative">
			<a
				href={url}
				target="_blank"
				rel="noopener noreferrer"
				className="relative inline-block text-sm transition-colors after:pointer-events-none after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:rounded-md after:bg-primary after:content-[''] hover:text-foreground hover:after:scale-x-100 rtl:after:origin-right after:[transition:scale_200ms_var(--ease-out-strong)]"
			>
				{label}

				<span className="sr-only">
					<Trans>(opens in new tab)</Trans>
				</span>
			</a>
		</li>
	);
}
