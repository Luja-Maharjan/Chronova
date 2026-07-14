import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { generateSlug, ensureUniqueSlug } from '../utils/slug.js';

const populateCategory = { path: 'category', select: 'name slug description seoTitle metaDescription metaKeywords' };

const buildProductSeoFields = (name, description, brand, categoryName) => {
  const shortDescription = description?.length > 160 ? `${description.substring(0, 157)}...` : description;
  return {
    shortDescription,
    seoTitle: `${name} | ${brand || 'Chronova'} Watches`,
    metaDescription: shortDescription,
    metaKeywords: `${name}, ${brand || 'Chronova'}, ${categoryName || 'watches'}, buy watches Nepal, Chronova`,
    imageAlt: `${name} - ${brand || 'Chronova'} premium watch`,
  };
};

const createdProductWithPopulate = async (product) => {
  const saved = await product.save();
  return Product.findById(saved._id).populate('category', 'name slug');
};

const findProductByIdOrSlug = async (identifier) => {
  const isObjectId = mongoose.Types.ObjectId.isValid(identifier) && String(identifier).length === 24;

  let product = isObjectId
    ? await Product.findById(identifier).populate(populateCategory)
    : await Product.findOne({ slug: identifier }).populate(populateCategory);

  if (!product && isObjectId) {
    product = await Product.findOne({ slug: identifier }).populate(populateCategory);
  }

  if (product && !product.slug) {
    const baseSlug = generateSlug(product.name);
    product.slug = await ensureUniqueSlug(Product, baseSlug, product._id);
    const seo = buildProductSeoFields(product.name, product.description, product.brand, product.category?.name);
    Object.assign(product, seo);
    await product.save();
  }

  return product;
};

// @desc    Get all products (with search, filter, sorting)
// @route   GET /api/product
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { search, category, categorySlug, minPrice, maxPrice, sort } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (categorySlug) {
      const cat = await Category.findOne({ slug: categorySlug });
      if (cat) query.category = cat._id;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let apiQuery = Product.find(query).populate('category', 'name slug');

    if (sort === 'priceAsc') {
      apiQuery = apiQuery.sort({ price: 1 });
    } else if (sort === 'priceDesc') {
      apiQuery = apiQuery.sort({ price: -1 });
    } else {
      apiQuery = apiQuery.sort({ createdAt: -1 });
    }

    const products = await apiQuery;
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product by ID or slug
// @route   GET /api/product/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await findProductByIdOrSlug(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product (Admin only)
// @route   POST /api/product
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, countInStock, isFeatured, isLatest, discount, brand } = req.body;

    let image = '/uploads/placeholder.jpg';
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const discountNum = Number(discount) || 0;
    if (discountNum < 0 || discountNum > 100) {
      return res.status(400).json({ message: 'Discount must be between 0 and 100' });
    }

    const cat = await Category.findById(category);
    const baseSlug = generateSlug(name);
    const slug = await ensureUniqueSlug(Product, baseSlug);
    const seo = buildProductSeoFields(name, description, brand, cat?.name);

    const product = new Product({
      name,
      slug,
      description,
      price: Number(price),
      category,
      discount: discountNum,
      image,
      brand: brand || 'Chronova',
      countInStock: Number(countInStock) || 0,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      isLatest: isLatest === 'true' || isLatest === true,
      ...seo,
    });

    const createdProduct = await createdProductWithPopulate(product);
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product (Admin only)
// @route   PUT /api/product/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, countInStock, isFeatured, isLatest, discount, brand } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (discount !== undefined) {
      const discountNum = Number(discount) || 0;
      if (discountNum < 0 || discountNum > 100) {
        return res.status(400).json({ message: 'Discount must be between 0 and 100' });
      }
      product.discount = discountNum;
    }

    if (name && name !== product.name) {
      product.name = name;
      const baseSlug = generateSlug(name);
      product.slug = await ensureUniqueSlug(Product, baseSlug, product._id);
    }

    product.description = description || product.description;
    product.price = price !== undefined ? Number(price) : product.price;
    product.category = category || product.category;
    product.countInStock = countInStock !== undefined ? Number(countInStock) : product.countInStock;
    product.isFeatured = isFeatured !== undefined ? (isFeatured === 'true' || isFeatured === true) : product.isFeatured;
    product.isLatest = isLatest !== undefined ? (isLatest === 'true' || isLatest === true) : product.isLatest;
    product.brand = brand || product.brand || 'Chronova';

    const cat = await Category.findById(product.category);
    const seo = buildProductSeoFields(product.name, product.description, product.brand, cat?.name);
    Object.assign(product, seo);

    if (req.file) {
      product.image = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      product.image = req.body.image;
    }

    const updatedProduct = await product.save();
    const populated = await Product.findById(updatedProduct._id).populate('category', 'name slug');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product (Admin only)
// @route   DELETE /api/product/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.deleteOne({ _id: product._id });
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
