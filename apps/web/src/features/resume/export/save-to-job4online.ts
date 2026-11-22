import { t } from "@lingui/core/macro";
import { useState } from "react";
import { getResumeExportData } from "@reactive-resume/resume/export-sections";
import { toast } from "@reactive-resume/ui/components/toast";
import { generateFilename } from "@reactive-resume/utils/file";
import type { useResume } from "@/features/resume/builder/draft";
import { client } from "@/libs/orpc/client";
import { createResumePdfBlob } from "./pdf-document";

type BuilderResume = NonNullable<ReturnType<typeof useResume>>;

/**
 * Prints the resume to a PDF in the browser and sends it to the user's Job4online resumes. Job4online keeps only this PDF
 * (never the editable resume), so what is attached to an application cannot change afterwards.
 */
export function useSaveToJob4online(resume: BuilderResume) {
	const [isSaving, setIsSaving] = useState(false);

	const save = async () => {
		const toastId = toast.add({ type: "loading", description: t`Saving to Job4online...` });
		setIsSaving(true);
		try {
			const blob = await createResumePdfBlob(getResumeExportData(resume.data, "resume"));
			const name = resume.name || resume.data.basics.name || resume.slug;
			const file = new File([blob], generateFilename(name, "pdf"), { type: "application/pdf" });
			const { replaced } = await client.job4online.saveResume({ resumeId: resume.id, file });
			toast.add({
				type: "success",
				id: toastId,
				description: replaced
					? t`Updated in your Job4online resumes.`
					: t`Saved to your Job4online resumes. You can attach it when you apply for jobs.`,
			});
		} catch (error) {
			toast.add({
				type: "error",
				id: toastId,
				description:
					error instanceof Error && error.message ? error.message : t`Could not save to Job4online. Please try again.`,
			});
		} finally {
			setIsSaving(false);
		}
	};

	return { save, isSaving };
}
