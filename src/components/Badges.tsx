import type { Classification, Readiness } from '../types/equipment';

export function ClassificationBadge({ value }: { value: Classification }) {
  const styles: Record<Classification, string> = {
    'Reuse Candidate': 'bg-green-100 text-green-800 border border-green-200',
    'Refurbish Candidate': 'bg-amber-100 text-amber-800 border border-amber-200',
    'Parts Candidate': 'bg-blue-100 text-blue-800 border border-blue-200',
    'Needs Assessment': 'bg-gray-100 text-gray-700 border border-gray-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[value]}`}>
      {value}
    </span>
  );
}

export function ReadinessBadge({ value }: { value: Readiness }) {
  const styles: Record<Readiness, string> = {
    Candidate: 'bg-green-100 text-green-800 border border-green-200',
    Conditional: 'bg-amber-100 text-amber-800 border border-amber-200',
    Blocked: 'bg-red-100 text-red-800 border border-red-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[value]}`}>
      {value}
    </span>
  );
}

export function ConditionBadge({ value }: { value: string }) {
  const styles: Record<string, string> = {
    'Working': 'bg-green-100 text-green-800 border border-green-200',
    'Needs repair': 'bg-amber-100 text-amber-800 border border-amber-200',
    'Untested': 'bg-gray-100 text-gray-700 border border-gray-200',
    'Nonfunctional': 'bg-red-100 text-red-800 border border-red-200',
  };
  const style = styles[value] ?? 'bg-gray-100 text-gray-600 border border-gray-200';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {value}
    </span>
  );
}
