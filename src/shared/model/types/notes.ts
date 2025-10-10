import type { BaseResponse } from 'shared/model/types/api';

export type CreateNoteRequest = {
  layoutId: string;
  payload: string;
  title: string;
};

export type DeleteNoteRequest = {
  noteId: string;
};

export type GetNotesRequest = {
  layoutId: string;
  page: number;
};

export type UpdateNoteRequest = {
  noteId: string;
  payload?: string;
  title?: string;
};

export type CreateNoteResponse = {
  id: string;
};

export type DeleteNoteResponse = string;

export type Note = {
  id: string;
  layoutId: string;
  title: string;
  payload: string;
  createdAt: string;
  updatedAt: string;
};

export type GetNotesResponse = Note[];

export type UpdateNoteResponse = string;

export type CreateNoteApiResponse = BaseResponse<CreateNoteResponse>;
export type DeleteNoteApiResponse = BaseResponse<DeleteNoteResponse>;
export type GetNotesApiResponse = BaseResponse<GetNotesResponse>;
export type UpdateNoteApiResponse = BaseResponse<UpdateNoteResponse>;
