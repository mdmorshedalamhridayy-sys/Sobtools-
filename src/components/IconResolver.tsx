import React from 'react';
import * as Icons from 'lucide-react';
import { LucideProps } from 'lucide-react';

interface IconResolverProps extends LucideProps {
  name: string;
}

export const IconResolver: React.FC<IconResolverProps> = ({ name, ...props }) => {
  // @ts-expect-error Lucide icons indexed by name string
  const IconComponent = Icons[name] || Icons.Wrench;
  return <IconComponent {...props} />;
};
