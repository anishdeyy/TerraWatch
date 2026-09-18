-- ============================================================
--  STARBUCKS INDIA — DATABASE SCHEMA (MySQL)
--  Run: mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS starbucks_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE starbucks_db;

-- ── USERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  first_name    VARCHAR(60)  NOT NULL,
  last_name     VARCHAR(60),
  email         VARCHAR(120) NOT NULL UNIQUE,
  phone         VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

-- ── PRODUCTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  category      ENUM('bestseller','drinks','food','merchandise','coffee-home','ready-to-eat') NOT NULL,
  subcategory   VARCHAR(80),
  name          VARCHAR(150) NOT NULL,
  meta          VARCHAR(150),
  description   TEXT,
  taste         TEXT,
  allergens     VARCHAR(255),
  price         DECIMAL(10,2) NOT NULL,
  calories      INT,
  is_veg        TINYINT(1) DEFAULT 1,
  is_hot        TINYINT(1),
  is_bestseller TINYINT(1) DEFAULT 0,
  in_stock      TINYINT(1) DEFAULT 1,
  image_url     VARCHAR(500),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_bestseller (is_bestseller)
);

-- ── ORDERS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  user_id            INT,
  order_number       INT NOT NULL UNIQUE,
  total              DECIMAL(10,2) NOT NULL,
  mode               ENUM('dine-in','takeaway') DEFAULT 'dine-in',
  status             ENUM('pending','paid','preparing','ready','delivered','cancelled') DEFAULT 'pending',
  payment_id         VARCHAR(100),
  razorpay_order_id  VARCHAR(100),
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_order_number (order_number)
);

-- ── ORDER ITEMS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  order_id   INT NOT NULL,
  product_id INT,
  name       VARCHAR(150) NOT NULL,
  price      DECIMAL(10,2) NOT NULL,
  quantity   INT DEFAULT 1,
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- ── PAYMENTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  order_id            INT NOT NULL,
  razorpay_payment_id VARCHAR(100),
  razorpay_order_id   VARCHAR(100),
  amount              DECIMAL(10,2) NOT NULL,
  currency            VARCHAR(10) DEFAULT 'INR',
  status              ENUM('created','authorized','captured','refunded','failed') DEFAULT 'created',
  method              VARCHAR(50),
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ── SEED: INITIAL PRODUCTS ────────────────────────────────────
INSERT IGNORE INTO products (category, subcategory, name, meta, description, taste, allergens, price, calories, is_veg, is_hot, is_bestseller, in_stock, image_url) VALUES
-- BESTSELLERS
('bestseller', NULL, 'Cappuccino', 'SHORT (237 ml) · 104 kcal', 'Dark, rich espresso lies in wait under a smoothed and stretched layer of deep, velvety foam.', 'Bold espresso character balanced by airy microfoam — classic Italian elegance in every sip. Creamy, slightly bitter, deeply aromatic.', 'Milk', 336.00, 104, 1, 1, 1, 1, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80'),
('bestseller', NULL, 'Double Chocolate Chip Frappuccino', 'SHORT (237 ml) · 344 kcal', 'Rich mocha-flavoured sauce meets up with chocolaty chips, milk, and ice.', 'Deep, bold chocolate that lingers — intensely rich, creamy, and satisfying. Made for true chocolate lovers.', 'Milk,Wheat', 477.75, 344, 1, 0, 1, 1, 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80'),
('bestseller', NULL, 'Caffe Americano', 'SHORT (237 ml) · 0 kcal', 'Rich, full-bodied espresso with hot water for a smooth, bold finish.', 'Clean and pure — strong espresso intensity softened by hot water. Bold and direct with no distractions.', '', 325.50, 0, 1, 1, 1, 1, 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=400&q=80'),
('bestseller', NULL, 'Java Chip Frappuccino', 'TALL (354 ml) · 329 kcal', 'Mocha sauce and Frappuccino® chips blended with roast coffee and milk and ice, topped with whipped vanilla topping and mocha drizzle.', 'Rich, chocolatey with an intense espresso backbone. Each sip delivers layers of mocha, coffee, and cream.', 'Soy,Milk,Wheat', 456.75, 329, 1, 0, 1, 1, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=80'),
('bestseller', NULL, 'Cold Brew', 'TALL (354 ml) · 354 kcal', 'Everybody\'s favourite indulgence. Crafted expertly with premium cold brew coffee and cream.', 'Silky, smooth, and cool — cold brew magic at its finest. Naturally sweet with low acidity.', 'Milk', 414.75, 354, 1, 0, 1, 1, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&q=80'),
-- DRINKS
('drinks', 'Hot Coffee', 'Caramel Macchiato', 'TALL (354 ml) · 240 kcal', 'Freshly steamed milk with vanilla-flavoured syrup, espresso and caramel sauce.', 'Sweet vanilla and velvety milk crowned with bold espresso and a drizzle of caramel.', 'Milk', 420.00, 240, 1, 1, 0, 1, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80'),
('drinks', 'Cold Coffee', 'Brown Sugar Cinnamon Iced Shaken Espresso', 'TALL (354 ml) · 117 kcal', 'Double shot of Signature Starbucks blonde roast shaken with brown sugar and cinnamon, topped with oat-based beverage blend.', 'Warm spice meets cool refreshment. The brown sugar adds caramel depth while cinnamon brings warmth.', 'Oat', 367.50, 117, 1, 0, 0, 1, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&q=80'),
-- FOOD
('food', 'Sandwiches & Wraps', 'Avocado Panini Sandwich', 'Per Serve (203g) · 490 kcal', 'Avocado slices, buffalo mozzarella cheese, rocket leaves, and a basil pesto spread with a balsamic glaze dressing.', 'Fresh, creamy avocado meets rich mozzarella with herby pesto. Crispy on the outside, soft within.', 'Wheat,Milk,Nut', 472.50, 490, 1, NULL, 0, 1, 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=400&q=80'),
('food', 'Cookies & Desserts', 'Double Chocolate Brownie', 'Per Serve · 450 kcal', 'Rich, fudgy brownie made with two kinds of chocolate.', 'Dense, fudgy, and intensely chocolatey. Perfectly moist with a crinkly crust and gooey centre.', 'Wheat,Milk,Egg', 295.00, 450, 1, NULL, 0, 1, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80'),
-- MERCHANDISE
('merchandise', 'Mugs & Tumblers', 'Starbucks Green Ceramic Mug', 'Capacity: 355 ml', 'Classic Starbucks ceramic mug in signature green with the iconic Siren logo.', 'Elevate your home coffee ritual with premium ceramic quality. Holds heat beautifully.', '', 1299.00, 0, 1, NULL, 0, 1, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80'),
('merchandise', 'Coffee Beans', 'Starbucks Arabica Ground Coffee', '200g | Medium Roast', 'Signature Starbucks Arabica medium roast ground coffee for brewing at home.', 'Smooth, balanced, and aromatic. Notes of cocoa and brown sugar with a clean, satisfying finish.', '', 799.00, 0, 1, NULL, 0, 1, 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&q=80');
