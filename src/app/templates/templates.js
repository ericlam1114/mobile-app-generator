export const templates = {
    restaurant: {
      name: 'Restaurant App',
      features: ['Menu Display', 'Ordering System', 'User Authentication', 'Cart Management'],
      files: {
        'App.js': `import React from 'react';
  import { NavigationContainer } from '@react-navigation/native';
  import { createStackNavigator } from '@react-navigation/stack';
  import { CartProvider } from './context/CartContext';
  import MenuScreen from './screens/MenuScreen';
  import OrderScreen from './screens/OrderScreen';
  import CartScreen from './screens/CartScreen';
  
  const Stack = createStackNavigator();
  
  export default function App() {
    return (
      <CartProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Menu">
            <Stack.Screen 
              name="Menu" 
              component={MenuScreen} 
              options={{ title: 'BUSINESS_NAME' }}
            />
            <Stack.Screen name="Order" component={OrderScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    );
  }`,
        'context/CartContext.js': `import React, { createContext, useContext, useState } from 'react';
  
  const CartContext = createContext();
  
  export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
      throw new Error('useCart must be used within a CartProvider');
    }
    return context;
  };
  
  export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
  
    const addToCart = (item) => {
      setCart(prevCart => {
        const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
        if (existingItem) {
          return prevCart.map(cartItem =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          );
        }
        return [...prevCart, { ...item, quantity: 1 }];
      });
    };
  
    const removeFromCart = (itemId) => {
      setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    };
  
    const updateQuantity = (itemId, quantity) => {
      if (quantity <= 0) {
        removeFromCart(itemId);
        return;
      }
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    };
  
    const getTotalPrice = () => {
      return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };
  
    const getItemCount = () => {
      return cart.reduce((count, item) => count + item.quantity, 0);
    };
  
    const clearCart = () => {
      setCart([]);
    };
  
    return (
      <CartContext.Provider value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        getTotalPrice,
        getItemCount,
        clearCart
      }}>
        {children}
      </CartContext.Provider>
    );
  };`,
        'screens/MenuScreen.js': `import React from 'react';
  import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
  import { useCart } from '../context/CartContext';
  
  const menuItems = [
    { id: 1, name: 'Margherita Pizza', price: 12.99, description: 'Fresh tomatoes, mozzarella, basil' },
    { id: 2, name: 'Caesar Salad', price: 8.99, description: 'Romaine lettuce, parmesan, croutons' },
    { id: 3, name: 'Pasta Carbonara', price: 14.99, description: 'Egg, bacon, parmesan, black pepper' },
    { id: 4, name: 'Chicken Wings', price: 11.99, description: 'Buffalo or BBQ sauce, celery sticks' },
    { id: 5, name: 'Fish Tacos', price: 13.99, description: 'Grilled fish, cabbage slaw, lime' },
  ];
  
  export default function MenuScreen({ navigation }) {
    const { addToCart, getItemCount } = useCart();
  
    const handleAddToCart = (item) => {
      addToCart(item);
      Alert.alert('Added to Cart', \`\${item.name} has been added to your cart!\`);
    };
  
    const renderMenuItem = ({ item }) => (
      <View style={styles.menuItem}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>$\${item.price.toFixed(2)}</Text>
        </View>
        <Text style={styles.itemDescription}>{item.description}</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => handleAddToCart(item)}
        >
          <Text style={styles.addButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    );
  
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Our Menu</Text>
        <FlatList
          data={menuItems}
          renderItem={renderMenuItem}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
        />
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={styles.cartButtonText}>
            View Cart ({getItemCount()})
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'THEME_BACKGROUND',
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'THEME_PRIMARY',
      marginBottom: 20,
      textAlign: 'center',
    },
    menuItem: {
      backgroundColor: 'white',
      padding: 16,
      marginBottom: 12,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    itemName: {
      fontSize: 18,
      fontWeight: '600',
      color: '#333',
      flex: 1,
    },
    itemPrice: {
      fontSize: 16,
      color: 'THEME_PRIMARY',
      fontWeight: '600',
    },
    itemDescription: {
      fontSize: 14,
      color: '#666',
      marginBottom: 12,
      lineHeight: 20,
    },
    addButton: {
      backgroundColor: 'THEME_PRIMARY',
      padding: 12,
      borderRadius: 6,
      marginTop: 8,
    },
    addButtonText: {
      color: 'white',
      textAlign: 'center',
      fontWeight: '600',
    },
    cartButton: {
      backgroundColor: 'THEME_SECONDARY',
      padding: 16,
      borderRadius: 8,
      marginTop: 16,
    },
    cartButtonText: {
      color: 'white',
      textAlign: 'center',
      fontSize: 16,
      fontWeight: '600',
    },
  });`,
        'screens/CartScreen.js': `import React from 'react';
  import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
  import { useCart } from '../context/CartContext';
  
  export default function CartScreen({ navigation }) {
    const { cart, getTotalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  
    const handleCheckout = () => {
      if (cart.length === 0) {
        Alert.alert('Empty Cart', 'Please add items to your cart before checkout.');
        return;
      }
      Alert.alert(
        'Order Placed!',
        \`Your order total is $\${getTotalPrice().toFixed(2)}. Thank you for your order!\`,
        [
          { text: 'OK', onPress: () => {
            clearCart();
            navigation.navigate('Menu');
          }}
        ]
      );
    };
  
    const renderCartItem = ({ item }) => (
      <View style={styles.cartItem}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>\${item.price.toFixed(2)} each</Text>
        </View>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeFromCart(item.id)}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    );
  
    if (cart.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.title}>Your Cart</Text>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      );
    }
  
    return (
      <View style={styles.container}>
        <FlatList
          data={cart}
          renderItem={renderCartItem}
          keyExtractor={item => item.id.toString()}
          style={styles.cartList}
        />
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>
            Total: \${getTotalPrice().toFixed(2)}
          </Text>
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutButtonText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'THEME_BACKGROUND',
    },
    emptyContainer: {
      flex: 1,
      backgroundColor: 'THEME_BACKGROUND',
      padding: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'THEME_PRIMARY',
      marginBottom: 20,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: '#666',
      marginBottom: 30,
      textAlign: 'center',
    },
    cartList: {
      flex: 1,
      padding: 16,
    },
    cartItem: {
      backgroundColor: 'white',
      padding: 16,
      marginBottom: 12,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    itemInfo: {
      marginBottom: 12,
    },
    itemName: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
    },
    itemPrice: {
      fontSize: 14,
      color: '#666',
      marginTop: 4,
    },
    quantityControls: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    quantityButton: {
      backgroundColor: 'THEME_PRIMARY',
      width: 30,
      height: 30,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
    },
    quantityButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    quantity: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
      marginHorizontal: 16,
    },
    removeButton: {
      backgroundColor: '#FF3B30',
      padding: 8,
      borderRadius: 4,
      alignSelf: 'flex-start',
    },
    removeButtonText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600',
    },
    totalContainer: {
      backgroundColor: 'white',
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: '#eee',
    },
    totalText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#333',
      textAlign: 'center',
      marginBottom: 16,
    },
    checkoutButton: {
      backgroundColor: 'THEME_PRIMARY',
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    checkoutButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    backButton: {
      backgroundColor: 'THEME_PRIMARY',
      padding: 16,
      borderRadius: 8,
    },
    backButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
  });`,
        'package.json': `{
    "name": "BUSINESS_NAMEApp",
    "version": "1.0.0",
    "main": "node_modules/expo/AppEntry.js",
    "scripts": {
      "start": "expo start",
      "android": "expo start --android",
      "ios": "expo start --ios",
      "web": "expo start --web"
    },
    "dependencies": {
      "expo": "~49.0.0",
      "react": "18.2.0",
      "react-native": "0.72.6",
      "@react-navigation/native": "^6.0.0",
      "@react-navigation/stack": "^6.0.0",
      "react-native-screens": "~3.22.0",
      "react-native-safe-area-context": "4.6.3"
    },
    "devDependencies": {
      "@babel/core": "^7.20.0"
    }
  }`,
        'README.md': `# BUSINESS_NAME Mobile App
  
  ## Setup Instructions
  
  1. Install Node.js and npm
  2. Install Expo CLI: \`npm install -g expo-cli\`
  3. Run \`npm install\` in this directory
  4. Run \`expo start\` to launch the development server
  5. Use Expo Go app on your phone to scan the QR code
  
  ## Features
  
  - Menu display with items and prices
  - Add to cart functionality
  - Order management
  - Clean, modern UI
  
  ## Customization
  
  - Colors are defined in styles with THEME_ prefixes
  - Replace THEME_PRIMARY and THEME_SECONDARY with your brand colors
  - Add your menu items in MenuScreen.js
  - Customize styling in each screen file
  
  ## Next Steps
  
  1. Replace THEME_PRIMARY with your brand color (e.g., '#FF6B35')
  2. Replace THEME_SECONDARY with your secondary color
  3. Replace THEME_BACKGROUND with your background color
  4. Update menu items in screens/MenuScreen.js
  5. Add your business information
  `
      }
    },
    business: {
      name: 'Business/Service App',
      features: ['About Us', 'Services', 'Contact', 'Booking'],
      files: {
        'App.js': `import React from 'react';
  import { NavigationContainer } from '@react-navigation/native';
  import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
  import HomeScreen from './screens/HomeScreen';
  import ServicesScreen from './screens/ServicesScreen';
  import ContactScreen from './screens/ContactScreen';
  
  const Tab = createBottomTabNavigator();
  
  export default function App() {
    return (
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Services" component={ServicesScreen} />
          <Tab.Screen name="Contact" component={ContactScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    );
  }`,
        'screens/HomeScreen.js': `import React from 'react';
  import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
  
  export default function HomeScreen() {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.title}>BUSINESS_NAME</Text>
          <Text style={styles.subtitle}>Your trusted service provider</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Us</Text>
          <Text style={styles.description}>
            We provide excellent service with over 10 years of experience. 
            Our team is dedicated to delivering quality results for all our clients.
          </Text>
        </View>
  
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose Us?</Text>
          <Text style={styles.feature}>✓ Professional and reliable</Text>
          <Text style={styles.feature}>✓ Competitive pricing</Text>
          <Text style={styles.feature}>✓ 24/7 customer support</Text>
          <Text style={styles.feature}>✓ 100% satisfaction guarantee</Text>
        </View>
      </ScrollView>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'THEME_BACKGROUND',
    },
    hero: {
      padding: 24,
      backgroundColor: 'THEME_PRIMARY',
      alignItems: 'center',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: 'white',
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: 'white',
      marginTop: 8,
      textAlign: 'center',
    },
    section: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'THEME_PRIMARY',
      marginBottom: 12,
    },
    description: {
      fontSize: 16,
      lineHeight: 24,
      color: '#333',
    },
    feature: {
      fontSize: 16,
      color: '#333',
      marginBottom: 8,
      paddingLeft: 8,
    },
  });`,
        'screens/ServicesScreen.js': `import React from 'react';
  import { View, Text, ScrollView, StyleSheet } from 'react-native';
  
  const services = [
    { name: 'Consultation', price: '$100/hr', description: 'Professional consultation services' },
    { name: 'Implementation', price: '$150/hr', description: 'Full service implementation' },
    { name: 'Support', price: '$75/hr', description: 'Ongoing support and maintenance' },
  ];
  
  export default function ServicesScreen() {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Our Services</Text>
        {services.map((service, index) => (
          <View key={index} style={styles.serviceCard}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.servicePrice}>{service.price}</Text>
            <Text style={styles.serviceDescription}>{service.description}</Text>
          </View>
        ))}
      </ScrollView>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'THEME_BACKGROUND',
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'THEME_PRIMARY',
      marginBottom: 20,
      textAlign: 'center',
    },
    serviceCard: {
      backgroundColor: 'white',
      padding: 16,
      marginBottom: 12,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    serviceName: {
      fontSize: 18,
      fontWeight: '600',
      color: '#333',
    },
    servicePrice: {
      fontSize: 16,
      color: 'THEME_PRIMARY',
      marginTop: 4,
      fontWeight: '600',
    },
    serviceDescription: {
      fontSize: 14,
      color: '#666',
      marginTop: 8,
    },
  });`,
        'screens/ContactScreen.js': `import React, { useState } from 'react';
  import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
  
  export default function ContactScreen() {
    const [form, setForm] = useState({
      name: '',
      email: '',
      message: ''
    });
  
    const handleSubmit = () => {
      if (!form.name || !form.email || !form.message) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }
      
      Alert.alert('Success', 'Thank you for your message! We will get back to you soon.');
      setForm({ name: '', email: '', message: '' });
    };
  
    const handleCall = () => {
      Linking.openURL('tel:+1234567890');
    };
  
    const handleEmail = () => {
      Linking.openURL('mailto:info@BUSINESS_NAME.com');
    };
  
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Contact Us</Text>
        
        <View style={styles.contactInfo}>
          <Text style={styles.sectionTitle}>Get in Touch</Text>
          <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
            <Text style={styles.contactLabel}>Phone:</Text>
            <Text style={styles.contactValue}>(123) 456-7890</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
            <Text style={styles.contactLabel}>Email:</Text>
            <Text style={styles.contactValue}>info@BUSINESS_NAME.com</Text>
          </TouchableOpacity>
          <View style={styles.contactItem}>
            <Text style={styles.contactLabel}>Address:</Text>
            <Text style={styles.contactValue}>123 Business St, City, State 12345</Text>
          </View>
        </View>
        
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Send us a Message</Text>
          <TextInput
            style={styles.input}
            placeholder="Your Name"
            value={form.name}
            onChangeText={(text) => setForm({...form, name: text})}
          />
          <TextInput
            style={styles.input}
            placeholder="Your Email"
            value={form.email}
            onChangeText={(text) => setForm({...form, email: text})}
            keyboardType="email-address"
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Your Message"
            value={form.message}
            onChangeText={(text) => setForm({...form, message: text})}
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Send Message</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'THEME_BACKGROUND',
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'THEME_PRIMARY',
      marginBottom: 20,
      textAlign: 'center',
    },
    contactInfo: {
      backgroundColor: 'white',
      padding: 16,
      marginBottom: 20,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#333',
      marginBottom: 16,
    },
    contactItem: {
      flexDirection: 'row',
      marginBottom: 12,
      alignItems: 'center',
    },
    contactLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: '#666',
      width: 70,
    },
    contactValue: {
      fontSize: 16,
      color: 'THEME_PRIMARY',
      flex: 1,
    },
    form: {
      backgroundColor: 'white',
      padding: 16,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      fontSize: 16,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    submitButton: {
      backgroundColor: 'THEME_PRIMARY',
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    submitButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
  });`,
        'package.json': `{
    "name": "BUSINESS_NAMEApp",
    "version": "1.0.0",
    "main": "node_modules/expo/AppEntry.js",
    "scripts": {
      "start": "expo start",
      "android": "expo start --android",
      "ios": "expo start --ios",
      "web": "expo start --web"
    },
    "dependencies": {
      "expo": "~49.0.0",
      "react": "18.2.0",
      "react-native": "0.72.6",
      "@react-navigation/native": "^6.0.0",
      "@react-navigation/bottom-tabs": "^6.0.0",
      "react-native-screens": "~3.22.0",
      "react-native-safe-area-context": "4.6.3"
    },
    "devDependencies": {
      "@babel/core": "^7.20.0"
    }
  }`,
        'README.md': `# BUSINESS_NAME Mobile App
  
  ## Setup Instructions
  
  1. Install Node.js and npm
  2. Install Expo CLI: \`npm install -g expo-cli\`
  3. Run \`npm install\` in this directory
  4. Run \`expo start\` to launch the development server
  5. Use Expo Go app on your phone to scan the QR code
  
  ## Features
  
  - Business information and about section
  - Services listing with pricing
  - Contact form and information
  - Professional, clean design
  
  ## Customization
  
  - Colors are defined in styles with THEME_ prefixes
  - Replace THEME_PRIMARY and THEME_SECONDARY with your brand colors
  - Update business information in all screens
  - Add your services in ServicesScreen.js
  - Update contact information in ContactScreen.js
  
  ## Next Steps
  
  1. Replace THEME_PRIMARY with your brand color (e.g., '#2196F3')
  2. Replace THEME_SECONDARY with your secondary color
  3. Replace THEME_BACKGROUND with your background color
  4. Update business information across all screens
  5. Add your actual services and pricing
  6. Update contact information with your details
  `
      }
    },
    ecommerce: {
      name: 'E-commerce Store',
      features: ['Product Catalog', 'Shopping Cart', 'Search & Filter', 'User Authentication', 'Order History'],
      files: {
        'App.js': `import React from 'react';
  import { NavigationContainer } from '@react-navigation/native';
  import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
  import { CartProvider } from './context/CartContext';
  import { AuthProvider } from './context/AuthContext';
  import HomeScreen from './screens/HomeScreen';
  import ProductsScreen from './screens/ProductsScreen';
  import CartScreen from './screens/CartScreen';
  import ProfileScreen from './screens/ProfileScreen';
  
  const Tab = createBottomTabNavigator();
  
  export default function App() {
    return (
      <AuthProvider>
        <CartProvider>
          <NavigationContainer>
            <Tab.Navigator>
              <Tab.Screen name="Home" component={HomeScreen} />
              <Tab.Screen name="Products" component={ProductsScreen} />
              <Tab.Screen name="Cart" component={CartScreen} />
              <Tab.Screen name="Profile" component={ProfileScreen} />
            </Tab.Navigator>
          </NavigationContainer>
        </CartProvider>
      </AuthProvider>
    );
  }`,
        'context/CartContext.js': `import React, { createContext, useContext, useState } from 'react';
  
  const CartContext = createContext();
  
  export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
      throw new Error('useCart must be used within a CartProvider');
    }
    return context;
  };
  
  export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
  
    const addToCart = (product) => {
      setCart(prevCart => {
        const existingItem = prevCart.find(item => item.id === product.id);
        if (existingItem) {
          return prevCart.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prevCart, { ...product, quantity: 1 }];
      });
    };
  
    const removeFromCart = (productId) => {
      setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };
  
    const updateQuantity = (productId, quantity) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    };
  
    const getTotalPrice = () => {
      return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };
  
    const getItemCount = () => {
      return cart.reduce((count, item) => count + item.quantity, 0);
    };
  
    const clearCart = () => {
      setCart([]);
    };
  
    return (
      <CartContext.Provider value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        getTotalPrice,
        getItemCount,
        clearCart
      }}>
        {children}
      </CartContext.Provider>
    );
  };`,
        'context/AuthContext.js': `import React, { createContext, useContext, useState } from 'react';
  
  const AuthContext = createContext();
  
  export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  };
  
  export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
  
    const login = async (email, password) => {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setUser({ id: 1, email, name: 'User' });
        setIsLoading(false);
      }, 1000);
    };
  
    const logout = () => {
      setUser(null);
    };
  
    const register = async (email, password, name) => {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setUser({ id: 1, email, name });
        setIsLoading(false);
      }, 1000);
    };
  
    return (
      <AuthContext.Provider value={{
        user,
        isLoading,
        login,
        logout,
        register
      }}>
        {children}
      </AuthContext.Provider>
    );
  };`,
        'screens/HomeScreen.js': `import React from 'react';
  import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
  import { useNavigation } from '@react-navigation/native';
  
  const featuredProducts = [
    { id: 1, name: 'Featured Item 1', price: 29.99, image: 'product1.jpg' },
    { id: 2, name: 'Featured Item 2', price: 39.99, image: 'product2.jpg' },
    { id: 3, name: 'Featured Item 3', price: 19.99, image: 'product3.jpg' },
  ];
  
  export default function HomeScreen() {
    const navigation = useNavigation();
  
    return (
      <ScrollView style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Welcome to BUSINESS_NAME</Text>
          <Text style={styles.heroSubtitle}>Discover amazing products at great prices</Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => navigation.navigate('Products')}
          >
            <Text style={styles.shopButtonText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {featuredProducts.map(product => (
              <View key={product.id} style={styles.productCard}>
                <View style={styles.productImage} />
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPrice}>$\{product.price}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesGrid}>
            {['Electronics', 'Clothing', 'Home', 'Sports'].map(category => (
              <TouchableOpacity key={category} style={styles.categoryCard}>
                <Text style={styles.categoryName}>{category}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'THEME_BACKGROUND',
    },
    hero: {
      backgroundColor: 'THEME_PRIMARY',
      padding: 24,
      alignItems: 'center',
    },
    heroTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
      textAlign: 'center',
      marginBottom: 8,
    },
    heroSubtitle: {
      fontSize: 16,
      color: 'white',
      textAlign: 'center',
      marginBottom: 20,
    },
    shopButton: {
      backgroundColor: 'white',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    shopButtonText: {
      color: 'THEME_PRIMARY',
      fontWeight: '600',
      fontSize: 16,
    },
    section: {
      padding: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 16,
    },
    productCard: {
      backgroundColor: 'white',
      borderRadius: 8,
      padding: 12,
      marginRight: 12,
      width: 150,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    productImage: {
      height: 100,
      backgroundColor: '#f0f0f0',
      borderRadius: 8,
      marginBottom: 8,
    },
    productName: {
      fontSize: 14,
      fontWeight: '600',
      color: '#333',
      marginBottom: 4,
    },
    productPrice: {
      fontSize: 16,
      fontWeight: 'bold',
      color: 'THEME_PRIMARY',
    },
    categoriesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    categoryCard: {
      backgroundColor: 'white',
      borderRadius: 8,
      padding: 20,
      width: '48%',
      marginBottom: 12,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    categoryName: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
    },
  });`,
        'screens/ProductsScreen.js': `import React, { useState } from 'react';
  import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
  import { useCart } from '../context/CartContext';
  
  const products = [
    { id: 1, name: 'Wireless Headphones', price: 99.99, category: 'Electronics', description: 'High-quality wireless headphones' },
    { id: 2, name: 'Smartphone Case', price: 19.99, category: 'Electronics', description: 'Protective case for your phone' },
    { id: 3, name: 'Cotton T-Shirt', price: 24.99, category: 'Clothing', description: 'Comfortable cotton t-shirt' },
    { id: 4, name: 'Running Shoes', price: 89.99, category: 'Sports', description: 'Lightweight running shoes' },
    { id: 5, name: 'Coffee Mug', price: 12.99, category: 'Home', description: 'Ceramic coffee mug' },
    { id: 6, name: 'Yoga Mat', price: 34.99, category: 'Sports', description: 'Non-slip yoga mat' },
  ];
  
  export default function ProductsScreen() {
    const { addToCart } = useCart();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
  
    const categories = ['All', 'Electronics', 'Clothing', 'Home', 'Sports'];
  
    const filteredProducts = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  
    const handleAddToCart = (product) => {
      addToCart(product);
      Alert.alert('Added to Cart', \`\${product.name} has been added to your cart!\`);
    };
  
    const renderProduct = ({ item }) => (
      <View style={styles.productCard}>
        <View style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productDescription}>{item.description}</Text>
          <Text style={styles.productCategory}>{item.category}</Text>
          <View style={styles.productFooter}>
            <Text style={styles.productPrice}>$\{item.price}</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddToCart(item)}
            >
              <Text style={styles.addButtonText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
        
        <View style={styles.categoriesContainer}>
          <FlatList
            horizontal
            data={categories}
            keyExtractor={item => item}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  selectedCategory === item && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === item && styles.categoryButtonTextActive
                ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
        
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.productsList}
        />
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'THEME_BACKGROUND',
    },
    header: {
      padding: 16,
      backgroundColor: 'white',
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    searchInput: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
    },
    categoriesContainer: {
      backgroundColor: 'white',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    categoryButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginHorizontal: 4,
      borderRadius: 20,
      backgroundColor: '#f0f0f0',
    },
    categoryButtonActive: {
      backgroundColor: 'THEME_PRIMARY',
    },
    categoryButtonText: {
      fontSize: 14,
      color: '#666',
    },
    categoryButtonTextActive: {
      color: 'white',
      fontWeight: '600',
    },
    productsList: {
      padding: 8,
    },
    row: {
      justifyContent: 'space-around',
    },
    productCard: {
      backgroundColor: 'white',
      borderRadius: 8,
      margin: 8,
      padding: 12,
      width: '45%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    productImage: {
      height: 120,
      backgroundColor: '#f0f0f0',
      borderRadius: 8,
      marginBottom: 8,
    },
    productInfo: {
      flex: 1,
    },
    productName: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
      marginBottom: 4,
    },
    productDescription: {
      fontSize: 12,
      color: '#666',
      marginBottom: 4,
    },
    productCategory: {
      fontSize: 10,
      color: 'THEME_PRIMARY',
      marginBottom: 8,
      fontWeight: '500',
    },
    productFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    productPrice: {
      fontSize: 16,
      fontWeight: 'bold',
      color: 'THEME_PRIMARY',
    },
    addButton: {
      backgroundColor: 'THEME_PRIMARY',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    addButtonText: {
      color: 'white',
      fontSize: 10,
      fontWeight: '600',
    },
  });`,
        'screens/CartScreen.js': `import React from 'react';
  import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
  import { useCart } from '../context/CartContext';
  
  export default function CartScreen({ navigation }) {
    const { cart, getTotalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  
    const handleCheckout = () => {
      if (cart.length === 0) {
        Alert.alert('Empty Cart', 'Please add items to your cart before checkout.');
        return;
      }
      Alert.alert(
        'Order Placed!',
        \`Your order total is $\${getTotalPrice().toFixed(2)}. Thank you for your order!\`,
        [
          { text: 'OK', onPress: () => {
            clearCart();
            navigation.navigate('Home');
          }}
        ]
      );
    };
  
    const renderCartItem = ({ item }) => (
      <View style={styles.cartItem}>
        <View style={styles.productImage} />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>$\{item.price.toFixed(2)} each</Text>
          <Text style={styles.itemTotal}>Total: $\{(item.price * item.quantity).toFixed(2)}</Text>
        </View>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeFromCart(item.id)}
        >
          <Text style={styles.removeButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    );
  
    if (cart.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.title}>Your Cart</Text>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => navigation.navigate('Products')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      );
    }
  
    return (
      <View style={styles.container}>
        <FlatList
          data={cart}
          renderItem={renderCartItem}
          keyExtractor={item => item.id.toString()}
          style={styles.cartList}
        />
        <View style={styles.totalContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>$\{getTotalPrice().toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Shipping:</Text>
            <Text style={styles.totalValue}>Free</Text>
          </View>
          <View style={[styles.totalRow, styles.finalTotal]}>
            <Text style={styles.finalTotalLabel}>Total:</Text>
            <Text style={styles.finalTotalValue}>$\{getTotalPrice().toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'THEME_BACKGROUND',
    },
    emptyContainer: {
      flex: 1,
      backgroundColor: 'THEME_BACKGROUND',
      padding: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'THEME_PRIMARY',
      marginBottom: 20,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: '#666',
      marginBottom: 30,
      textAlign: 'center',
    },
    shopButton: {
      backgroundColor: 'THEME_PRIMARY',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    shopButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    cartList: {
      flex: 1,
      padding: 16,
    },
    cartItem: {
      backgroundColor: 'white',
      padding: 16,
      marginBottom: 12,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    productImage: {
      width: 60,
      height: 60,
      backgroundColor: '#f0f0f0',
      borderRadius: 8,
      marginRight: 12,
    },
    itemInfo: {
      flex: 1,
    },
    itemName: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
      marginBottom: 4,
    },
    itemPrice: {
      fontSize: 14,
      color: '#666',
      marginBottom: 2,
    },
    itemTotal: {
      fontSize: 14,
      color: 'THEME_PRIMARY',
      fontWeight: '600',
    },
    quantityControls: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 12,
    },
    quantityButton: {
      backgroundColor: 'THEME_PRIMARY',
      width: 30,
      height: 30,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
    },
    quantityButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    quantity: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
      marginHorizontal: 12,
      minWidth: 20,
      textAlign: 'center',
    },
    removeButton: {
      backgroundColor: '#FF3B30',
      width: 30,
      height: 30,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
    },
    removeButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: '600',
    },
    totalContainer: {
      backgroundColor: 'white',
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: '#eee',
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    totalLabel: {
      fontSize: 16,
      color: '#333',
    },
    totalValue: {
      fontSize: 16,
      color: '#333',
    },
    finalTotal: {
      borderTopWidth: 1,
      borderTopColor: '#eee',
      paddingTop: 12,
      marginTop: 8,
      marginBottom: 16,
    },
    finalTotalLabel: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
    },
    finalTotalValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'THEME_PRIMARY',
    },
    checkoutButton: {
      backgroundColor: 'THEME_PRIMARY',
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    checkoutButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
  });`,
        'screens/ProfileScreen.js': `import React from 'react';
  import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
  import { useAuth } from '../context/AuthContext';
  
  export default function ProfileScreen() {
    const { user, logout } = useAuth();
  
    const handleLogout = () => {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Logout', onPress: logout, style: 'destructive' }
        ]
      );
    };
  
    if (!user) {
      return (
        <View style={styles.container}>
          <View style={styles.loginPrompt}>
            <Text style={styles.title}>Welcome to BUSINESS_NAME</Text>
            <Text style={styles.subtitle}>Please login to access your account</Text>
            <TouchableOpacity style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Login / Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatar} />
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Order History</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Addresses</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Payment Methods</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Notifications</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Privacy Settings</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Help Center</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Contact Us</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'THEME_BACKGROUND',
    },
    loginPrompt: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'THEME_PRIMARY',
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: '#666',
      marginBottom: 24,
      textAlign: 'center',
    },
    loginButton: {
      backgroundColor: 'THEME_PRIMARY',
      paddingHorizontal: 32,
      paddingVertical: 12,
      borderRadius: 8,
    },
    loginButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    header: {
      backgroundColor: 'white',
      padding: 24,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'THEME_PRIMARY',
      marginBottom: 16,
    },
    userName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 16,
      color: '#666',
    },
    section: {
      backgroundColor: 'white',
      marginTop: 12,
      paddingVertical: 8,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: '#f8f8f8',
    },
    menuItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    menuItemText: {
      fontSize: 16,
      color: '#333',
    },
    menuItemArrow: {
      fontSize: 20,
      color: '#ccc',
    },
    logoutButton: {
      backgroundColor: '#FF3B30',
      margin: 20,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    logoutButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
  });`,
        'package.json': `{
    "name": "BUSINESS_NAMEApp",
    "version": "1.0.0",
    "main": "node_modules/expo/AppEntry.js",
    "scripts": {
      "start": "expo start",
      "android": "expo start --android",
      "ios": "expo start --ios",
      "web": "expo start --web"
    },
    "dependencies": {
      "expo": "~49.0.0",
      "react": "18.2.0",
      "react-native": "0.72.6",
      "@react-navigation/native": "^6.0.0",
      "@react-navigation/bottom-tabs": "^6.0.0",
      "react-native-screens": "~3.22.0",
      "react-native-safe-area-context": "4.6.3"
    },
    "devDependencies": {
      "@babel/core": "^7.20.0"
    }
  }`,
        'README.md': `# BUSINESS_NAME E-commerce App
  
  ## Setup Instructions
  
  1. Install Node.js and npm
  2. Install Expo CLI: \`npm install -g expo-cli\`
  3. Run \`npm install\` in this directory
  4. Run \`expo start\` to launch the development server
  5. Use Expo Go app on your phone to scan the QR code
  
  ## Features
  
  - Product catalog with categories and search
  - Shopping cart with quantity management
  - User authentication system
  - Order checkout process
  - User profile and account management
  
  ## Customization
  
  - Colors are defined in styles with THEME_ prefixes
  - Replace THEME_PRIMARY and THEME_SECONDARY with your brand colors
  - Update product data in ProductsScreen.js
  - Customize categories in HomeScreen.js
  - Add your business information throughout
  
  ## Next Steps
  
  1. Replace THEME_PRIMARY with your brand color (e.g., '#E91E63')
  2. Replace THEME_SECONDARY with your secondary color
  3. Replace THEME_BACKGROUND with your background color
  4. Update product catalog with your actual products
  5. Integrate with a real backend API
  6. Add payment processing integration
  7. Implement user authentication with a real service
  8. Add product images and optimize performance
  `
      }
    }
  };