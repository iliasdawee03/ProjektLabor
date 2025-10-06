import React from 'react';

export interface TableProps {
  columns: { key: string; label: string }[];
  data: Record<string, React.ReactNode>[];
  className?: string;
}

export const Table: React.FC<TableProps> = ({ columns, data, className }) => (
  <div className={className}>
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            {columns.map(col => (
              <th key={col.key} className="py-2 pr-4">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b">
              {columns.map(col => (
                <td key={col.key} className="py-2 pr-4">{row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
