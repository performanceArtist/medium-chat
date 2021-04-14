import { source, SourceOf } from '@performance-artist/medium';

export type LogEntry = {
  tag: string;
  payload: unknown;
};

type LoggerState = {
  sourceEntries: LogEntry[];
  mediumEntries: LogEntry[];
};

const initialState: LoggerState = {
  sourceEntries: [],
  mediumEntries: [],
};

export type LoggerSource = SourceOf<LoggerState, {}>;

export const makeLoggerSource = (): LoggerSource =>
  source.create(initialState, {});
