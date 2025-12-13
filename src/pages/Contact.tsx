import React from 'react';
import { FaPhoneAlt, FaMapMarkerAlt, FaEnvelope, FaInstagram, FaFacebook, FaTwitter } from 'react-icons/fa';

const Contact: React.FC = () => {
    return (
        <div className="bg-gray-50 min-h-screen py-12 animate-fade-in">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Contact <span className="text-brand-red">Us</span></h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        We'd love to hear from you. Reach out to us for orders, reservations, or feedback.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {/* Phone */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg text-center hover:-translate-y-1 transition-transform duration-300">
                        <div className="w-16 h-16 bg-brand-red/10 text-brand-red rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaPhoneAlt size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-4">Call Us</h3>
                        <p className="text-gray-600 mb-2">For immediate assistance</p>
                        <div className="flex flex-col gap-1 font-medium text-brand-dark">
                            <a href="tel:0303980021" className="hover:text-brand-red">0303980021</a>
                            <a href="tel:0545022181" className="hover:text-brand-red">0545022181</a>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg text-center hover:-translate-y-1 transition-transform duration-300">
                        <div className="w-16 h-16 bg-brand-yellow/10 text-brand-yellow rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaMapMarkerAlt size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-4">Visit Us</h3>
                        <p className="text-gray-600 mb-2">Come dine with us</p>
                        <p className="font-medium text-brand-dark">
                            24th Goddies Street<br />
                            Akyem Asafo, Ghana
                        </p>
                    </div>

                    {/* Social */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg text-center hover:-translate-y-1 transition-transform duration-300">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaEnvelope size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-4">Connect</h3>
                        <p className="text-gray-600 mb-4">Follow us on social media</p>
                        <div className="flex justify-center gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-brand-red hover:text-white transition-colors">
                                <FaInstagram />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition-colors">
                                <FaFacebook />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-400 hover:text-white transition-colors">
                                <FaTwitter />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Map Section */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-[400px] relative">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3969.456789012345!2d-0.456789!3d6.123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf9084b2b7a773%3A0x40611d6175555555!2sAkyem%20Asafo!5e0!3m2!1sen!2sgh!4v1620000000000!5m2!1sen!2sgh"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Goddies Lounge Location"
                    ></iframe>
                    {/* Overlay for demo purposes since the coordinates are approximate */}
                    <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg max-w-xs">
                        <h4 className="font-bold text-brand-dark">Goddies Lounge & Wine Bar</h4>
                        <p className="text-sm text-gray-600">24th Goddies Street, Akyem Asafo</p>
                        <a
                            href="https://maps.google.com/?q=Akyem+Asafo"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-brand-red font-bold mt-2 inline-block hover:underline"
                        >
                            Get Directions
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
