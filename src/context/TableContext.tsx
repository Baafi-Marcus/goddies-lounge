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

import { TableService } from '../services/neon';

// ... (existing interface definitions)

export const TableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);

    // Load from DB on mount
    useEffect(() => {
        const loadTables = async () => {
            try {
                const data = await TableService.getLayout();
                // Map properties if needed (DB columns are snake_case? No, neon output usually automatic if matches, but let's be safe or strict)
                // My neon service uses exact column names in insert, SELECT * returns them as is. 
                // Need to ensure casing matches. `getLayout` returns `restaurant_tables`.
                // Actually my neon setup returns whatever the DB has.
                // Wait, in `neon.ts` I didn't alias columns in `getLayout`.
                // Let's check `neon.ts` `ensureTableExists`: columns are snake_case? No, `x`, `y`, `width` are standard. `label`, `type`.
                // They are lowercase. TypeScript Table interface uses lowercase.
                // So it should match. `id`, `x`, `y`, `width`, `height`, `shape`, `seats`, `label`, `type`.
                setTables(data as Table[]);
            } catch (e) {
                console.error('Failed to load table layout', e);
            } finally {
                setLoading(false);
            }
        };
        loadTables();
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

    const saveLayout = async () => {
        try {
            await TableService.saveLayout(tables);
            alert('Layout saved to database successfully!');
        } catch (e) {
            console.error('Failed to save layout', e);
            alert('Failed to save layout. Please try again.');
        }
    };

    const resetLayout = async () => {
        if (window.confirm('Are you sure you want to clear the layout?')) {
            setTables([]);
            try {
                await TableService.saveLayout([]);
            } catch (e) {
                console.error('Failed to clear layout', e);
            }
        }
    };

    return (
        <TableContext.Provider value={{ tables, addTable, updateTable, removeTable, saveLayout, resetLayout }}>
            {children}
        </TableContext.Provider>
    );
};
