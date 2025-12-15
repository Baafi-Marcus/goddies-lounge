import { v4 as uuidv4 } from 'uuid';
import type { MenuItem } from './menuData';

export const wineData: MenuItem[] = [
    // Wines (Combined Red & White)
    {
        id: uuidv4(),
        name: 'Cabernet Sauvignon',
        description: 'Full-bodied red wine with dark fruit flavors and savory notes.',
        price: 120,
        category: 'Wines',
        image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
    },
    {
        id: uuidv4(),
        name: 'Merlot',
        description: 'Smooth red wine with black cherry and herbal flavors.',
        price: 110,
        category: 'Wines',
        image: 'https://images.unsplash.com/photo-1559563362-c667ba5f5480?ixlib=rb-4.0.3&auto=format&fit=crop&w=1402&q=80',
    },
    {
        id: uuidv4(),
        name: 'Chardonnay',
        description: 'Dry white wine with apple and citrus flavors.',
        price: 100,
        category: 'Wines',
        image: 'https://images.unsplash.com/photo-1585553616435-2dc0a54e271d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80',
    },
    {
        id: uuidv4(),
        name: 'Sauvignon Blanc',
        description: 'Crisp white wine with tropical fruit and gooseberry notes.',
        price: 105,
        category: 'Wines',
        image: 'https://images.unsplash.com/photo-1572569878853-267595304326?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80',
    },

    // Champagne
    {
        id: uuidv4(),
        name: 'Moët & Chandon Imperial',
        description: 'The world\'s most loved champagne. Bright fruitiness and elegant maturity.',
        price: 850,
        category: 'Champagne',
        image: 'https://images.unsplash.com/photo-1598155523122-3842334d6c10?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80',
    },
    {
        id: uuidv4(),
        name: 'Moët & Chandon Nectar Imperial',
        description: 'A delicious expression of the Moët & Chandon style, distinguished by its bright fruitiness.',
        price: 950,
        category: 'Champagne',
        image: '/images/champagne-3.jpg', // Assumed mapping for now
    },
    {
        id: uuidv4(),
        name: 'Veuve Clicquot',
        description: 'A perfect balance between power and finesse, its complexity comes from the predominant presence of Pinot Noir.',
        price: 900,
        category: 'Champagne',
        image: '/images/champagne-4.png', // Assumed mapping
    },
    {
        id: uuidv4(),
        name: 'Belaire Rose',
        description: 'A refreshing, fruity sparkling wine with aromas of fresh strawberry and blackcurrant.',
        price: 550,
        category: 'Champagne',
        image: '/images/champagne-1.jpg', // Assumed mapping
    },
    {
        id: uuidv4(),
        name: 'Dom Pérignon',
        description: 'Vintage champagne with an intense, complex, and radiant bouquet.',
        price: 3500,
        category: 'Champagne',
        image: '/images/champagne-2.jpg', // Assumed mapping
    },

    // Spirits
    {
        id: uuidv4(),
        name: 'Hennessy V.S',
        description: 'Very Special cognac with intense and fruity character.',
        price: 600,
        category: 'Spirits',
        image: 'https://images.unsplash.com/photo-1613253289667-251f72df94e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80',
    },
    {
        id: uuidv4(),
        name: 'Jack Daniel\'s',
        description: 'Tennessee Whiskey charcoal mellowed for smoothness.',
        price: 350,
        category: 'Spirits',
        image: '/images/jack-daniels.png',
    },
    {
        id: uuidv4(),
        name: 'Johnnie Walker Black Label',
        description: 'Iconic blend of whiskies aged for at least 12 years.',
        price: 450,
        category: 'Spirits',
        image: 'https://images.unsplash.com/photo-1561575806-03ac95228833?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    },
    {
        id: uuidv4(),
        name: 'Jameson',
        description: 'Triple distilled Irish Whiskey, smooth and perfectly balanced.',
        price: 300,
        category: 'Spirits',
        image: 'https://images.unsplash.com/photo-1563895315-7762de4d720b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    },
    {
        id: uuidv4(),
        name: 'Baileys Irish Cream',
        description: 'The original Irish cream liqueur, perfect over ice.',
        price: 250,
        category: 'Spirits',
        image: '/images/baileys.jpg',
    },
    {
        id: uuidv4(),
        name: 'Cîroc Vodka',
        description: 'Ultra-premium vodka distilled from fine French grapes.',
        price: 500,
        category: 'Spirits',
        image: 'https://images.unsplash.com/photo-1606758661962-e64e9e03390c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    },

    // Local Drinks
    {
        id: uuidv4(),
        name: 'Don Simon',
        description: 'Refreshing fruit juice, perfect for any occasion.',
        price: 25,
        category: 'Local',
        image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    },
    {
        id: uuidv4(),
        name: 'Coca Cola',
        description: 'Classic refreshing soft drink.',
        price: 15,
        category: 'Local',
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    },
    {
        id: uuidv4(),
        name: 'Sprite',
        description: 'Crisp, lemon-lime sparkling beverage.',
        price: 15,
        category: 'Local',
        image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    },
    {
        id: uuidv4(),
        name: 'Fanta',
        description: 'Fruity orange sparkling soft drink.',
        price: 15,
        category: 'Local',
        image: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    },
];
