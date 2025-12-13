import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Link } from 'react-router-dom';
import { FaUtensils, FaWineGlass, FaMotorcycle, FaArrowRight, FaChevronDown } from 'react-icons/fa';
import { menuData } from '../data/menuData';
import { wineData } from '../data/wineData';
import heroVideo1 from '../assets/hero-video-1.mp4';
import heroVideo2 from '../assets/hero-video-2.mp4';

const Home: React.FC = () => {
    const [currentVideo, setCurrentVideo] = useState(0);
    const [isYoutubeError, setIsYoutubeError] = useState(false);
    const videos = [heroVideo1, heroVideo2];

    useEffect(() => {
        // Only cycle local videos if using them
        if (isYoutubeError) {
            const interval = setInterval(() => {
                setCurrentVideo((prev) => (prev + 1) % videos.length);
            }, 8000);
            return () => clearInterval(interval);
        }
    }, [videos.length, isYoutubeError]);

    return (
        <div className="animate-fade-in font-sans">
            {/* Hero Section */}
            <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-black">
                {/* YouTube Main Video */}
                {!isYoutubeError && (
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60 z-20"></div>
                        <div className="relative w-full h-full pt-[56.25%]"> {/* 16:9 Aspect Ratio container */}
                            <ReactPlayer
                                src='https://youtu.be/3FBp_Tlgefk?si=wynuPLqPYloIWfKs&start=7&end=63'
                                autoPlay={true}
                                playing={true}
                                loop={true}
                                muted={true}
                                controls={false}
                                playsInline={true}
                                crossOrigin="anonymous"
                                width="100%"
                                height="100%"
                                config={{
                                    youtube: {
                                        start: 7,
                                        end: 163,
                                        showinfo: 0,
                                        controls: 0,
                                        rel: 0,
                                        iv_load_policy: 3,
                                        modestbranding: 1,
                                        disablekb: 1,
                                        playsInline: 1
                                    }
                                }}
                                onError={() => setIsYoutubeError(true)}
                                style={{ position: 'absolute', top: '0', left: '0', transform: 'scale(1.5)' }} // Scale to cover better
                                className="object-cover"
                            />
                        </div>
                    </div>
                )}

                {/* Local Video Fallback */}
                {isYoutubeError && videos.map((video, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 z-0 transition-opacity duration-[2000ms] ease-in-out ${index === currentVideo ? 'opacity-100' : 'opacity-0'}`}
                    >
                        {/* Reduced overlay opacity for better video visibility */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60 z-10"></div>
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover scale-105" // Slight scale to prevent edge artifacts
                        >
                            <source src={video} type="video/mp4" />
                        </video>
                    </div>
                ))}


                <div className="relative z-20 text-center px-4 max-w-5xl mx-auto pt-32">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-white mb-6 leading-tight animate-fade-in-up animation-delay-200 drop-shadow-2xl">
                        Taste the <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow to-yellow-200">Passion</span><br />
                        in Every <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-red-400">Bite</span>
                    </h1>

                    <p className="text-base md:text-lg text-gray-100 mb-10 max-w-xl mx-auto font-light leading-relaxed animate-fade-in-up animation-delay-400 drop-shadow-lg bg-black/10 backdrop-blur-[2px] p-2 rounded-lg">
                        Experience the finest local and continental dishes in an atmosphere of elegance, comfort, and culinary artistry.
                    </p>

                    <div className="flex flex-col md:flex-row gap-6 justify-center items-center animate-fade-in-up animation-delay-600">
                        <Link
                            to="/user/menu"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative px-8 py-4 bg-brand-red text-white text-lg font-bold rounded-full overflow-hidden shadow-lg shadow-brand-red/30 transition-all hover:scale-105 hover:shadow-brand-red/50"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Order Food <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-brand-red opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </Link>

                        <Link
                            to="/user/reservations"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group px-8 py-4 bg-transparent border-2 border-white text-white text-lg font-bold rounded-full hover:bg-white hover:text-brand-dark transition-all hover:scale-105 backdrop-blur-sm"
                        >
                            Book a Table
                        </Link>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce text-white/70">
                    <FaChevronDown size={24} />
                </div>
            </section >

            {/* Popular Items Section (Marquee Animation) */}
            < section className="py-12 bg-gray-50 overflow-hidden" >
                <div className="container mx-auto px-4 mb-10 text-center">
                    <span className="text-brand-red font-bold tracking-wider uppercase text-sm mb-2 block">Our Best Sellers</span>
                    <h2 className="text-3xl md:text-4xl font-heading font-bold text-brand-dark mb-4">Popular <span className="text-brand-red">Favorites</span></h2>
                    <div className="w-24 h-1 bg-brand-yellow mx-auto rounded-full mb-4"></div>
                    <p className="text-gray-600 max-w-2xl mx-auto text-base">Discover the dishes and wines that keep our guests coming back for more.</p>
                </div>

                <div className="relative w-full overflow-hidden py-4">
                    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 to-transparent z-10"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 to-transparent z-10"></div>

                    <div className="flex animate-marquee gap-6 w-max hover:pause px-4">
                        {/* Showing strictly 6 items as requested */}
                        {[...menuData.slice(0, 3), ...wineData.slice(0, 3)].map((item, index) => (
                            <div key={`${item.id}-${index}`} className="w-72 bg-white rounded-2xl shadow-md hover:shadow-lg overflow-hidden flex-shrink-0 border border-gray-100 transform transition-all duration-300 hover:-translate-y-1 group">
                                <div className="h-48 overflow-hidden relative">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-brand-dark shadow-sm">
                                        {item.category}
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="mb-2">
                                        <h3 className="font-bold text-lg text-brand-dark line-clamp-1 mb-1 group-hover:text-brand-red transition-colors">{item.name}</h3>
                                        <div className="flex text-brand-yellow text-xs gap-1">
                                            <FaUtensils /> <span className="text-gray-400">Goddies Special</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-500 text-xs mb-4 line-clamp-2 leading-relaxed">{item.description}</p>
                                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                        <span className="font-heading font-bold text-xl text-brand-red">₵{item.price.toFixed(2)}</span>
                                        <Link to="/user/menu" className="w-8 h-8 rounded-full bg-brand-dark text-white flex items-center justify-center hover:bg-brand-yellow hover:text-brand-dark transition-colors shadow-md">
                                            <FaArrowRight size={12} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section >

            {/* Testimonials Section */}
            < section className="py-20 bg-white relative overflow-hidden" >
                {/* Decorative Elements */}
                < div className="absolute top-0 left-0 w-64 h-64 bg-brand-yellow/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" ></div >
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-red/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-12">
                        <span className="text-brand-yellow font-bold tracking-wider uppercase text-sm mb-2 block">Testimonials</span>
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-brand-dark">Guest <span className="text-brand-yellow">Stories</span></h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { name: 'Kwame Mensah', role: 'Food Critic', text: 'The Jollof rice here is simply unmatched. The perfect balance of spice and flavor! It reminds me of home but with a gourmet touch.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80' },
                            { name: 'Sarah Doe', role: 'Regular Guest', text: 'A wonderful atmosphere for evening relaxation. The wine selection is exquisite and the staff always makes you feel like royalty.', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80' },
                            { name: 'John Smith', role: 'Event Planner', text: 'Hosted my birthday party here and the service was impeccable. The team went above and beyond to ensure everything was perfect.', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80' },
                        ].map((testimonial, index) => (
                            <div key={index} className="bg-gray-50 p-8 rounded-3xl relative hover:-translate-y-2 transition-transform duration-300 border border-gray-100 shadow-sm hover:shadow-xl">
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                                    <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full border-4 border-white shadow-lg object-cover" />
                                </div>
                                <div className="mt-6 text-center">
                                    <div className="flex justify-center gap-1 text-brand-yellow mb-3">
                                        {[1, 2, 3, 4, 5].map(i => <FaUtensils key={i} size={10} />)}
                                    </div>
                                    <p className="text-gray-600 italic mb-4 leading-relaxed text-sm">"{testimonial.text}"</p>
                                    <div>
                                        <h4 className="font-bold text-base text-brand-dark">{testimonial.name}</h4>
                                        <span className="text-xs text-brand-red font-medium">{testimonial.role}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section >

            {/* Features Section */}
            < section className="py-20 bg-white text-brand-dark relative border-t border-gray-100" >
                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="group p-8 text-center rounded-2xl hover:bg-gray-50 transition-colors duration-300 border border-gray-100 shadow-sm hover:shadow-md">
                            <div className="w-16 h-16 bg-brand-red/10 text-brand-red rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                <FaUtensils size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-3 group-hover:text-brand-red transition-colors">Delicious Menu</h3>
                            <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                                From Jollof to Loaded Fries, enjoy a wide variety of mouth-watering dishes prepared with love and the finest ingredients.
                            </p>
                            <Link to="/user/menu" className="inline-flex items-center gap-2 text-brand-red font-bold hover:text-brand-dark transition-colors uppercase tracking-wider text-xs">
                                View Menu <FaArrowRight />
                            </Link>
                        </div>

                        {/* Feature 2 */}
                        <div className="group p-8 text-center rounded-2xl hover:bg-gray-50 transition-colors duration-300 border border-gray-100 shadow-sm hover:shadow-md">
                            <div className="w-16 h-16 bg-brand-yellow/10 text-brand-yellow rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                <FaWineGlass size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-3 group-hover:text-brand-yellow transition-colors">Wine & Lounge</h3>
                            <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                                Relax with our premium selection of wines and spirits in a cozy and elegant atmosphere designed for your comfort.
                            </p>
                            <Link to="/user/wine" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-brand-yellow font-bold hover:text-brand-dark transition-colors uppercase tracking-wider text-xs">
                                Explore Wines <FaArrowRight />
                            </Link>
                        </div>

                        {/* Feature 3 */}
                        <div className="group p-8 text-center rounded-2xl hover:bg-gray-50 transition-colors duration-300 border border-gray-100 shadow-sm hover:shadow-md">
                            <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                <FaMotorcycle size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-3 group-hover:text-green-600 transition-colors">Fast Delivery</h3>
                            <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                                Order from the comfort of your home and get your food delivered hot and fresh right to your doorstep.
                            </p>
                            <Link to="/user/menu" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-green-500 font-bold hover:text-brand-dark transition-colors uppercase tracking-wider text-xs">
                                Order Now <FaArrowRight />
                            </Link>
                        </div>
                    </div>
                </div>
            </section >
        </div >
    );
};

export default Home;
