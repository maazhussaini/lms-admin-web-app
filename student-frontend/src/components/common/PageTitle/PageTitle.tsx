import React from 'react';

interface PageTitleProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const PageTitle: React.FC<PageTitleProps> = ({ 
  title, 
  subtitle, 
  actions 
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-neutral-900">{title}</h1>
        {subtitle && <p className="mt-1 text-neutral-600">{subtitle}</p>}
      </div>
      {actions && <div className="mt-4 md:mt-0">{actions}</div>}
    </div>
  );
};

export default PageTitle;
