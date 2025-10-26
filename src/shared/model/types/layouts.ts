export type CreateLayoutRequest = {
  title: string;
};

export type CreateLayoutResponse = {
  id: string;
};

export type Layout = {
  id: string;
  title: string;
  ownerId: string;
  createdAt?: string;
  updatedAt?: string;
  notes?: Note[];
};

export type Note = {
  id: string;
  title: string;
  payload: string;
  ownerId: string;
  haveAccess: string[];
  position?: {
    xPos: number;
    yPos: number;
  };
  linkedWith: string[];
  layoutId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type GetMyLayoutsResponse = {
  data: Layout[];
  meta: {
    code: string;
    error: string;
    message: string;
    requestId: string;
  };
  pagination: {
    page: number;
    pages: number;
    perPage: number;
  };
};

export type CreateNoteLinkRequest = {
  firstNoteId: string;
  layoutId: string;
  secondNoteId: string;
};

export type CreateNoteLinkResponse = {
  data: string;
  meta: {
    code: string;
    message: string;
    error: string;
    requestId: string;
  };
  pagination: {
    page: number;
    pages: number;
    perPage: number;
  };
};

export type DeleteNoteLinkRequest = {
  firstNoteId: string;
  layoutId: string;
  secondNoteId: string;
};

export type DeleteNoteLinkResponse = {
  data: string;
  meta: {
    code: string;
    message: string;
    error: string;
    requestId: string;
  };
  pagination: {
    page: number;
    pages: number;
    perPage: number;
  };
};
