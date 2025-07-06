// Template generator that creates code dynamically without nested template literal issues

export const generateAppCode = (template, customizations) => {
  const { businessName, primaryColor, secondaryColor, backgroundColor } = customizations;
  
  const templates = {
    restaurant: generateRestaurantApp,
    business: generateBusinessApp,
    ecommerce: generateEcommerceApp,
    fitness: generateFitnessApp,
    directory: generateDirectoryApp
  };
  
  const generator = templates[template] || generateRestaurantApp;
  return generator(customizations);
};

const generateRestaurantApp = (customizations) => {
  const { businessName, primaryColor, secondaryColor, backgroundColor } = customizations;
  
  return {
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
            options={{ title: '${businessName}' }}
          />
          <Stack.Screen name="Order" component={OrderScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
}`,
      
      'screens/MenuScreen.js': `import React from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
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
    backgroundColor: '${backgroundColor}',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '${primaryColor}',
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
    color: '${primaryColor}',
    fontWeight: '600',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: '${primaryColor}',
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
    backgroundColor: '${secondaryColor}',
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

      'package.json': `{
  "name": "${businessName.replace(/\s+/g, '')}App",
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
}`
    }
  };
};

const generateBusinessApp = (customizations) => {
  const { businessName, primaryColor, secondaryColor, backgroundColor } = customizations;
  
  return {
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
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>${businessName}</Text>
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
    backgroundColor: '${backgroundColor}',
  },
  hero: {
    padding: 24,
    backgroundColor: '${primaryColor}',
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
    color: '${primaryColor}',
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

      'package.json': `{
  "name": "${businessName.replace(/\s+/g, '')}App",
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
}`
    }
  };
};

// Add more template generators as needed
const generateEcommerceApp = (customizations) => {
  const { businessName, primaryColor, secondaryColor, backgroundColor } = customizations;

  return {
    name: 'E-commerce App',
    features: ['Product Catalog', 'Shopping Cart', 'Checkout'],
    files: {
      'App.js': `import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CartProvider } from './context/CartContext';
import HomeScreen from './screens/HomeScreen';
import ProductsScreen from './screens/ProductsScreen';
import CartScreen from './screens/CartScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <CartProvider>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Products" component={ProductsScreen} />
          <Tab.Screen name="Cart" component={CartScreen} />
        </Tab.Navigator>
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

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, qty) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prev =>
      prev.map(item => (item.id === id ? { ...item, quantity: qty } : item))
    );
  };

  const clearCart = () => setCart([]);

  const getTotalPrice = () =>
    cart.reduce((t, item) => t + item.price * item.quantity, 0);

  const getItemCount = () =>
    cart.reduce((c, item) => c + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getItemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
};`,

      'screens/HomeScreen.js': `import React from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Welcome to ${businessName}</Text>
      <Text style={styles.subtitle}>Browse our products and shop your favourites</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '${backgroundColor}',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '${primaryColor}',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});`,

      'screens/ProductsScreen.js': `import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useCart } from '../context/CartContext';

const products = [
  { id: 1, name: 'Basic Tee', price: 9.99 },
  { id: 2, name: 'Premium Hoodie', price: 39.99 },
  { id: 3, name: 'Running Shoes', price: 59.99 },
  { id: 4, name: 'Sports Cap', price: 14.99 },
  { id: 5, name: 'Water Bottle', price: 7.99 }
];

export default function ProductsScreen() {
  const { addToCart } = useCart();

  const handleAdd = (product) => {
    addToCart(product);
    Alert.alert('Added to Cart', product.name + ' added');
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>$${item.price.toFixed(2)}</Text>
      <TouchableOpacity style={styles.button} onPress={() => handleAdd(item)}>
        <Text style={styles.buttonText}>Add</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.list}>
      <FlatList
        contentContainerStyle={styles.content}
        data={products}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: '${backgroundColor}' },
  content: { padding: 12 },
  item: {
    backgroundColor: 'white',
    padding: 16,
    margin: 12,
    borderRadius: 8,
  },
  name: { fontSize: 16, fontWeight: '600', color: '#333' },
  price: { fontSize: 14, color: '${primaryColor}', marginBottom: 8 },
  button: { backgroundColor: '${secondaryColor}', padding: 8, borderRadius: 4 },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: '600' },
});`,

      'screens/CartScreen.js': `import React from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useCart } from '../context/CartContext';

export default function CartScreen() {
  const { cart, getTotalPrice, updateQuantity, removeFromCart } = useCart();

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>$${item.price.toFixed(2)}</Text>
      <View style={styles.qtyRow}>
        <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity - 1)}>
          <Text style={styles.qtyBtn}>-</Text>
        </TouchableOpacity>
        <Text style={styles.qty}>{item.quantity}</Text>
        <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)}>
          <Text style={styles.qtyBtn}>+</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => removeFromCart(item.id)}>
        <Text style={styles.remove}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.empty}>
        <Text>Your cart is empty</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        contentContainerStyle={styles.content}
        data={cart}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
      />
      <View style={styles.total}>
        <Text style={styles.totalText}>Total: $${getTotalPrice().toFixed(2)}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '${backgroundColor}' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingBottom: 16 },
  item: { backgroundColor: 'white', padding: 16, margin: 12, borderRadius: 8 },
  name: { fontSize: 16, fontWeight: '600', color: '#333' },
  price: { fontSize: 14, color: '${primaryColor}', marginBottom: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  qtyBtn: { backgroundColor: '${primaryColor}', color: 'white', paddingHorizontal: 8, borderRadius: 4 },
  qty: { marginHorizontal: 8 },
  remove: { color: '#FF3B30', marginTop: 4 },
  total: { padding: 16, borderTopWidth: 1, borderTopColor: '#eee' },
  totalText: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#333' }
});`,

      'package.json': `{
  "name": "${businessName.replace(/\s+/g, '')}App",
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
    }
  };
};

const generateFitnessApp = (customizations) => {
  const { businessName, primaryColor, backgroundColor } = customizations;

  return {
    name: 'Fitness App',
    features: ['Workout Plans', 'Progress Tracking'],
    files: {
      'App.js': `import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import WorkoutsScreen from './screens/WorkoutsScreen';
import ProgressScreen from './screens/ProgressScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Workouts" component={WorkoutsScreen} />
        <Tab.Screen name="Progress" component={ProgressScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}`,

      'screens/HomeScreen.js': `import React from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>${businessName}</Text>
      <Text style={styles.subtitle}>Achieve your fitness goals</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '${backgroundColor}',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '${primaryColor}',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
  },
});`,

      'screens/WorkoutsScreen.js': `import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList } from 'react-native';

