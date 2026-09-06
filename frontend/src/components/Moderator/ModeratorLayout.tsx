import type { ReactNode } from 'react';
import { ModeratorSidebar } from './ModeratorSidebar';
import '../../styles/Moderator/ModeratorLayout.css';

interface ModeratorLayoutProps {
  children: ReactNode;
}

export const ModeratorLayout = ({ children }: ModeratorLayoutProps) => {
  return (
    <div className="moderator-layout">
      <ModeratorSidebar />
      <main className="moderator-layout__content">
        {children}
      </main>
    </div>
  );
};
