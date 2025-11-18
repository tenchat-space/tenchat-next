import { useState, useEffect, useCallback, RefObject } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

export function useDraggable(
  ref: RefObject<HTMLElement | null>,
  initialPosition: Position,
  onDragEnd: (pos: Position) => void,
  enabled: boolean = true
) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition.x, initialPosition.y]);

  const handleMouseDown = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!enabled || !ref.current) return;
    // Only drag if clicking the header/handle
    const target = e.target as HTMLElement;
    if (!target.closest('.window-drag-handle')) return;

    setIsDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    e.preventDefault();
  }, [enabled, position, ref]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const newPos = {
      x: e.clientX - offset.x,
      y: e.clientY - offset.y
    };
    setPosition(newPos);
  }, [isDragging, offset]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onDragEnd(position);
    }
  }, [isDragging, onDragEnd, position]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return { position, handleMouseDown, isDragging };
}

export function useResizable(
    ref: RefObject<HTMLElement | null>,
    initialSize: Size,
    onResizeEnd: (size: Size) => void,
    enabled: boolean = true
) {
    const [size, setSize] = useState(initialSize);
    const [isResizing, setIsResizing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [startSize, setStartSize] = useState(initialSize);

    useEffect(() => {
        setSize(initialSize);
    }, [initialSize.width, initialSize.height]);

    const handleMouseDown = useCallback((e: React.MouseEvent, direction: string) => {
        if (!enabled) return;
        setIsResizing(true);
        setStartPos({ x: e.clientX, y: e.clientY });
        setStartSize(size);
        e.preventDefault();
        e.stopPropagation();
    }, [enabled, size]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing) return;
        const deltaX = e.clientX - startPos.x;
        const deltaY = e.clientY - startPos.y;
        
        setSize({
            width: Math.max(300, startSize.width + deltaX),
            height: Math.max(200, startSize.height + deltaY)
        });
    }, [isResizing, startPos, startSize]);

    const handleMouseUp = useCallback(() => {
        if (isResizing) {
            setIsResizing(false);
            onResizeEnd(size);
        }
    }, [isResizing, onResizeEnd, size]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, handleMouseMove, handleMouseUp]);

    return { size, handleResizeStart: handleMouseDown, isResizing };
}
