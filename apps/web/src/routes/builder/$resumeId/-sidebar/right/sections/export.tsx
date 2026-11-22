import { Trans } from "@lingui/react/macro";
import { CloudArrowUpIcon, DownloadSimpleIcon } from "@phosphor-icons/react";
import { Button } from "@reactive-resume/ui/components/button";
import { useResume } from "@/features/resume/builder/draft";
import { ResumeDownloadDialog } from "@/features/resume/export/download-dialog";
import { useSaveToJob4online } from "@/features/resume/export/save-to-job4online";
import { SectionBase } from "../shared/section-base";

export function ExportSectionBuilder() {
	const resume = useResume();

	if (!resume) return null;

	return <ExportSectionContent resume={resume} />;
}

function ExportSectionContent({ resume }: { resume: NonNullable<ReturnType<typeof useResume>> }) {
	const { save: onSaveToJob4online, isSaving } = useSaveToJob4online(resume);

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
