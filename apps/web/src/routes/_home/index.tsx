import { ORPCError } from "@orpc/client";
import { ClientOnly, createFileRoute, lazyRouteComponent, Navigate, redirect } from "@tanstack/react-router";
import { getResumeSocialMeta } from "@reactive-resume/resume/social-meta";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { NotFoundScreen } from "@/components/layout/not-found-screen";
import { orpc } from "@/libs/orpc/client";
import {
	createNoindexFollowMeta,
	createResumeSocialMeta,
	createRootStructuredDataScript,
	getCanonicalRootUrl,
} from "@/libs/seo";

const PublicResumePage = lazyRouteComponent(() => import("@/features/resume/public/public-resume"), "PublicResumePage");

export const Route = createFileRoute("/_home/")({
	component: RouteComponent,
	loader: async ({ context }) => ({
		root: await context.queryClient.fetchQuery(orpc.resume.getRoot.queryOptions({ staleTime: 0 })),
	}),
	onError: (error) => {
		if (error instanceof ORPCError && error.code === "NEED_PASSWORD") {
			const { username, slug } = error.data as { username: string; slug: string };
			throw redirect({ to: "/auth/resume-password", search: { redirect: `/${username}/${slug}`, returnTo: "/" } });
		}
	},
	head: ({ loaderData }) => {
		const root = loaderData?.root;
		if (root && root.status !== "disabled") {
			const { canonicalUrl } = root;
			if (root.status === "unavailable") {
				return {
					meta: [{ title: "Job4online" }, createNoindexFollowMeta()],
					links: [{ rel: "canonical", href: canonicalUrl }],
				};
			}
			const social = getResumeSocialMeta(root.resume.data, root.resume.name || "Resume");
			return {
				meta: [
					{ title: `${social.name} - Job4online` },
					createNoindexFollowMeta(),
					...createResumeSocialMeta({
						canonicalUrl,
						title: social.title,
						description: social.description,
						imageUrl: `${canonicalUrl}opengraph/banner.jpg`,
					}),
				],
				links: [{ rel: "canonical", href: canonicalUrl }],
			};
		}
		const appUrl = typeof window !== "undefined" ? window.location.origin : "https://resume.job4online.com.au";
		const canonicalUrl = getCanonicalRootUrl(appUrl);

		return {
			links: [{ rel: "canonical", href: canonicalUrl }],
			scripts: [createRootStructuredDataScript(canonicalUrl)],
		};
	},
});

function RouteComponent() {
	const { flags } = Route.useRouteContext();
	const { root } = Route.useLoaderData();
	if (root.status === "unavailable")
		return (
			<main id="main-content">
				<NotFoundScreen />
			</main>
		);
	if (root.status === "public") {
		return (
			<ClientOnly fallback={<LoadingScreen />}>
				<PublicResumePage resume={root.resume} username={root.username} slug={root.slug} flags={flags} isRoot />
			</ClientOnly>
		);
	}

	// No marketing homepage: send visitors straight into the app (the dashboard handles sign-in).
	return <Navigate to="/dashboard" replace />;
}
