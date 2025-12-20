import { apiSlice } from './apiSlice';

interface UploadFileRequest {
  file: File;
}

interface UploadFileResponse {
  data: {
    imgUrl: string;
  };
  meta: {
    code: string;
    message: string;
    error: string;
    requestId: string;
  };
}

export const fileApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    uploadFile: builder.mutation<UploadFileResponse, UploadFileRequest>({
      query: ({ file }) => {
        const form = new FormData();
        form.append('file', file);
        return {
          url: '/file/upload',
          method: 'POST',
          body: form,
        };
      },
    }),
  }),
});

export const { useUploadFileMutation } = fileApi;
