// @vitest-environment happy-dom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";

// The footer module evaluates translated link labels at module scope. That `t` call needs an activated locale BEFORE the import, so do that
// here instead of in beforeAll.
i18n.loadAndActivate({ locale: "en", messages: {} });

const { Footer } = await import("./footer");

const renderFooter = () =>
	render(
		<I18nProvider i18n={i18n}>
			<Footer />
		</I18nProvider>,
	);

describe("Footer", () => {
	it("renders the Resources link group heading", () => {
		renderFooter();
		expect(screen.getByText("Resources")).toBeInTheDocument();
	});

	it("renders the resource links", () => {
		const { container } = renderFooter();
		const text = container.textContent ?? "";
		for (const label of ["Job4online Job Board", "Documentation", "Source Code"]) {
			expect(text, label).toContain(label);
		}
	});

	it("does not link to upstream donation, community or personal profiles", () => {
		const { container } = renderFooter();
		const hrefs = Array.from(container.querySelectorAll<HTMLAnchorElement>("a")).map((a) => a.href);
		for (const blocked of [
			"opencollective.com",
			"linkedin.com/in/amruthpillai",
			"x.com/KingOKings",
			"discord.gg",
			"reddit.com",
		]) {
			expect(
				hrefs.some((h) => h.includes(blocked)),
				blocked,
			).toBe(false);
		}
	});

	it("does not show a licence or attribution block", () => {
		const { container } = renderFooter();
		expect(container.textContent).not.toMatch(/Licensed under|Based on|Amruth/);
	});
});
