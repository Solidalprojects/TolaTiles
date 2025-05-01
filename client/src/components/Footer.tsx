import { Link } from "react-router-dom";
import { 
  MapPin, Phone, Mail, Clock, Facebook, Twitter, 
  Instagram, Heart, ChevronRight
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
   
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Tola Tiles</h3>
            <p className="text-gray-400 text-sm">
              Premium tile solutions for residential and commercial projects.
              Quality craftsmanship and exceptional service since 2010.
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Facebook size={20} />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Twitter size={20} />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/" className="hover:text-blue-400 transition-colors flex items-center">
                  <ChevronRight size={16} className="mr-1" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-blue-400 transition-colors flex items-center">
                  <ChevronRight size={16} className="mr-1" />
                  <span>Projects</span>
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-blue-400 transition-colors flex items-center">
                  <ChevronRight size={16} className="mr-1" />
                  <span>Categories</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-blue-400 transition-colors flex items-center">
                  <ChevronRight size={16} className="mr-1" />
                  <span>Contact Us</span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start">
                <MapPin size={18} className="mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
                <span>123 Construction Way, Tileville, TX 75001</span>
              </li>
              <li className="flex items-start">
                <Phone size={18} className="mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
                <span>(555) 123-4567</span>
              </li>
              <li className="flex items-start">
                <Mail size={18} className="mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
                <span>info@tolatiles.com</span>
              </li>
            </ul>
          </div>
          
          {/* Business Hours */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Business Hours</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start">
                <Clock size={18} className="mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-1">Monday - Friday</p>
                  <p>8:00 AM - 6:00 PM</p>
                </div>
              </li>
              <li className="flex items-start">
                <Clock size={18} className="mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-1">Saturday</p>
                  <p>9:00 AM - 4:00 PM</p>
                </div>
              </li>
              <li className="flex items-start">
                <Clock size={18} className="mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-1">Sunday</p>
                  <p>Closed</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Newsletter Subscription */}
        <div className="mt-12 p-6 bg-gray-800 rounded-lg">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2 mb-4 md:mb-0">
              <h4 className="text-lg font-semibold mb-2">Subscribe to Our Newsletter</h4>
              <p className="text-gray-400 text-sm">Stay updated with our latest products and promotions.</p>
            </div>
            <div className="md:w-1/2">
              <form className="flex">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="flex-grow px-4 py-2 rounded-l-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r-md text-white transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p className="flex items-center justify-center mb-2">
            <span>&copy; {currentYear} Tola Tiles. All rights reserved.</span>
            <span className="mx-2">•</span>
            <span className="flex items-center">
              Made with <Heart size={14} className="mx-1 text-red-500" /> in Texas
            </span>
          </p>
          <div className="mt-2 flex justify-center space-x-6">
            <Link to="/privacy" className="hover:text-blue-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-blue-400 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;