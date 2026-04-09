export type ErrorType =
  | 'note-save'
  | 'draft-sync'
  | 'graph-connection'
  | 'unknown';

export type ErrorMode = 'user' | 'background' | 'silent';

export type ErrorContext = {
  type?: ErrorType;
  mode?: ErrorMode;
  message?: string;
  report?: boolean;
  notify?: (message: string) => void;
  reporter?: (error: unknown, type: ErrorType) => void;
  logger?: (message: string, error: unknown) => void;
};

const DEFAULT_MESSAGE_BY_TYPE: Record<ErrorType, string> = {
  'note-save': 'Failed to save note',
  'draft-sync': 'Failed to sync draft',
  'graph-connection': 'Failed to update graph connection',
  unknown: 'Something went wrong',
};

export const handleError = (
  error: unknown,
  {
    type = 'unknown',
    mode = 'user',
    message,
    report = false,
    notify,
    reporter,
    logger = (logMessage, logError) => {
      console.error(logMessage, logError);
    },
  }: ErrorContext = {}
) => {
  if (mode === 'silent') {
    return;
  }

  const resolvedMessage = message ?? DEFAULT_MESSAGE_BY_TYPE[type];

  logger(`[error:${type}:${mode}]`, error);

  if (mode === 'user' && notify) {
    notify(resolvedMessage);
  }

  if (report && reporter) {
    reporter(error, type);
  }
};
