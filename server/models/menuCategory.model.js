import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const menuCategorySchema = new mongoose.Schema(
  {
    brandId: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    sortOrder: { type: Number, default: 0 },
    isArchived: { type: Boolean, default: false },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

menuCategorySchema.index(
  { brandId: 1, name: 1 },
  { unique: true, partialFilterExpression: { isArchived: false } }
);
menuCategorySchema.plugin(mongoosePaginate);
export default mongoose.models.MenuCategory ||
  mongoose.model("MenuCategory", menuCategorySchema);
