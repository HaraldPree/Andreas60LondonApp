/**
 * Mobile-friendly blob download / share.
 *
 * The classic `<a href={blobUrl} download={filename}>` pattern works
 * great on desktop but on mobile (especially Firefox Android, also
 * Chrome Android in some versions) the `download` attribute is
 * ignored and the browser opens the blob URL in a new tab. Combined
 * with our previous 1-second revoke, the tab ended up showing
 * `about:blank` because the URL had already been revoked.
 *
 * Strategy:
 *   1. If the device supports Web Share API for files → use it.
 *      This opens the native iOS/Android share sheet, letting the
 *      user save the file to Dateien / Google Drive / send via
 *      WhatsApp / AirDrop / etc. Best mobile UX by far.
 *   2. Else fall back to the classic anchor-download. Wait 60s
 *      before revoking the URL so slow mobile downloads don't lose
 *      access to the bytes mid-stream.
 *   3. If even that fails (rare), let the caller handle it — we
 *      return a `success` flag.
 */

export interface DownloadResult {
  success: boolean;
  method: "share-api" | "anchor-download" | "share-cancelled" | "failed";
  error?: string;
}

export async function downloadOrShareBlob(
  blob: Blob,
  filename: string,
): Promise<DownloadResult> {
  // Try Web Share API (only if it can actually share files)
  if (canShareFiles(blob, filename)) {
    try {
      const file = new File([blob], filename, { type: blob.type });
      await navigator.share({
        files: [file],
        title: filename,
        text: filename,
      });
      return { success: true, method: "share-api" };
    } catch (e) {
      // User cancelled the share sheet — that's fine, don't fall
      // back to download since they explicitly closed it.
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.toLowerCase().includes("abort") || msg.toLowerCase().includes("cancel")) {
        return { success: false, method: "share-cancelled" };
      }
      // Real error → fall through to anchor download
      console.warn("[downloadBlob] share API failed, falling back:", msg);
    }
  }

  // Classic anchor download
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Keep the URL alive for a full minute — mobile downloads can
    // take 10-30s to start, and Firefox Android sometimes opens
    // the URL in a new tab that needs the blob to stay reachable.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return { success: true, method: "anchor-download" };
  } catch (e) {
    return {
      success: false,
      method: "failed",
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

/**
 * Feature-detect file-share support. canShare() must be checked with
 * the actual file because some platforms allow text/url share but
 * not file share.
 */
function canShareFiles(blob: Blob, filename: string): boolean {
  if (typeof navigator === "undefined") return false;
  if (typeof navigator.share !== "function") return false;
  if (typeof navigator.canShare !== "function") return false;
  if (typeof File === "undefined") return false;
  try {
    const file = new File([blob.slice(0, 16)], filename, { type: blob.type });
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}
