import React from 'react';

interface ExternalLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  nofollow?: boolean;
}

export default function ExternalLink({ 
  href, 
  children, 
  nofollow = true,
  rel,
  target = '_blank',
  ...props 
}: ExternalLinkProps) {
  const defaultRel = nofollow 
    ? 'nofollow noopener noreferrer' 
    : 'noopener noreferrer';
  
  return (
    <a
      href={href}
      target={target}
      rel={rel || defaultRel}
      {...props}
    >
      {children}
    </a>
  );
}

