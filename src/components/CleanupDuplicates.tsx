import React, { useEffect } from 'react';
import { MenuService } from '../services/neon';

const CleanupDuplicates: React.FC = () => {
    useEffect(() => {
        const cleanup = async () => {
            console.log("Starting Duplicate Cleanup...");
            try {
                const allItems = await MenuService.getAllItems();
                const seenNames = new Map();
                const duplicates = [];

                for (const item of allItems) {
                    if (seenNames.has(item.name)) {
                        duplicates.push(item);
                    } else {
                        seenNames.set(item.name, item.id);
                    }
                }

                console.log(`Found ${duplicates.length} duplicates.`);

                for (const item of duplicates) {
                    console.log(`Deleting duplicate: ${item.name} (${item.id})`);
                    await MenuService.deleteItem(item.id);
                }

                console.log("Cleanup Complete!");
                if (duplicates.length > 0) {
                    alert(`Cleanup Complete: Removed ${duplicates.length} duplicate items.`);
                }
            } catch (e) {
                console.error("Cleanup failed", e);
            }
        };

        cleanup();
    }, []);

    return null;
};

export default CleanupDuplicates;
