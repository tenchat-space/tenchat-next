
import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';

interface ContextMenuContextProps {
  showMenu: (x: number, y: number, menu: ReactNode) => void;
  hideMenu: () => void;
}

const ContextMenuContext = createContext<ContextMenuContextProps | undefined>(undefined);

export const useContextMenu = () => {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error('useContextMenu must be used within a ContextMenuProvider');
  }
  return context;
};

export const ContextMenuProvider = ({ children }: { children: ReactNode }) => {
  const [menu, setMenu] = useState<{ x: number; y: number; content: ReactNode } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const showMenu = (x: number, y: number, content: ReactNode) => {
    setMenu({ x, y, content });
  };

  const hideMenu = () => {
    setMenu(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        hideMenu();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        hideMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <ContextMenuContext.Provider value={{ showMenu, hideMenu }}>
      {children}
      {menu && (
        <div
          ref={menuRef}
          style={{ top: menu.y, left: menu.x, position: 'fixed', zIndex: 1000 }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {menu.content}
        </div>
      )}
    </ContextMenuContext.Provider>
  );
};
