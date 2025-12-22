import React from 'react';
import { FaHistory, FaUsers, FaAward } from 'react-icons/fa';
import SEO from '../components/SEO';

const About: React.FC = () => {
    return (
        <div className="bg-gray-50 min-h-screen animate-fade-in">
            <SEO
                title="About Us"
                description="Learn the story behind Goddies Lounge & Wine Bar. Established in 2025, we serve over 50k guests with award-winning hospitality."
                keywords="restaurant history, about us, Goddies Lounge story, Okyeman hospitality"
            />
            {/* Hero Section */}
            <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-black/60 z-10"></div>
                <img
                    src="https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80"
                    alt="About Goddies"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />
                <div className="container mx-auto px-4 relative z-20 text-center text-white">
                    <h1 className="text-5xl md:text-6xl font-heading font-bold mb-4">About <span className="text-brand-yellow">Us</span></h1>
                    <p className="text-xl max-w-2xl mx-auto">The story behind the taste.</p>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="md:w-1/2">
                            <img
                                src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
                                alt="Chefs Cooking"
                                className="rounded-2xl shadow-xl w-full"
                            />
                        </div>
                        <div className="md:w-1/2">
                            <h2 className="text-3xl font-heading font-bold mb-6 text-brand-dark">Our <span className="text-brand-red">Story</span></h2>
                            <p className="text-gray-600 mb-4 leading-relaxed">
                                Welcome to Goddies Lounge & Wine Bar!
                            </p>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                At Goddies Lounge & Wine Bar, we are more than just a place to eat and drink – we are a vibrant hub for food lovers and wine enthusiasts alike. Located in the heart of Okyeman, our lounge is a perfect blend of cozy ambiance, great food, and exceptional service.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
                                <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                                    <FaHistory className="text-brand-red text-3xl mx-auto mb-2" />
                                    <h4 className="font-bold">Est. 2025</h4>
                                </div>
                                <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                                    <FaUsers className="text-brand-yellow text-3xl mx-auto mb-2" />
                                    <h4 className="font-bold">50k+ Guests</h4>
                                </div>
                                <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                                    <FaAward className="text-blue-500 text-3xl mx-auto mb-2" />
                                    <h4 className="font-bold">Award Winning</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
