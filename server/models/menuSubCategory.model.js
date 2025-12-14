import mongoose, {Schema} from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";  
const menuSubCategorySchema = new mongoose.Schema(
  {
    brandId: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
      index: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "MenuCategory",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    isArchived: { type: Boolean, default: false },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

menuSubCategorySchema.index(
  { categoryId: 1, name: 1 },
  { unique: true, partialFilterExpression: { isArchived: false } }
);
menuSubCategorySchema.plugin(mongoosePaginate);

const menuSubCategoryModel = mongoose.model(
  "MenuSubcategory",
  menuSubCategorySchema
);

export default menuSubCategoryModel;
