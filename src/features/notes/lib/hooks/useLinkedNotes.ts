interface UseLinkedNotesProps {
  noteId?: string;
}

import { useGetLinkedNotesQuery } from '@/entities';

export const useLinkedNotes = ({ noteId }: UseLinkedNotesProps) => {
  const { data, isLoading } = useGetLinkedNotesQuery(
    { noteId: noteId ?? '' },
    { skip: !noteId }
  );

  return {
    linkedNotesIn: data?.linkedNotesIn ?? [],
    linkedNotesOut: data?.linkedNotesOut ?? [],
    isLoading,
  };
};
