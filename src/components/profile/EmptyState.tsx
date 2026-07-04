import React, { type ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, message }) => (
  <div className="text-center py-4">
    <div className="text-text-secondary opacity-20 mx-auto mb-3 flex justify-center">{icon}</div>
    <p className="text-text-secondary text-sm">{message}</p>
  </div>
);

export default EmptyState;
