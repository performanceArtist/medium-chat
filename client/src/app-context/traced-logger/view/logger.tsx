import React, { memo } from 'react';
import { LogEntry } from './logger.source';

type LoggerProps = {
  sourceEntries: LogEntry[];
  mediumEntries: LogEntry[];
};

const LogEntry = memo<{ entry: LogEntry }>(props => {
  const {
    entry: { tag, payload },
  } = props;

  return (
    <div>
      {tag} {JSON.stringify(payload)}
    </div>
  );
});

export const Logger = memo<LoggerProps>(props => {
  const { sourceEntries, mediumEntries } = props;

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ marginRight: '20px' }}>
        <h2>In:</h2>
        <div>
          {sourceEntries.map((entry, index) => (
            <LogEntry key={index} entry={entry} />
          ))}
        </div>
      </div>
      <div>
        <h2>Out:</h2>
        <div>
          {mediumEntries.map((entry, index) => (
            <LogEntry key={index} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  );
});
