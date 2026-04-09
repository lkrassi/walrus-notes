import { useGetLinkedNotesQuery } from '@/entities';
import type { Note } from '@/entities/note';

interface UseLinkedNotesDataParams {
  noteId?: string;
}

type LinkedNotesData = {
  linkedNotesIn: Note[];
  linkedNotesOut: Note[];
};

const EMPTY_LINKED_NOTES: LinkedNotesData = {
  linkedNotesIn: [],
  linkedNotesOut: [],
};

export const useLinkedNotesData = ({ noteId }: UseLinkedNotesDataParams) => {
  const { data, isLoading, error } = useGetLinkedNotesQuery(
    { noteId: noteId ?? '' },
    {
      skip: !noteId,
      selectFromResult: ({ data, isLoading, error }) => ({
        data: data
          ? {
              linkedNotesIn: data.linkedNotesIn ?? [],
              linkedNotesOut: data.linkedNotesOut ?? [],
            }
          : EMPTY_LINKED_NOTES,
        isLoading,
        error,
      }),
    }
  );

  return {
    data,
    isLoading,
    error,
  } as const;
};
