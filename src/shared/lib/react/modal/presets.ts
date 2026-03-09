import type { ModalOptions } from './useModal';

export const MODAL_SIZE_PRESETS: Record<string, ModalOptions['size']> = {
  layoutCreate: 'lg',
  layoutUpdate: 'lg',
  layoutDelete: 'lg',
  shareAccess: 'lg',
  authForgotPasswordEmail: 'lg',
  authConfirmCode: 'lg',
  authResetPassword: 'lg',
  dataImport: 'xl',
  noteCreate: 'xl',
  noteDelete: 'lg',
  noteEditTitle: 'lg',
  noteMarkdownHelp: 'xl',
  noteImport: 'xl',
  createChoice: 'xl',
  folderSelect: 'xl',
} as const;
