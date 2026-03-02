import { apiSlice } from './apiSlice';

interface GenerateLinkRequest {
  targetId: string;
  kind: 'LAYOUT' | 'NOTE';
  canRead: boolean;
  canWrite: boolean;
  canEdit: boolean;
  expiredAt: string | null;
}

interface GenerateLinkResponse {
  data: {
    linkId: string;
  };
  meta: Record<string, unknown>;
}

interface ApplyLinkRequest {
  linkId: string;
}

interface ApplyLinkResponse {
  data: {
    targetId: string;
    kind: 'PERMISSIONS_KIND_LAYOUT' | 'PERMISSIONS_KIND_NOTE';
  };
  meta: Record<string, unknown>;
}

const mapKindToPermissionsKind = (
  kind: 'LAYOUT' | 'NOTE'
): 'PERMISSIONS_KIND_LAYOUT' | 'PERMISSIONS_KIND_NOTE' => {
  return kind === 'LAYOUT'
    ? 'PERMISSIONS_KIND_LAYOUT'
    : 'PERMISSIONS_KIND_NOTE';
};

export const shareApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    generateLink: builder.mutation<
      { linkId: string; fullUrl: string },
      GenerateLinkRequest
    >({
      query: payload => ({
        url: '/permissions/links/generate',
        method: 'POST',
        body: {
          targetId: payload.targetId,
          kind: mapKindToPermissionsKind(payload.kind),
          canRead: payload.canRead,
          canWrite: payload.canWrite,
          canEdit: payload.canEdit,
          expiredAt: payload.expiredAt,
        },
      }),
      transformResponse: (response: GenerateLinkResponse) => {
        const baseUrl = window.location.origin;
        return {
          linkId: response.data.linkId,
          fullUrl: `${baseUrl}/apply?linkId=${response.data.linkId}`,
        };
      },
    }),

    applyLink: builder.mutation<ApplyLinkResponse['data'], ApplyLinkRequest>({
      query: payload => ({
        url: '/permissions/links/apply',
        method: 'POST',
        body: { linkId: payload.linkId },
      }),
      transformResponse: (response: ApplyLinkResponse) => response.data,
    }),
  }),
});

export const { useGenerateLinkMutation, useApplyLinkMutation } = shareApi;
