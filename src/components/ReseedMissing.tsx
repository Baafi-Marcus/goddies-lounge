import React, { useEffect } from 'react';
import { MenuService } from '../services/neon';
import { menuData } from '../data/menuData';
import { wineData } from '../data/wineData';

const ReseedMissing: React.FC = () => {
    useEffect(() => {
        const reseed = async () => {
            console.log("Checking for missing items...");
            try {
                const dbItems = await MenuService.getAllItems();
                const dbItemNames = new Set(dbItems.map((i: any) => i.name.toLowerCase().trim()));

                const allSourceData = [...menuData, ...wineData];
                let addedCount = 0;

                for (const item of allSourceData) {
                    const normalizedName = item.name.toLowerCase().trim();
                    if (!dbItemNames.has(normalizedName)) {
                        console.log(`Restoring missing item: ${item.name}`);
                        await MenuService.createItem({
                            name: item.name,
                            description: item.description,
                            price: item.price,
                            category: item.category,
                            image: item.image,
                            isAvailable: true
                        });
                        addedCount++;
                    }
                }

                if (addedCount > 0) {
                    alert(`Restored ${addedCount} missing items! Please refresh.`);
                } else {
                    console.log("All items appear to be present.");
                }

            } catch (e) {
                console.error("Reseed failed", e);
            }
        };

        reseed();
    }, []);

    return null;
};

export default ReseedMissing;
