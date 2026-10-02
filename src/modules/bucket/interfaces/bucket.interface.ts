export interface IResCreateBucket {
  fileId: string;
  urlUpload: string;
  key: string | null;
}

export interface ICreateFile {
  fileName: string;
  contentType: string;
  extension: string;
  fileSize: number;
  key: string;
  bucket: string;
}
