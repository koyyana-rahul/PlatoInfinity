export function groupBranchMenu(items = []) {
  const map = {};

  items.forEach((item) => {
    const master = item.masterItemId;
    if (!master) return;

    const catId = master.categoryId;
    const subId = master.subcategoryId || "all";

    if (!map[catId]) {
      map[catId] = {
        id: catId,
        name: master.categoryName || "Category",
        subcategories: {},
        items: [],
      };
    }

    if (subId === "all") {
      map[catId].items.push(item);
    } else {
      if (!map[catId].subcategories[subId]) {
        map[catId].subcategories[subId] = {
          id: subId,
          name: master.subcategoryName || "Section",
          items: [],
        };
      }
      map[catId].subcategories[subId].items.push(item);
    }
  });

  return Object.values(map).map((c) => ({
    ...c,
    subcategories: Object.values(c.subcategories),
  }));
}
