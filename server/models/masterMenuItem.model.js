import mongoose, {Schema} from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const masterMenuItemSchema = new mongoose.Schema(
  {
    brandId: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    basePrice: { type: Number, required: true, min: 0 },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "MenuCategory",
      required: true,
    },
    subcategoryId: {
      type: Schema.Types.ObjectId,
      ref: "MenuSubcategory",
      default: null,
    },
    image: { type: String, default: "" },
    isVeg: { type: Boolean, default: true },
    dietaryTags: { type: [String], default: [] },
    defaultStation: { type: String, default: null },
    gstCategory: { type: String, default: null },
    status: { type: String, enum: ["ENABLED", "DISABLED"], default: "ENABLED" },
    isArchived: { type: Boolean, default: false },
    version: { type: Number, default: 1 },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

masterMenuItemSchema.index(
  { brandId: 1, name: 1 },
  { unique: true, partialFilterExpression: { isArchived: false } }
);
masterMenuItemSchema.plugin(mongoosePaginate);

const masterMenuItemModel = mongoose.model(
  "MasterMenuItem",
  masterMenuItemSchema
);

export default masterMenuItemModel;
