
import React from 'react';
import { AssignmentStatus } from '../types';

interface StatusBadgeProps {
  status: AssignmentStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles: Record<AssignmentStatus, string> = {
    [AssignmentStatus.PENDING]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    [AssignmentStatus.ASSIGNED]: 'bg-blue-100 text-blue-700 border-blue-200',
    [AssignmentStatus.IN_PROGRESS]: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    [AssignmentStatus.SUBMITTED]: 'bg-purple-100 text-purple-700 border-purple-200',
    [AssignmentStatus.COMPLETED]: 'bg-green-100 text-green-700 border-green-200',
    [AssignmentStatus.REVISION]: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export default StatusBadge;
