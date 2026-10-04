// @vitest-environment happy-dom

import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";

type SectionBaseProps = {
	children: React.ReactNode;
};

vi.mock("../shared/section-base", () => ({
	SectionBase: ({ children }: SectionBaseProps) => <div>{children}</div>,
}));

const { InformationSectionBuilder } = await import("./information");

beforeAll(() => {
	i18n.loadAndActivate({ locale: "en", messages: {} });
});

const renderInfo = () =>
	render(
		<I18nProvider i18n={i18n}>
			<InformationSectionBuilder />
		</I18nProvider>,
	);

describe("InformationSectionBuilder", () => {
	it("does not show the upstream donation prompt or sponsor links", () => {
		const { container } = renderInfo();
		expect(screen.queryByText("Support the app by doing what you can!")).toBeNull();
		expect(screen.queryByText("Sponsors")).toBeNull();
		const hrefs = Array.from(container.querySelectorAll<HTMLAnchorElement>("a")).map((a) => a.href);
		expect(hrefs.some((h) => h.includes("opencollective.com"))).toBe(false);
	});

	it("includes external resource links (docs, source)", () => {
		renderInfo();
		for (const label of ["Documentation", "Source Code"]) {
			expect(screen.getByText(label).closest("a"), label).not.toBeNull();
		}
	});

	it("opens external links in a new tab", () => {
		renderInfo();
		const docs = screen.getByText("Documentation").closest("a") as HTMLAnchorElement;
		expect(docs.getAttribute("target")).toBe("_blank");
		expect(docs.getAttribute("rel")).toBe("noopener noreferrer");
	});
});
