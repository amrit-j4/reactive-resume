import { ORPCError } from "@orpc/server";
import z from "zod";
import { env } from "@reactive-resume/env/server";
import { protectedProcedure } from "../../context";
import { resumeService } from "../resume/service";

const MAX_PDF_BYTES = 10 * 1024 * 1024;

export const job4onlineRouter = {
	saveResume: protectedProcedure
		.route({
			tags: ["Internal"],
			operationId: "saveResumeToJob4online",
			summary: "Save a resume's PDF to Job4online",
			description:
				"Sends the printed PDF of one of your resumes to Job4online, where it is listed with your resumes and can be attached to job applications. Only the PDF is sent: the editable resume stays here. Saving the same resume again replaces its PDF. Requires authentication.",
			successDescription: "The PDF was saved to Job4online.",
		})
		.input(
			z.object({
				resumeId: z.string().min(1).describe("The resume the PDF was printed from."),
				file: z.file().mime("application/pdf").max(MAX_PDF_BYTES, "The PDF must be less than 10MB"),
			}),
		)
		.output(z.object({ replaced: z.boolean().describe("True if this resume was already saved and its PDF was replaced.") }))
		.handler(async ({ context, input }) => {
			if (!env.JOB4ONLINE_API_URL || !env.JOB4ONLINE_RESUME_API_KEY) {
				throw new ORPCError("SERVICE_UNAVAILABLE", { message: "Saving to Job4online is not set up on this server." });
			}

			// Only the owner's own resume can be saved, and the name shown in Job4online comes from here, not from the browser.
			const resume = await resumeService.getById({ id: input.resumeId, userId: context.user.id });

			const form = new FormData();
			form.set("email", context.user.email);
			form.set("builderResumeId", resume.id);
			form.set("name", resume.name || resume.data.basics.name || resume.slug);
			form.set("file", input.file, "resume.pdf");

			let response: Response;
			try {
				response = await fetch(`${env.JOB4ONLINE_API_URL.replace(/\/+$/, "")}/integrations/resume-builder/resumes`, {
					method: "POST",
					headers: { "X-Api-Key": env.JOB4ONLINE_RESUME_API_KEY },
					body: form,
					signal: AbortSignal.timeout(60_000),
				});
			} catch {
				throw new ORPCError("BAD_GATEWAY", { message: "Could not reach Job4online. Please try again." });
			}

			if (!response.ok) {
				// Job4online answers with a problem-details JSON whose "detail" is written for people (for example an unverified email).
				const problem = (await response.json().catch(() => null)) as { detail?: string; title?: string } | null;
				throw new ORPCError("BAD_GATEWAY", {
					message: problem?.detail || problem?.title || "Job4online could not save this resume.",
				});
			}

			const saved = (await response.json()) as { replaced?: boolean };
			return { replaced: Boolean(saved.replaced) };
		}),
};
