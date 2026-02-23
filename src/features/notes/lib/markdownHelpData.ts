export interface HelpSectionData {
  titleKey: string;
  descriptionKey?: string;
  exampleKey: string;
  noteKey?: string;
}

export const markdownHelpSections: HelpSectionData[] = [
  {
    titleKey: 'notes:paragraphsAndBreaks',
    descriptionKey: 'notes:paragraphsDescription',
    exampleKey: 'notes:paragraphsExample',
    noteKey: 'notes:lineBreaksDescription',
  },
  {
    titleKey: 'notes:headings',
    exampleKey: 'notes:headingsExample',
  },
  {
    titleKey: 'notes:textFormatting',
    exampleKey: 'notes:textFormattingExample',
  },
  {
    titleKey: 'notes:lists',
    exampleKey: 'notes:listsExample',
  },
  {
    titleKey: 'notes:linksAndImages',
    exampleKey: 'notes:linksAndImagesExample',
  },
  {
    titleKey: 'notes:codeBlocks',
    exampleKey: 'notes:codeBlocksExample',
    noteKey: 'notes:codeLanguageSupport',
  },
  {
    titleKey: 'notes:tables',
    exampleKey: 'notes:tablesExample',
  },
  {
    titleKey: 'notes:quotesAndDividers',
    exampleKey: 'notes:quotesAndDividersExample',
  },
  {
    titleKey: 'notes:escaping',
    descriptionKey: 'notes:escapingDescription',
    exampleKey: 'notes:escapingExample',
  },
];
