import React from 'react';
import { Compass, Heart, MapPin, Mail, Phone, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white">WanderSmart</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Smart Travel Recommendation & Itinerary Planning Platform. Intelligent personalized
              travel plans powered by budget optimization, weather alerts, and AI curation.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Full-Stack MERN + Postgres + Redis</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/recommendations" className="hover:text-brand-400 transition">
                  Smart Recommendations
                </Link>
              </li>
              <li>
                <Link to="/destinations" className="hover:text-brand-400 transition">
                  All Destinations
                </Link>
              </li>
              <li>
                <Link to="/my-trips" className="hover:text-brand-400 transition">
                  Itinerary Planner & Trips
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-brand-400 transition">
                  Saved Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Destinations */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">
              Top Spots
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/destinations/slug/kerala" className="hover:text-brand-400 transition">
                  Kerala Backwaters & Munnar
                </Link>
              </li>
              <li>
                <Link to="/destinations/slug/goa" className="hover:text-brand-400 transition">
                  Goa Beaches & Nightlife
                </Link>
              </li>
              <li>
                <Link to="/destinations/slug/ooty" className="hover:text-brand-400 transition">
                  Ooty Lake & Tea Estates
                </Link>
              </li>
              <li>
                <Link to="/destinations/slug/manali" className="hover:text-brand-400 transition">
                  Manali Solang Valley
                </Link>
              </li>
              <li>
                <Link to="/destinations/slug/coorg" className="hover:text-brand-400 transition">
                  Coorg Coffee Hills
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">
              Contact & Help
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Bangalore & Chennai, India</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>support@wandersmart.travel</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} WanderSmart Travel Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for passionate travelers.
          </p>
        </div>
      </div>
    </footer>
  );
};
