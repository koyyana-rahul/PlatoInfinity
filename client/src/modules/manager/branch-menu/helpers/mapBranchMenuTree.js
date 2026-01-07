/**
 * Maps master menu categories to branch menu items
 * So UI structure stays EXACTLY like Master Menu
 */
export function mapBranchMenuTree(masterCategories, branchGrouped) {
  return masterCategories.map((cat) => {
    const branchCategory = branchGrouped?.[cat.id];

    return {
      ...cat,
      items: branchCategory?.subcategories?.all?.items || [],
      subcategories: cat.subcategories.map((sub) => ({
        ...sub,
        items: branchCategory?.subcategories?.[sub.id]?.items || [],
      })),
    };
  });
}
