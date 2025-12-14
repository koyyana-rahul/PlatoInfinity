import MenuCategory from "../models/menuCategory.model.js";
import MasterMenuItem from "../models/masterMenuItem.model.js";
import MenuSubcategory from "../models/menuSubcategory.model.js";
import uploadImageClodinary from "../utils/uploadImageClodinary.js";

export async function createCategory(req, res) {
  const { name, order } = req.body;
  const brandId = req.user.brandId;

  if (!name) {
    return res.status(400).json({ message: "Category name required" });
  }

  const category = await MenuCategory.create({
    brandId,
    name,
    order,
  });

  res.status(201).json({ success: true, data: category });
}

export async function createSubcategory(req, res) {
  const { categoryId, name, order } = req.body;
  const brandId = req.user.brandId;

  if (!categoryId || !name) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const subcategory = await MenuSubcategory.create({
    brandId,
    categoryId,
    name,
    order,
  });

  res.status(201).json({ success: true, data: subcategory });
}

export async function createMasterItem(req, res) {
  try {
    let data = req.body;

    // If content-type is form-data, req.body might contain stringified JSON
    // in a field, or individual fields. Multer will populate req.file for the image.
    if (req.is("multipart/form-data")) {
      // If there's a specific field containing JSON data, parse it.
      // Assuming a field named 'data' might contain the JSON payload.
      if (req.body.data) {
        try {
          data = JSON.parse(req.body.data);
        } catch (e) {
          return res
            .status(400)
            .json({ message: "Invalid JSON data in 'data' field" });
        }
      }
    }

    const {
      categoryId,
      subcategoryId,
      name,
      description,
      isVeg,
      basePrice,
      defaultStation,
      image, // can be a URL for JSON input
    } = data;

    const brandId = req.user.brandId;

    if (
      !categoryId ||
      !name ||
      basePrice === undefined ||
      isVeg === undefined
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let imageUrl = image; // Use image URL from JSON body by default
    if (req.file) {
      // If a file is uploaded, it takes precedence
      const buffer = Buffer.from(req.file.buffer);
      const result = await uploadImageClodinary(buffer);
      imageUrl = result.secure_url;
    }

    const item = await MasterMenuItem.create({
      brandId,
      categoryId,
      subcategoryId,
      name,
      description,
      isVeg: String(isVeg) === "true",
      basePrice: parseFloat(basePrice),
      defaultStation,
      image: imageUrl,
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    console.error("createMasterItem error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getMasterMenu(req, res) {
  const brandId = req.user.brandId;
  const { isVeg } = req.query;

  const filter = {
    brandId,
    isArchived: false,
  };

  if (isVeg !== undefined) {
    filter.isVeg = isVeg === "true";
  }

  const items = await MasterMenuItem.find(filter)
    .populate("categoryId", "name")
    .populate("subcategoryId", "name")
    .sort({ createdAt: 1 });

  res.json({ success: true, data: items });
}
