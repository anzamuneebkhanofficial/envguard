import React from 'react';
import { Badge } from '../ui/Badge';

interface VariableStatusBadgeProps {
  isCritical: boolean;
}

export function VariableStatusBadge({ isCritical }: VariableStatusBadgeProps) {
  if (isCritical) {
    return (
      <Badge variant="critical" icon="warning">
        Critical Alert
      </Badge>
    );
  }
  return <Badge variant="standard">Standard</Badge>;
}
