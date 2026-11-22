import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { CloudArrowUpIcon, DownloadSimpleIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { getResumeExportData } from "@reactive-resume/resume/export-sections";
import { Button } from "@reactive-resume/ui/components/button";
import { toast } from "@reactive-resume/ui/components/toast";
import { generateFilename } from "@reactive-resume/utils/file";
import { useResume } from "@/features/resume/builder/draft";
import { ResumeDownloadDialog } from "@/features/resume/export/download-dialog";
import { createResumePdfBlob } from "@/features/resume/export/pdf-document";
import { client } from "@/libs/orpc/client";
import { SectionBase } from "../shared/section-base";

export function ExportSectionBuilder() {
	const resume = useResume();
	const [isSaving, setIsSaving] = useState(false);

	if (!resume) return null;

	// Job4online keeps only this printed PDF (never the editable resume), so what is attached to an application cannot change afterwards.
	const onSaveToJob4online = async () => {
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
					? t`Updated in your Job4online resumes. Applications you already sent keep the earlier version.`
					: t`Saved to your Job4online resumes. You can attach it when you apply for jobs.`,
			});
		} catch (error) {
			toast.add({
				type: "error",
				id: toastId,
				description: error instanceof Error && error.message ? error.message : t`Could not save to Job4online. Please try again.`,
			});
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<SectionBase type="export" className="space-y-4">
			<Button
				variant="outline"
				disabled={isSaving}
				onClick={onSaveToJob4online}
				className="h-auto w-full gap-x-4 whitespace-normal p-4! text-start font-normal active:scale-98"
			>
				<CloudArrowUpIcon className="size-6 shrink-0" />
				<div className="flex flex-1 flex-col gap-y-1">
					<h6 className="font-medium">
						<Trans comment="Button title in the builder's export section: sends the finished PDF to the user's Job4online resumes">
							Save to Job4online
						</Trans>
					</h6>
					<p className="text-muted-foreground text-xs leading-normal">
						<Trans comment="Description of the Save to Job4online button">
							Saves a PDF copy to your Job4online resumes so you can use it when you apply for jobs. Save again after you edit.
						</Trans>
					</p>
				</div>
			</Button>

			<ResumeDownloadDialog
				resume={resume}
				trigger={(disabled) => (
					<Button
						variant="outline"
						disabled={disabled}
						className="h-auto w-full gap-x-4 whitespace-normal p-4! text-start font-normal active:scale-98"
					>
						<DownloadSimpleIcon className="size-6 shrink-0" />
						<div className="flex flex-1 flex-col gap-y-1">
							<h6 className="font-medium">
								<Trans>Download</Trans>
							</h6>
							<p className="text-muted-foreground text-xs leading-normal">
								<Trans>
									Choose PDF, DOCX, Markdown, or JSON. Export your resume and cover letter separately when available.
								</Trans>
							</p>
						</div>
					</Button>
				)}
			/>
		</SectionBase>
	);
}
