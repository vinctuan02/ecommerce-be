// prefix dạng YYYYMMDDHHmmss_
export const FILE_NAME_TIMESTAMP_PREFIX_LENGTH = 'YYYYMMDDHHmmss_'.length;

export function generateFileNameWithTimestamp(fileName: string): string {
  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

  return `${timestamp}_${fileName}`;
}
