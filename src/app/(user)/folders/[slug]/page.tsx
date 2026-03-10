import FolderDetailView from "@/views/user-view/folder-detail-view";

export default async function FolderDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <FolderDetailView slug={slug} />;
}
