import { getMedia, isImageMedia } from '@/shared/api/media.api';

export async function resolveMediaUrl(
  mediaId: string | null | undefined,
): Promise<string | undefined> {
  if (!mediaId) return undefined;
  try {
    const media = await getMedia(mediaId);
    if (isImageMedia(media)) return media.url;
  } catch {
    return undefined;
  }
  return undefined;
}

export async function patchMediaFields(
  mediaId: string | null,
  fields: {
    idKey: string;
    urlKey: string;
  },
): Promise<Record<string, unknown>> {
  if (!mediaId) {
    return { [fields.idKey]: null, [fields.urlKey]: undefined };
  }
  const url = await resolveMediaUrl(mediaId);
  return { [fields.idKey]: mediaId, [fields.urlKey]: url };
}
