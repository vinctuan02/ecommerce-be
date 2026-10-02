import { UploadPurpose } from '../enums/bucket.enum';

// tên bảng, dùng làm alias khi query / join
export const FILE_ENTITY = 'files';

export const FolderBucketMap: Record<UploadPurpose, string> = {
  [UploadPurpose.USER_AVATAR]: 'users/avatars',
  [UploadPurpose.PRODUCT_IMAGE]: 'products/images',
};

// thời gian hết hạn của presigned url (giây)
export const UPLOAD_URL_EXPIRES_IN = 60 * 60;
export const READ_URL_EXPIRES_IN = 4 * 60 * 60;
