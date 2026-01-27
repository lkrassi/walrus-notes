import { useLocalization } from 'widgets/hooks';

export const useExportNote = () => {
  const { t } = useLocalization();

  const exportNote = (
    title: string | undefined,
    content: string | undefined
  ) => {
    const safeTitle = (title || t('notes:untitled') || 'note')
      .trim()
      .replace(/[\\/:*?"<>|]/g, '_');
    const filename = `${safeTitle}.md`;
    const blob = new Blob([content ?? ''], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return { exportNote };
};
