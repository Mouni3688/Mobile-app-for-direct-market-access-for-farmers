import {
  Image,
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
// Cart is now stored in a remote database via REST API.
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as ImagePicker from 'expo-image-picker';
import { Vegetables, Fruits, Grains, Dairy } from "../../assets";
import Nav from "../components/Nav";

interface Product {
  id: string;
  name: string;
  price: number;
  image: any;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

export default function Products({navigation}: {navigation: any}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const defaultProducts: Product[] = [
    // Vegetables
    { id: "1", name: "Tomatoes", price: 40, image: Vegetables, category: 'vegetables' },
    { id: "2", name: "Potatoes", price: 20, image: Vegetables, category: 'vegetables' },
    { id: "3", name: "Carrots", price: 60, image: Vegetables, category: 'vegetables' },
    // Fruits
    { id: "4", name: "Apples", price: 100, image: Fruits, category: 'fruits' },
    { id: "5", name: "Bananas", price: 50, image: Fruits, category: 'fruits' },
    { id: "6", name: "Oranges", price: 80, image: Fruits, category: 'fruits' },
    // Grains
    { id: "7", name: "Rice", price: 70, image: Grains, category: 'grains' },
    { id: "8", name: "Wheat", price: 45, image: Grains, category: 'grains' },
    // Dairy
    { id: "9", name: "Milk", price: 55, image: Dairy, category: 'dairy' },
    { id: "10", name: "Cheese", price: 120, image: Dairy, category: 'dairy' }
  ];
  // Load saved products on mount
  useEffect(() => {
    const initializeData = async () => {
      await loadSavedProducts();
      await fetchCart(); // Load cart from remote DB after products are loaded
    };
    initializeData();
  }, []);

  const saveCartItems = async (items: CartItem[]) => {
    try {
      await AsyncStorage.setItem('cartItems', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  };

  const addToCart = async (product: Product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    let newCartItems;
    
    if (existingItem) {
      newCartItems = cartItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCartItems = [...cartItems, { ...product, quantity: 1 }];
    }
    
    setCartItems(newCartItems);
    await saveCartItems(newCartItems);
    
    // Update cart count
    const total = newCartItems.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(total);
  };

  const loadSavedProducts = async () => {
    try {
      const savedProducts = await AsyncStorage.getItem('products');
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      } else {
        // If no saved products, initialize with default products
        const initialProducts = getInitialProducts();
        setProducts(initialProducts);
        await saveProducts(initialProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      // On error, at least show default products
      setProducts(defaultProducts);
    }
  };

  const fetchCart = async () => {
    try {
      const savedCart = await AsyncStorage.getItem('cartItems');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
        const total = parsedCart.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
        setCartCount(total);
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
    }
  };

  const saveProducts = async (newProducts: any[]) => {
    try {
      await AsyncStorage.setItem('products', JSON.stringify(newProducts));
    } catch (error) {
      console.error('Error saving products:', error);
    }
  };

  const saveCart = async (newCart: any[]) => {
    try {
      await fetch('https://example.com/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCart),
      });
    } catch (error) {
      console.error('Error saving cart to API:', error);
    }
  };



  const getInitialProducts = () => [
    // Vegetables
    { id: "1", name: "Tomatoes", price: 40, image: Vegetables, category: 'vegetables' },
    { id: "2", name: "Potatoes", price: 20, image: Vegetables, category: 'vegetables' },
    { id: "3", name: "Carrots", price: 60, image: Vegetables, category: 'vegetables' },
    // Fruits
    { id: "4", name: "Apples", price: 100, image: Fruits, category: 'fruits' },
    { id: "5", name: "Bananas", price: 50, image: Fruits, category: 'fruits' },
    { id: "6", name: "Oranges", price: 80, image: Fruits, category: 'fruits' },
    // Grains
    { id: "7", name: "Rice", price: 70, image: Grains, category: 'grains' },
    { id: "8", name: "Wheat", price: 45, image: Grains, category: 'grains' },
    // Dairy
    { id: "9", name: "Milk", price: 55, image: Dairy, category: 'dairy' },
    { id: "10", name: "Cheese", price: 120, image: Dairy, category: 'dairy' }
  ];

  const categories = [
    { id: 'all', name: 'All', image: Vegetables },
    { id: 'vegetables', name: 'Vegetables', image: Vegetables },
    { id: 'fruits', name: 'Fruits', image: Fruits },
    { id: 'grains', name: 'Grains', image: Grains },
    { id: 'dairy', name: 'Dairy', image: Dairy }
  ];

  const [isAddingProduct, setIsAddingProduct] = useState(false);


  interface NewProduct {
    name: string;
    price: string;
    category: string;
    image: any;
  }

  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: '',
    price: '',
    category: 'vegetables',  // Set a default category
    image: null
  });

  interface CategoryData {
    id: string;
    name: string;
    image: any;
  }

  const Categories = ({ data }: { data: CategoryData }) => {
    return (
      <TouchableOpacity 
        style={[styles.circleWrapper, selectedCategory === data.id && styles.selectedCategory]}
        onPress={() => setSelectedCategory(data.id)}
      >
        <View style={styles.circle}>
          <Image source={data.image} style={styles.img} />
        </View>
        <Text style={styles.textCat}>{data.name}</Text>
      </TouchableOpacity>
    );
  };



  useEffect(() => {
    const total = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(total);
  }, [cartItems]);

  const renderProductItem = ({ item }: { item: Product }) => {
    const cartItem = cartItems.find(ci => ci.id === item.id);
    return (
      <View style={styles.productItemContainer}>
        <TouchableOpacity 
          style={styles.productItemContent}
          onPress={()=>navigation.navigate("ProductDetail", { product: item })}
        >
          <Image style={styles.productItemImage} source={item.image} />
          <View style={styles.productItemDetails}>
            <Text style={styles.productItemName}>{item.name}</Text>
            <Text style={styles.productItemPrice}>₹{item.price.toFixed(2)}</Text>
            <View style={styles.cartActions}>
              {cartItem && (
                <Text style={styles.quantityText}>In Cart: {cartItem.quantity}</Text>
              )}
              <TouchableOpacity 
                style={styles.addToCartButtonLarge} 
                onPress={() => addToCart(item)}
              >
                <Text style={styles.addToCartText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.addToCartButtonLarge}
          onPress={() => addToCart(item)}
        >
          <MaterialIcons name="add-shopping-cart" size={24} color="white" />
          <Text style={styles.addToCartButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setNewProduct({ ...newProduct, image: result.assets[0].uri || '' });
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const [showMessage, setShowMessage] = useState(false);

  const getCategoryImage = (category: string) => {
    switch (category) {
      case 'vegetables':
        return Vegetables;
      case 'fruits':
        return Fruits;
      case 'grains':
        return Grains;
      case 'dairy':
        return Dairy;
      default:
        return Vegetables;
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name.trim()) {
      alert('Please enter a product name');
      return;
    }
    if (!newProduct.price.trim() || isNaN(parseFloat(newProduct.price))) {
      alert('Please enter a valid price');
      return;
    }
    
    const newId = (products.length + 1).toString();
    const newProductItem: Product = {
      id: newId,
      name: newProduct.name.trim(),
      price: parseFloat(newProduct.price),
      image: newProduct.image || getCategoryImage(newProduct.category),
      category: newProduct.category
    };
    
    const updatedProducts = [...products, newProductItem];
    setProducts(updatedProducts);
    await saveProducts(updatedProducts);
    setIsAddingProduct(false);
    setNewProduct({ name: '', price: '', category: 'vegetables', image: null });
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 2000);
  };

  const filteredProducts = products.filter(product => 
    selectedCategory === 'all' ? true : product.category === selectedCategory
  );

  const getProductById = (id: string): Product | undefined => {
    return products.find(product => product.id === id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Products</Text>
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <MaterialIcons name="shopping-cart" size={24} color="#333" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      {showMessage && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>Product saved successfully!</Text>
        </View>
      )}
      <View style={styles.searchBox}>
        <MaterialIcons name="search" size={22} color={"gray"} />
        <TextInput style={styles.input} placeholder="Search for Product..." />
      </View>
      <View style={styles.wrapper}>
        {categories.map((data) => (
          <Categories key={data.id} data={data} />
        ))}
      </View>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setIsAddingProduct(true)}
      >
        <MaterialIcons name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Add Product</Text>
      </TouchableOpacity>
      <View style={styles.products}>
        {isAddingProduct ? (
          <View style={styles.addProductForm}>
            <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
              {newProduct.image ? (
                <Image source={{ uri: newProduct.image }} style={styles.uploadedImage} />
              ) : (
                <MaterialIcons name="add-a-photo" size={40} color="gray" />
              )}
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Product Name"
              value={newProduct.name}
              onChangeText={(text) => setNewProduct({ ...newProduct, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Price"
              keyboardType="numeric"
              value={newProduct.price}
              onChangeText={(text) => setNewProduct({ ...newProduct, price: text })}
            />
            <View style={styles.pickerContainer}>
              <Text>Category:</Text>
              <TouchableOpacity
                style={styles.categoryPicker}
                onPress={() => {
                  const categoryMap = {
                    'vegetables': 'fruits',
                    'fruits': 'grains',
                    'grains': 'dairy',
                    'dairy': 'vegetables'
                  } as const;
                  const nextCategory = categoryMap[newProduct.category as keyof typeof categoryMap] || 'vegetables';
                  setNewProduct({ ...newProduct, category: nextCategory });
                }}
              >
                <Text style={styles.categoryText}>{newProduct.category}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.formButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={() => setIsAddingProduct(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]}
                onPress={handleAddProduct}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.productListContainer}
          />
        )}
      </View>
      <Nav navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  cartActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  addToCartButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  addToCartText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  cartButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  cartBadge: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addToCartButtonLarge: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 25,
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addToCartButtonText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: 'bold',
  },
  quantityText: {
    color: '#4CAF50',
    marginTop: 5,
    fontWeight: 'bold',
  },
  messageContainer: {
    position: 'absolute',
    top: 10,
    left: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    zIndex: 1000,
  },
  messageText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  selectedCategory: {
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  addButtonText: {
    color: 'white',
    marginLeft: 5,
  },
  addProductForm: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 10,
  },
  imageUpload: {
    width: 150,
    height: 150,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  categoryPicker: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  categoryText: {
    textTransform: 'capitalize',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ff5252',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: "#EFEFEF",
    alignItems: "center",
    justifyContent: "flex-start",
    // paddingTop: 20,
    height: "100%",
  },
  products: {
    flex: 1,
    // backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
    width: '100%',
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "90%",
    paddingHorizontal: 10,
    marginBottom: 20,
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "gray",
    backfaceVisibility: "visible",
  },
  input: {
    width: "100%",
    height: 40,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#000",
  },
  wrapper: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingHorizontal: 20,
  },
  circleWrapper: {
    alignItems: "center",
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 50 / 2,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  img: {
    width: 50,
    height: 50,
    borderRadius: 50 / 2,
  },
  textCat: {
    fontSize: 13,
    // fontWeight: "bold",
    // marginTop: 10,
  },
  productListContainer: {
    paddingBottom: 20,
  },
  productItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  productItemImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  productItemDetails: {
    marginLeft: 20,
  },
  productItemName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  productItemPrice: {
    fontSize: 16,
    marginTop: 5,
  },
});