'use client'

import React from 'react';
import { Smartphone } from 'lucide-react';

export default function MobilePreview({ generatedCode }) {
  if (!generatedCode) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <Smartphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Generate an app to see the preview</p>
        </div>
      </div>
    );
  }

  // Extract the main app component code
  const appCode = generatedCode.files['App.js'] || '';
  const menuScreenCode = generatedCode.files['screens/MenuScreen.js'] || '';
  const homeScreenCode = generatedCode.files['screens/HomeScreen.js'] || '';
  
  // Simple preview based on template type
  const renderPreview = () => {
    if (generatedCode.template === 'Restaurant App') {
      return renderRestaurantPreview();
    } else if (generatedCode.template === 'Business/Service App') {
      return renderBusinessPreview();
    }
    return renderDefaultPreview();
  };

  const renderRestaurantPreview = () => {
    const { primaryColor, secondaryColor, businessName } = generatedCode.customizations;
    
    return (
      <div className="h-full bg-white">
        {/* Header */}
        <div style={{ backgroundColor: primaryColor }} className="p-4 text-white">
          <h1 className="text-xl font-semibold text-center">{businessName}</h1>
        </div>
        
        {/* Menu Items */}
        <div className="p-4">
          <h2 className="text-lg font-bold mb-4" style={{ color: primaryColor }}>Our Menu</h2>
          
          {[
            { name: 'Margherita Pizza', price: 12.99, description: 'Fresh tomatoes, mozzarella, basil' },
            { name: 'Caesar Salad', price: 8.99, description: 'Romaine lettuce, parmesan, croutons' },
            { name: 'Pasta Carbonara', price: 14.99, description: 'Egg, bacon, parmesan, black pepper' },
          ].map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                <span className="font-semibold" style={{ color: primaryColor }}>${item.price}</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{item.description}</p>
              <button 
                className="w-full py-2 rounded text-white text-sm font-medium"
                style={{ backgroundColor: primaryColor }}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
        
        {/* Cart Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
          <button 
            className="w-full py-3 rounded text-white font-medium"
            style={{ backgroundColor: secondaryColor }}
          >
            View Cart (0)
          </button>
        </div>
      </div>
    );
  };

  const renderBusinessPreview = () => {
    const { primaryColor, backgroundColor, businessName } = generatedCode.customizations;
    
    return (
      <div className="h-full" style={{ backgroundColor }}>
        {/* Hero Section */}
        <div style={{ backgroundColor: primaryColor }} className="p-6 text-white text-center">
          <h1 className="text-2xl font-bold mb-2">{businessName}</h1>
          <p className="text-sm opacity-90">Your trusted service provider</p>
        </div>
        
        {/* About Section */}
        <div className="p-4">
          <h2 className="text-lg font-bold mb-3" style={{ color: primaryColor }}>About Us</h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            We provide excellent service with over 10 years of experience. 
            Our team is dedicated to delivering quality results for all our clients.
          </p>
          
          <h2 className="text-lg font-bold mb-3" style={{ color: primaryColor }}>Why Choose Us?</h2>
          <div className="space-y-2">
            {[
              '✓ Professional and reliable',
              '✓ Competitive pricing',
              '✓ 24/7 customer support',
              '✓ 100% satisfaction guarantee'
            ].map((feature, index) => (
              <p key={index} className="text-sm text-gray-700">{feature}</p>
            ))}
          </div>
        </div>
        
        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex">
          <button className="flex-1 py-3 text-center text-sm" style={{ color: primaryColor }}>
            Home
          </button>
          <button className="flex-1 py-3 text-center text-sm text-gray-500">
            Services
          </button>
          <button className="flex-1 py-3 text-center text-sm text-gray-500">
            Contact
          </button>
        </div>
      </div>
    );
  };

  const renderDefaultPreview = () => {
    const { primaryColor, businessName } = generatedCode.customizations;
    
    return (
      <div className="h-full bg-white p-4">
        <div className="text-center">
          <Smartphone className="w-16 h-16 mx-auto mb-4" style={{ color: primaryColor }} />
          <h2 className="text-xl font-bold mb-2">{businessName}</h2>
          <p className="text-gray-600 mb-4">{generatedCode.template}</p>
          
          <div className="text-left bg-gray-50 rounded p-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Features:</p>
            {generatedCode.features.map((feature, i) => (
              <p key={i} className="text-sm text-gray-600 mb-1">• {feature}</p>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex pt-24 items-center justify-center p-8 bg-gray-100">
      <div className="relative bg-black rounded-[2.5rem] p-3 shadow-2xl" style={{ width: '375px', height: '667px' }}>
        {/* Phone Frame */}
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-20 h-6 bg-black rounded-full"></div>
        
        {/* Screen */}
        <div className="bg-white rounded-[2rem] overflow-hidden h-full relative">
          {/* Status Bar */}
          <div className="bg-black text-white text-xs px-6 py-1 flex justify-between items-center">
            <span>9:41</span>
            <div className="flex gap-1">
              <span>📶</span>
              <span>📶</span>
              <span>🔋</span>
            </div>
          </div>
          
          {/* App Content */}
          <div className="h-full overflow-y-auto">
            {renderPreview()}
          </div>
        </div>
      </div>
    </div>
  );
} 