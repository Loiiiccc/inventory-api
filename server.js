require("dotenv").config();
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { registerUser, loginUser, protectRoute, authorize } = require("./auth");

const app = express();

const prisma = new PrismaClient();

app.use(express.json());

// Auth routes
app.post("/register", registerUser);

app.post("/login", loginUser);

// Protected routes
app.get("/me", protectRoute, (req, res) => {
  res.json(req.user);
});

////////////////////////////GET METHODS///////////////////////

//Get list of users

app.get(
  "/admin/users",
  protectRoute,
  authorize(["ADMIN"]),
  async (req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
  }
);

// Get a single user
app.get("/users/:id", protectRoute, async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({ where: { id: Number(id) } });
  res.json(user);
});

// Get a  list of products
app.get("/products", protectRoute, async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});

// Get a single product
app.get("/products/:id", protectRoute, async (req, res) => {
  const { id } = req.params;
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
  });
  res.json(product);
});

// Get list of categories
app.get("/categories", protectRoute, async (req, res) => {
  const categories = await prisma.category.findMany();
  res.json(categories);
});

// Get a single category
app.get("/categories/:id", protectRoute, async (req, res) => {
  const { id } = req.params;
  const category = await prisma.category.findUnique({
    where: { id: Number(id) },
  });
  res.json(category);
});

// Get a list of products in a specific category
app.get("/categories/:id/products", protectRoute, async (req, res) => {
  const { id } = req.params;
  const products = await prisma.product.findMany({
    where: { categoryId: Number(id) },
  });
  res.json(products);
});

// Get a list of products by their name (search)
app.get("/products/:name", protectRoute, async (req, res) => {
  const { name } = req.query;
  const products = await prisma.product.findMany({
    where: { name: { contains: name.toString() } },
  });
  res.json(products);
});

////////////////////////////POST METHODS///////////////////////

//Create a new user account
app.post("/admin/users/new", authorize(["ADMIN"]), async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "USER",
    },
  });

  res.json(user);
});

//Update a user account
app.put(
  "/admin/users/:id",
  protectRoute,
  authorize(["ADMIN"]),
  async (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        name,
        email,
        password,
      },
    });

    res.json(updatedUser);
  }
);

// Add a new product
app.post(
  "/admin/products",
  protectRoute,
  authorize(["ADMIN"])
  ),
  async (req, res) => {
    const { name, price } = req.body;
    const product = await prisma.product.create({
      data: {
        name,
        price,
      },
    });

    res.json(product);
  }
;

// Add a new category
app.post(
  "/admin/categories",
  protectRoute,
  authorize(["ADMIN"]),
  async (req, res) => {
    const { name } = req.body;
    const category = await prisma.category.create({
      data: {
        name,
      },
    });

    res.json(category);
  }
);

// Add a new product to a specific category
app.post("/categories/:id/products", protectRoute, async (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;
  const product = await prisma.product.create({
    data: {
      name,
      price,
      category: {
        id: { id: Number(id) },
      },
    },
  });

  res.json(product);
});

//Update user role
app.put(
  "/admin/users/:id/promote",
  protectRoute,
  authorize(["ADMIN"]),
  async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        role: "ADMIN",
      },
    });

    res.json(updatedUser);
  }
);

// Update a product
app.put("/products/:id", protectRoute, async (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;
  const updatedProduct = await prisma.product.update({
    where: { id: Number(id) },
    data: {
      name,
      price,
    },
  });

  res.json(updatedProduct);
});

// Update a category
app.put(
  "/admin/categories/:id",
  protectRoute,
  authorize(["ADMIN"]),
  async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const updatedCategory = await prisma.category.update({
      where: { id: Number(id) },
      data: {
        name,
      },
    });

    res.json(updatedCategory);
  }
);

////////////////////////////DELETE METHODS///////////////////////

// Delete a user account
app.delete(
  "/admin/users/:id",
  protectRoute,
  authorize(["ADMIN"]),
  async (req, res) => {
    const { id } = req.params;
    const deletedUser = await prisma.user.delete({
      where: { id: Number(id) },
    });

    res.json(deletedUser);
  }
);

// Delete a category and all its products
app.delete(
  "/admin/categories/:id/products",
  protectRoute,
  authorize(["ADMIN"]),
  async (req, res) => {
    const { id } = req.params;
    const deletedProducts = await prisma.product.deleteMany({
      where: { categoryId: Number(id) },
    });
    res.json(deletedProducts);
  }
);

// Delete a product
app.delete(
  "/admin/products/:id",
  protectRoute,
  authorize(["ADMIN"]),
  async (req, res) => {
    const { id } = req.params;
    const deletedProduct = await prisma.product.delete({
      where: { id: Number(id) },
    });
    res.json(deletedProduct);
  }
);

// Delete a category
app.delete(
  "/admin/categories/:id",
  protectRoute,
  authorize(["ADMIN"]),
  async (req, res) => {
    const { id } = req.params;
    const deletedCategory = await prisma.category.delete({
      where: { id: Number(id) },
    });
    res.json(deletedCategory);
  }
);

// Delete a product from a specific category
app.delete(
  "/admin/categories/:categoryId/products/:productId",
  protectRoute,
  authorize(["ADMIN"]),
  async (req, res) => {
    const { categoryId, productId } = req.params;
    const deletedProduct = await prisma.product.delete({
      where: {
        id: Number(productId),
        categoryId: Number(categoryId),
      },
    });

    res.json(deletedProduct);
  }
);

const PORT = process.env.PORT || 4000;
if(require.main === module) {
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

} 

module.exports = app;

