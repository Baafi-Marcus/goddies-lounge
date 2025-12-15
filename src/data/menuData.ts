import { v4 as uuidv4 } from 'uuid';

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    available?: boolean;
}

export const menuData: MenuItem[] = [
    // Pizza
    {
        id: uuidv4(),
        name: 'Margherita Pizza',
        description: 'Classic tomato sauce, mozzarella cheese, and fresh basil.',
        price: 80.00,
        category: 'Pizza',
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        available: true
    },
    {
        id: uuidv4(),
        name: 'Pepperoni Pizza',
        description: 'Spicy pepperoni slices with mozzarella and tomato sauce.',
        price: 95.00,
        category: 'Pizza',
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        available: true
    },
    {
        id: uuidv4(),
        name: 'Meat Lovers Pizza',
        description: 'Loaded with beef, sausage, pepperoni, and ham.',
        price: 110.00,
        category: 'Pizza',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        available: true
    },

    // Burger
    {
        id: uuidv4(),
        name: 'Classic Beef Burger',
        description: 'Juicy beef patty with lettuce, tomato, onion, and cheese.',
        price: 65.00,
        category: 'Burger',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        available: true
    },
    {
        id: uuidv4(),
        name: 'Chicken Burger',
        description: 'Crispy chicken fillet with mayo and pickles.',
        price: 60.00,
        category: 'Burger',
        image: '/images/chicken-burger.jpg',
        available: true
    },

    // Shawarma
    {
        id: uuidv4(),
        name: 'Chicken Shawarma',
        description: 'Grilled chicken strips with veggies and garlic sauce in a wrap.',
        price: 45.00,
        category: 'Shawarma',
        image: '/images/shawarma-chicken.jpg',
        available: true
    },
    {
        id: uuidv4(),
        name: 'Beef Shawarma',
        description: 'Tender beef strips with tahini and veggies.',
        price: 50.00,
        category: 'Shawarma',
        image: '/images/shawarma-beef.jpg',
        available: true
    },

    // Wraps (Beef & Chicken)
    {
        id: uuidv4(),
        name: 'Beef Wrap',
        description: 'Seasoned beef strips with fresh veggies in a tortilla.',
        price: 50.00,
        category: 'Wraps',
        image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        available: true
    },
    {
        id: uuidv4(),
        name: 'Chicken Wrap',
        description: 'Grilled chicken with lettuce and sauce in a soft wrap.',
        price: 45.00,
        category: 'Wraps',
        image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        available: true
    },

    // Rice (Jollof & Fried Rice)
    {
        id: uuidv4(),
        name: 'Jollof Rice with Grilled Chicken',
        description: 'Spicy Ghanaian Jollof rice served with grilled chicken and coleslaw.',
        price: 60.00,
        category: 'Rice',
        image: '/images/jollof-rice.jpg',
        available: true
    },
    {
        id: uuidv4(),
        name: 'Fried Rice with Chicken',
        description: 'Classic fried rice with veggies, egg, and crispy chicken.',
        price: 55.00,
        category: 'Rice',
        image: '/images/fried-rice.jpg',
        available: true
    },

    // Assorted (Jollof, Fried Rice, Noodles)
    {
        id: uuidv4(),
        name: 'Assorted Jollof Rice',
        description: 'Jollof rice mixed with beef, chicken, and sausages.',
        price: 85.00,
        category: 'Assorted',
        image: '/images/assorted-jollof.jpg',
        available: true
    },
    {
        id: uuidv4(),
        name: 'Assorted Fried Rice',
        description: 'Fried rice loaded with shrimp, beef, and chicken.',
        price: 80.00,
        category: 'Assorted',
        image: '/images/assorted-fried-rice.jpg',
        available: true
    },
    {
        id: uuidv4(),
        name: 'Assorted Noodles',
        description: 'Stir-fried noodles with mixed vegetables, beef, and chicken.',
        price: 75.00,
        category: 'Assorted',
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        available: true
    },

    // Loaded Fries
    {
        id: uuidv4(),
        name: 'Loaded Fries',
        description: 'Crispy fries topped with cheese sauce, bacon bits, and jalapeños.',
        price: 55.00,
        category: 'Loaded Fries',
        image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        available: true
    },

    // Yam Chips & Chicken Wings
    {
        id: uuidv4(),
        name: 'Yam Chips & Chicken Wings',
        description: 'Fried yam chips served with spicy chicken wings and shito.',
        price: 70.00,
        category: 'Yam Chips & Chicken Wings',
        image: 'https://images.unsplash.com/photo-1604152135912-04a022e23696?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        available: true
    },
];
