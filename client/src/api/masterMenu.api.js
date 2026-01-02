const masterMenuApi = {
  tree: {
    url: "/api/master-menu/tree",
    method: "GET",
  },

  createCategory: {
    url: "/api/master-menu/category",
    method: "POST",
  },
  updateCategory: (id) => ({
    url: `/api/master-menu/category/${id}`,
    method: "PUT",
  }),
  deleteCategory: (id) => ({
    url: `/api/master-menu/category/${id}`,
    method: "DELETE",
  }),

  createSubcategory: {
    url: "/api/master-menu/subcategory",
    method: "POST",
  },
  updateSubcategory: (id) => ({
    url: `/api/master-menu/subcategory/${id}`,
    method: "PUT",
  }),
  deleteSubcategory: (id) => ({
    url: `/api/master-menu/subcategory/${id}`,
    method: "DELETE",
  }),

  createItem: {
    url: "/api/master-menu/item",
    method: "POST",
  },
  updateItem: (id) => ({
    url: `/api/master-menu/item/${id}`,
    method: "PUT",
  }),
  deleteItem: (id) => ({
    url: `/api/master-menu/item/${id}`,
    method: "DELETE",
  }),
};

export default masterMenuApi;
