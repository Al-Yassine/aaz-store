// Dynamic category structure for the hamburger menu
// This is scalable - new categories and subcategories can be added easily

export const menuCategories = [
  {
    id: 'all',
    name: 'All Categories',
    slug: 'all',
    isSubcategory: false,
    filterValue: null, // null means show all products
    parentId: 'articles'
  },
  {
    id: 'costumes',
    name: 'Costumes',
    slug: 'costumes',
    isExpandable: false,
    isSubcategory: false,
    parentId: 'articles',
    filterValue: 'Costumes'
  },
  {
    id: 'blazers',
    name: 'Blazers',
    slug: 'blazers',
    isExpandable: false,
    isSubcategory: false,
    parentId: 'articles',
    filterValue: 'Blazers'
  },
  {
    id: 'chemises',
    name: 'Chemises',
    slug: 'chemises',
    isExpandable: false,
    isSubcategory: false,
    parentId: 'articles',
    filterValue: 'Chemises'
  },
  {
    id: 'chaussures',
    name: 'Chaussures',
    slug: 'chaussures',
    isExpandable: true,
    isSubcategory: false,
    parentId: 'articles',
    children: [
      {
        id: 'soulier',
        name: 'Souliers',
        slug: 'soulier',
        isSubcategory: true,
        parentId: 'chaussures',
        filterValue: 'Chaussures',
        subFilter: 'soulier'
      },
      {
        id: 'mocassins',
        name: 'Mocassins',
        slug: 'mocassins',
        isSubcategory: true,
        parentId: 'chaussures',
        filterValue: 'Chaussures',
        subFilter: 'mocassins'
      },
      {
        id: 'sneakers',
        name: 'Sneakers',
        slug: 'sneakers',
        isSubcategory: true,
        parentId: 'chaussures',
        filterValue: 'Chaussures',
        subFilter: 'sneakers'
      },
      {
        id: 'nupied',
        name: 'Nu-pied',
        slug: 'nupied',
        isSubcategory: true,
        parentId: 'chaussures',
        filterValue: 'Chaussures',
        subFilter: 'nupied'
      }
    ]
  },
  {
    id: 'tshirts',
    name: 'T-shirts',
    slug: 'tshirts',
    isExpandable: true,
    isSubcategory: false,
    parentId: 'articles',
    children: [
      {
        id: 'tshirt-classiques',
        name: 'T-shirts classiques',
        slug: 'tshirt-classiques',
        isSubcategory: true,
        parentId: 'tshirts',
        filterValue: 'T-shirt-Polo',
        subFilter: 'classiques'
      },
      {
        id: 'polo-manche-longue',
        name: 'Polo manche longue',
        slug: 'polo-manche-longue',
        isSubcategory: true,
        parentId: 'tshirts',
        filterValue: 'T-shirt-Polo',
        subFilter: 'manche-longue'
      }
    ]
  }
];

// Flatten categories for easier processing
export const flattenCategories = (categories) => {
  const flat = [];
  const flatten = (cats) => {
    cats.forEach(cat => {
      flat.push(cat);
      if (cat.children) {
        flatten(cat.children);
      }
    });
  };
  flatten(categories);
  return flat;
};

// Find category by ID
export const findCategoryById = (categories, id) => {
  for (const cat of categories) {
    if (cat.id === id) return cat;
    if (cat.children) {
      const found = findCategoryById(cat.children, id);
      if (found) return found;
    }
  }
  return null;
};

// Get all root categories (excluding 'all')
export const getRootCategories = (categories) => {
  return categories.filter(cat => cat.id !== 'all');
};
