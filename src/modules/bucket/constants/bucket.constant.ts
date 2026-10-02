import { UploadPurpose } from '../enums/bucket.enum';

export const FolderBucketMap: Record<UploadPurpose, string> = {
  [UploadPurpose.USER_AVATAR]: 'users/avatars',
  [UploadPurpose.PRODUCT_IMAGE]: 'products/images',
};

// thời gian hết hạn của presigned url (giây)
export const UPLOAD_URL_EXPIRES_IN = 60 * 60;
export const READ_URL_EXPIRES_IN = 4 * 60 * 60;
