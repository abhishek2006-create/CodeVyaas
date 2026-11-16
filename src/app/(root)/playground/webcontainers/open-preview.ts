export function openWebContainerPreview(url: string) {
  window.open(`/webcontainer/preview#${encodeURIComponent(url)}`, "_blank", "noopener");
}