const workouts = [
  { id: 1, name: 'Full Body Blast' },
  { id: 2, name: 'Cardio Burn' },
  { id: 3, name: 'Core Strength' },
  { id: 4, name: 'Stretch & Flex' },
  { id: 5, name: 'HIIT Express' }
];

export default function WorkoutsScreen() {
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item.name}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        contentContainerStyle={styles.content}
        data={workouts}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '${backgroundColor}' },
  content: { padding: 16 },
  item: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 12,
    borderRadius: 8
  },
  itemText: { fontSize: 16, color: '#333' },
  title: { fontSize: 20, fontWeight: 'bold', color: '${primaryColor}', marginBottom: 8 }
});`,

      'screens/ProgressScreen.js': `import React from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';

const progressData = [
  { id: 1, label: 'Workouts Completed', value: '12' },
  { id: 2, label: 'Calories Burned', value: '3500' },
  { id: 3, label: 'Miles Run', value: '27' }
];

export default function ProgressScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {progressData.map(item => (
        <View key={item.id} style={styles.statRow}>
          <Text style={styles.statLabel}>{item.label}</Text>
          <Text style={styles.statValue}>{item.value}</Text>
        </View>
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '${backgroundColor}', padding: 16 },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8
  },
  statLabel: { fontSize: 16, color: '#333' },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '${primaryColor}' },
  title: { fontSize: 20, fontWeight: 'bold', color: '${primaryColor}' },
});`,

      'package.json': `{
  "name": "${businessName.replace(/\s+/g, '')}App",
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
    }
  };
};

const generateDirectoryApp = (customizations) => {
  const { businessName, primaryColor, backgroundColor } = customizations;

  return {
    name: 'Directory App',
    features: ['Listings', 'Search'],
    files: {
      'App.js': `import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import ListingScreen from './screens/ListingScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Listing" component={ListingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}`,

      'screens/HomeScreen.js': `import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>${businessName} Directory</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Listing')}>
        <Text style={styles.buttonText}>View Listings</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '${backgroundColor}',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '${primaryColor}', marginBottom: 16 },
  button: { backgroundColor: '${primaryColor}', padding: 12, borderRadius: 8 },
  buttonText: { color: 'white', fontWeight: '600' },
});`,

      'screens/ListingScreen.js': `import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList } from 'react-native';

const listings = [
  { id: 1, name: 'Acme Corp.' },
  { id: 2, name: 'Best Services' },
  { id: 3, name: 'Quick Fixers' },
  { id: 4, name: 'Happy Helpers' },
  { id: 5, name: 'Super Supplies' }
];

export default function ListingScreen() {
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item.name}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        contentContainerStyle={styles.content}
        data={listings}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '${backgroundColor}' },
  content: { padding: 16 },
  item: {
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 12,
    borderRadius: 6
  },
  itemText: { fontSize: 16, color: '#333' },
  title: { fontSize: 20, fontWeight: 'bold', color: '${primaryColor}', marginBottom: 16 },
});`,

      'package.json': `{
  "name": "${businessName.replace(/\s+/g, '')}App",
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
    }
  };
};

export default { generateAppCode }; 
