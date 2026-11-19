import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BrandIcon } from "./brand-icon";

describe("BrandIcon", () => {
	it("renders the Job4online logo", () => {
		render(<BrandIcon />);
		expect(screen.getByAltText("Job4online")).toHaveAttribute("src", "/logo/job4online.png");
	});

	it("uses the same logo for the icon variant", () => {
		render(<BrandIcon variant="icon" />);
		expect(screen.getByAltText("Job4online")).toHaveAttribute("src", "/logo/job4online.png");
	});

	it("merges custom className", () => {
		render(<BrandIcon className="my-custom" />);
		expect(screen.getByAltText("Job4online")).toHaveClass("my-custom");
	});
});
