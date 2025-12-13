import React, { useEffect } from 'react';
import { MenuService, RiderService } from '../services/neon';
import { menuData } from '../data/menuData';
import { wineData } from '../data/wineData';

const SeedData: React.FC = () => {
    useEffect(() => {
        const seed = async () => {
            console.log("Starting Data Seeding...");

            // 1. Seed Menu Items
            try {
                const existingItems = await MenuService.getAllItems();
                if (existingItems.length === 0) {
                    console.log("Seeding Menu Items...");
                    for (const item of [...menuData, ...wineData]) {
                        await MenuService.createItem({
                            name: item.name,
                            description: item.description,
                            price: item.price,
                            category: item.category,
                            image: item.image,
                            isAvailable: true
                        });
                    }
                    console.log("Menu Items Seeded!");
                } else {
                    console.log("Menu items already exist. Skipping.");
                }
            } catch (e) {
                console.error("Error seeding menu:", e);
            }

            // 2. Seed Rider (Baafi Marcus)
            try {
                const riders = await RiderService.getAllRiders();
                const baafiExists = riders.find((r: any) => r.name?.toLowerCase().includes('baafi'));

                if (!baafiExists) {
                    console.log("Seeding Rider: Baafi Marcus...");
                    await RiderService.createRider({
                        name: "Baafi Marcus",
                        email: "baafi.marcus@example.com", // Placeholder
                        phone: "0540000000", // Placeholder
                        password: "password123", // Default password
                        registrationNumber: "RDR-BAAFI",
                        vehicleType: "motorcycle",
                        vehicleNumber: "GR-0000-24",
                        status: "active"
                    });
                    console.log("Rider Baafi Marcus Seeded!");
                } else {
                    console.log("Rider Baafi Marcus already exists. Skipping.");
                }
            } catch (e) {
                console.error("Error seeding rider:", e);
            }

            console.log("Seeding Complete!");
        };

        seed();
    }, []);

    return null; // Invisible component
};

export default SeedData;
