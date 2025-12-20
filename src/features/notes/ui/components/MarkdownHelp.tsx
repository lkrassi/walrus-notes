import React from 'react';
import cn from 'shared/lib/cn';
import { useLocalization } from 'widgets/hooks';

export const MarkdownHelp: React.FC = () => {
  const { t } = useLocalization();

  return (
    <div className={cn('p-6', 'max-w-4xl')}>
      <div className={cn('space-y-8')}>
        <section>
          <h3 className={cn('text-lg', 'font-semibold', 'mb-3')}>
            {t('notes:paragraphsAndBreaks')}
          </h3>
          <p className={cn('mb-2')}>{t('notes:paragraphsDescription')}</p>
          <div
            className={cn(
              'bg-gray-50',
              'dark:bg-gray-800',
              'p-4',
              'rounded',
              'text-sm'
            )}
          >
            <pre>{t('notes:paragraphsExample')}</pre>
          </div>
          <p
            className={cn(
              'mt-2',
              'text-sm',
              'text-gray-600',
              'dark:text-gray-400'
            )}
          >
            {t('notes:lineBreaksDescription')}
          </p>
        </section>

        <section>
          <h3 className={cn('text-lg', 'font-semibold', 'mb-3')}>
            {t('notes:headings')}
          </h3>
          <div
            className={cn(
              'bg-gray-50',
              'dark:bg-gray-800',
              'p-4',
              'rounded',
              'text-sm'
            )}
          >
            <pre>{t('notes:headingsExample')}</pre>
          </div>
        </section>

        <section>
          <h3 className={cn('text-lg', 'font-semibold', 'mb-3')}>
            {t('notes:textFormatting')}
          </h3>
          <div
            className={cn(
              'bg-gray-50',
              'dark:bg-gray-800',
              'p-4',
              'rounded',
              'text-sm'
            )}
          >
            <pre>{t('notes:textFormattingExample')}</pre>
          </div>
        </section>

        <section>
          <h3 className={cn('text-lg', 'font-semibold', 'mb-3')}>
            {t('notes:lists')}
          </h3>
          <div
            className={cn(
              'bg-gray-50',
              'dark:bg-gray-800',
              'p-4',
              'rounded',
              'text-sm'
            )}
          >
            <pre>{t('notes:listsExample')}</pre>
          </div>
        </section>

        <section>
          <h3 className={cn('text-lg', 'font-semibold', 'mb-3')}>
            {t('notes:linksAndImages')}
          </h3>
          <div
            className={cn(
              'bg-gray-50',
              'dark:bg-gray-800',
              'p-4',
              'rounded',
              'text-sm'
            )}
          >
            <pre>{t('notes:linksAndImagesExample')}</pre>
          </div>
        </section>

        <section>
          <h3 className={cn('text-lg', 'font-semibold', 'mb-3')}>
            {t('notes:codeBlocks')}
          </h3>
          <div
            className={cn(
              'bg-gray-50',
              'dark:bg-gray-800',
              'p-4',
              'rounded',
              'text-sm'
            )}
          >
            <pre>{t('notes:codeBlocksExample')}</pre>
          </div>
          <p
            className={cn(
              'mt-2',
              'text-sm',
              'text-gray-600',
              'dark:text-gray-400'
            )}
          >
            {t('notes:codeLanguageSupport')}
          </p>
        </section>

        <section>
          <h3 className={cn('text-lg', 'font-semibold', 'mb-3')}>
            {t('notes:tables')}
          </h3>
          <div
            className={cn(
              'bg-gray-50',
              'dark:bg-gray-800',
              'p-4',
              'rounded',
              'text-sm'
            )}
          >
            <pre>{t('notes:tablesExample')}</pre>
          </div>
        </section>

        <section>
          <h3 className={cn('text-lg', 'font-semibold', 'mb-3')}>
            {t('notes:quotesAndDividers')}
          </h3>
          <div
            className={cn(
              'bg-gray-50',
              'dark:bg-gray-800',
              'p-4',
              'rounded',
              'text-sm'
            )}
          >
            <pre>{t('notes:quotesAndDividersExample')}</pre>
          </div>
        </section>

        <section>
          <h3 className={cn('text-lg', 'font-semibold', 'mb-3')}>
            {t('notes:escaping')}
          </h3>
          <p className={cn('mb-2')}>{t('notes:escapingDescription')}</p>
          <div
            className={cn(
              'bg-gray-50',
              'dark:bg-gray-800',
              'p-4',
              'rounded',
              'text-sm'
            )}
          >
            <pre>{t('notes:escapingExample')}</pre>
          </div>
        </section>
      </div>
    </div>
  );
};
