import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Table {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    shape: 'rectangle' | 'circle';
    seats: number;
    label: string;
    type: '2-seater' | '4-seater' | '6-seater' | '8-seater' | 'round';
}

interface TableContextType {
    tables: Table[];
    addTable: (table: Table) => void;
    updateTable: (id: string, updates: Partial<Table>) => void;
    removeTable: (id: string) => void;
    saveLayout: () => void;
    resetLayout: () => void;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export const useTable = () => {
    const context = useContext(TableContext);
    if (!context) {
        throw new Error('useTable must be used within a TableProvider');
    }
    return context;
};

export const TableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tables, setTables] = useState<Table[]>([]);

    // Load from local storage on mount
    useEffect(() => {
        const savedTables = localStorage.getItem('goddies_table_layout');
        if (savedTables) {
            try {
                setTables(JSON.parse(savedTables));
            } catch (e) {
                console.error('Failed to parse table layout', e);
            }
        }
    }, []);

    const addTable = (table: Table) => {
        setTables((prev) => [...prev, table]);
    };

    const updateTable = (id: string, updates: Partial<Table>) => {
        setTables((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
        );
    };

    const removeTable = (id: string) => {
        setTables((prev) => prev.filter((t) => t.id !== id));
    };

    const saveLayout = () => {
        localStorage.setItem('goddies_table_layout', JSON.stringify(tables));
        alert('Layout saved successfully!');
    };

    const resetLayout = () => {
        if (window.confirm('Are you sure you want to clear the layout?')) {
            setTables([]);
            localStorage.removeItem('goddies_table_layout');
        }
    };

    return (
        <TableContext.Provider value={{ tables, addTable, updateTable, removeTable, saveLayout, resetLayout }}>
            {children}
        </TableContext.Provider>
    );
};
