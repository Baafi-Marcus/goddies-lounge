import React from 'react';
import { Link } from 'react-router-dom';
import { FaWineGlassAlt, FaUtensils, FaStar } from 'react-icons/fa';
import SEO from '../components/SEO';
import jollofRice from '../assets/jollof-rice.jpg';
import shawarmaChicken from '../assets/shawarma-chicken.jpg';

const PublicMenu: React.FC = () => {
    return (
        <div className="bg-white">
            <SEO
                title="Signature Selection"
                description="Experience culinary excellence at Goddies Lounge. Explore our signature Jollof, gourmet shawarma, and curated wine list."
                keywords="culinary excellence, signature dishes, Kwame Mensah, gourmet food, fine dining"
            />
            {/* Hero Section */}
            <div className="relative h-[60vh] bg-brand-dark flex items-center justify-center text-center px-4">
                <div className="absolute inset-0 bg-black/50 z-10"></div>
                <img
                    src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
                    alt="Dining Experience"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="relative z-20 max-w-4xl mx-auto text-white animate-fade-in-up">
                    <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 text-brand-yellow">Culinary Excellence</h1>
                    <p className="text-xl md:text-2xl text-gray-200 mb-8 font-light">
                        Experience a symphony of flavors crafted with passion and precision.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/user/menu" className="btn-primary text-lg px-8 py-3">
                            Order Online
                        </Link>
                        <Link to="/user/wine" className="px-8 py-3 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-brand-dark transition-colors duration-300">
                            Explore Wines
                        </Link>
                    </div>
                </div>
            </div>

            {/* Signature Dish Section */}
            <section className="py-20 px-4">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-brand-red font-bold tracking-wider uppercase text-sm">Chef's Recommendation</span>
                        <h2 className="text-4xl md:text-5xl font-heading font-bold text-brand-dark mt-2">Signature Dishes</h2>
                        <div className="w-24 h-1 bg-brand-yellow mx-auto mt-6"></div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1">
                            <img
                                src={jollofRice}
                                alt="Signature Jollof"
                                className="rounded-2xl shadow-2xl w-full h-[500px] object-cover transform hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        <div className="order-1 md:order-2 space-y-6">
                            <h3 className="text-3xl font-bold text-brand-dark">The Goddies Special Jollof</h3>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                Our signature Jollof Rice is a celebration of West African heritage. Slow-cooked in a rich, smoky tomato stew with a secret blend of spices, served with tender grilled chicken, spicy shito, and fresh coleslaw. It's not just a meal; it's an experience that brings people together.
                            </p>
                            <div className="flex items-center gap-2 text-brand-yellow">
                                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                                <span className="text-gray-500 text-sm ml-2">(Most Popular)</span>
                            </div>
                            <Link to="/user/menu" className="inline-block text-brand-red font-bold hover:underline text-lg">
                                Order Now &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Menu Highlights */}
            <section className="py-20 bg-gray-50 px-4">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-heading font-bold text-brand-dark">Menu Highlights</h2>
                        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                            From savory starters to decadent desserts, explore a curated selection of our finest offerings.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-2xl transition-shadow duration-300">
                            <div className="h-64 overflow-hidden">
                                <img
                                    src={shawarmaChicken}
                                    alt="Shawarma"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-8">
                                <div className="w-12 h-12 bg-red-100 text-brand-red rounded-full flex items-center justify-center mb-4">
                                    <FaUtensils />
                                </div>
                                <h3 className="text-xl font-bold text-brand-dark mb-2">Gourmet Shawarma</h3>
                                <p className="text-gray-600 mb-4">
                                    Succulent marinated meat wrapped in fresh flatbread with our house-special garlic sauce and crisp veggies.
                                </p>
                                <Link to="/user/menu" className="text-brand-red font-medium hover:underline">View Details</Link>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-2xl transition-shadow duration-300">
                            <div className="h-64 overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                    alt="Fine Wine"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-8">
                                <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4">
                                    <FaWineGlassAlt />
                                </div>
                                <h3 className="text-xl font-bold text-brand-dark mb-2">Curated Wine List</h3>
                                <p className="text-gray-600 mb-4">
                                    An extensive collection of premium wines from around the globe, perfectly paired with our dishes.
                                </p>
                                <Link to="/user/wine" className="text-brand-red font-medium hover:underline">Explore Wines</Link>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-2xl transition-shadow duration-300">
                            <div className="h-64 overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                    alt="Burgers"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-8">
                                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4">
                                    <FaUtensils />
                                </div>
                                <h3 className="text-xl font-bold text-brand-dark mb-2">Classic Burgers</h3>
                                <p className="text-gray-600 mb-4">
                                    Juicy, flame-grilled beef patties topped with melted cheese and fresh ingredients on a toasted bun.
                                </p>
                                <Link to="/user/menu" className="text-brand-red font-medium hover:underline">View Details</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Meet the Chefs */}
            <section className="py-20 px-4">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-brand-red font-bold tracking-wider uppercase text-sm">The Masterminds</span>
                        <h2 className="text-4xl md:text-5xl font-heading font-bold text-brand-dark mt-2">Meet Our Chefs</h2>
                        <div className="w-24 h-1 bg-brand-yellow mx-auto mt-6"></div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                        {/* Chef 1 */}
                        <div className="flex flex-col items-center text-center">
                            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-brand-yellow mb-6 shadow-xl">
                                <img
                                    src="https://images.unsplash.com/photo-1583394293214-28ded15ee548?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                    alt="Head Chef"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="text-2xl font-bold text-brand-dark">Chef Kwame Mensah</h3>
                            <p className="text-brand-red font-medium mb-4">Executive Head Chef</p>
                            <p className="text-gray-600">
                                With over 15 years of culinary experience, Chef Kwame brings a modern twist to traditional Ghanaian cuisine. His passion for fresh, local ingredients shines through in every dish.
                            </p>
                        </div>

                        {/* Chef 2 */}
                        <div className="flex flex-col items-center text-center">
                            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-brand-yellow mb-6 shadow-xl">
                                <img
                                    src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                    alt="Sous Chef"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="text-2xl font-bold text-brand-dark">Chef Sarah Doe</h3>
                            <p className="text-brand-red font-medium mb-4">Sous Chef & Pastry Specialist</p>
                            <p className="text-gray-600">
                                Chef Sarah is the creative force behind our exquisite desserts and pastries. Her attention to detail and artistic flair make every sweet treat a masterpiece.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PublicMenu;
