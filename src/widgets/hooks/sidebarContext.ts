import React, { createContext, useContext, useState } from 'react';

type SidebarContextType = {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return React.createElement(
    SidebarContext.Provider,
    { value: { isMobileOpen, setIsMobileOpen } },
    children
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('use Sidebar must be used within SidebarProvider');
  }
  return context;
};
