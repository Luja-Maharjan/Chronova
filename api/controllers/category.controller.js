import Category from '../models/Category.js';
import { generateSlug } from '../utils/slug.js';

const buildCategorySeoFields = (name, description) => ({
  seoTitle: `${name} Watches | Chronova`,
  metaDescription:
    description ||
    `Browse ${name} watches at Chronova. Shop premium timepieces with fast delivery across Nepal.`,
  metaKeywords: `${name}, ${name} watches, Chronova, buy watches Nepal, premium timepieces`,
});

// @desc    Get all categories
// @route   GET /api/category
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get category by slug
// @route   GET /api/category/slug/:slug
// @access  Public
export const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a category
// @route   POST /api/category
// @access  Private/Admin
export const createCategory = async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  try {
    const slug = generateSlug(name);
    const categoryExists = await Category.findOne({ slug });

    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const seo = buildCategorySeoFields(name, description);

    const category = await Category.create({
      name,
      slug,
      description,
      ...seo,
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a category
// @route   PUT /api/category/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
  const { name, description } = req.body;

  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.name = name || category.name;
    category.description = description ?? category.description;

    if (name) {
      category.slug = generateSlug(name);
    }

    const seo = buildCategorySeoFields(category.name, category.description);
    Object.assign(category, seo);

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a category
// @route   DELETE /api/category/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await Category.deleteOne({ _id: category._id });
    res.json({ message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
