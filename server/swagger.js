/**
 * swagger.js
 * Swagger/OpenAPI documentation setup for all endpoints
 */

import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "PLATO Menu - Restaurant Management System API",
      version: "1.0.0",
      description:
        "Complete REST API for restaurant management, orders, billing, staff, and analytics",
      contact: {
        name: "PLATO Menu Support",
        email: "support@platomenu.com",
        url: "https://platomenu.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:5000/api",
        description: "Development server",
      },
      {
        url: "https://api.platomenu.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token from /auth/login endpoint",
        },
      },
      schemas: {
        // Restaurant Schema
        Restaurant: {
          type: "object",
          properties: {
            _id: { type: "string", description: "MongoDB ID" },
            name: { type: "string", example: "The Golden Fork" },
            email: { type: "string", format: "email" },
            phone: { type: "string", example: "+1234567890" },
            address: { type: "string" },
            city: { type: "string" },
            state: { type: "string" },
            zipCode: { type: "string" },
            cuisine: {
              type: "array",
              items: { type: "string" },
              example: ["Indian", "Italian"],
            },
            openingTime: { type: "string", example: "09:00" },
            closingTime: { type: "string", example: "23:00" },
            totalTables: { type: "number" },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        // Order Schema
        Order: {
          type: "object",
          properties: {
            _id: { type: "string" },
            restaurantId: { type: "string" },
            tableId: { type: "string" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  itemId: { type: "string" },
                  name: { type: "string" },
                  quantity: { type: "number" },
                  price: { type: "number" },
                  specialRequest: { type: "string" },
                },
              },
            },
            totalAmount: { type: "number" },
            status: {
              type: "string",
              enum: ["pending", "confirmed", "preparing", "ready", "served"],
            },
            staffId: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },

        // Bill Schema
        Bill: {
          type: "object",
          properties: {
            _id: { type: "string" },
            orderId: { type: "string" },
            restaurantId: { type: "string" },
            totalAmount: { type: "number" },
            taxAmount: { type: "number" },
            discountAmount: { type: "number" },
            finalAmount: { type: "number" },
            paymentMethod: {
              type: "string",
              enum: ["cash", "card", "upi", "wallet"],
            },
            paymentStatus: { type: "string", enum: ["pending", "completed"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },

        // Error Response
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            error: { type: "string" },
          },
        },

        // Success Response
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: { type: "object" },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    "./server/routes/auth.js",
    "./server/routes/restaurants.js",
    "./server/routes/orders.js",
    "./server/routes/bills.js",
    "./server/routes/tables.js",
    "./server/routes/staff.js",
    "./server/routes/menu.js",
  ],
};

export const specs = swaggerJsdoc(swaggerOptions);

export function setupSwagger(app) {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      swaggerOptions: {
        persistAuthorization: true,
        displayOperationId: true,
        defaultModelsExpandDepth: 2,
        defaultModelExpandDepth: 2,
      },
      customCss: `.swagger-ui .topbar { display: none }
               .swagger-ui .scheme-container { background: none }`,
      customfavIcon: "https://platomenu.com/favicon.ico",
    }),
  );
  console.log("✅ Swagger documentation available at /api-docs");
}

/**
 * Endpoint documentation examples
 *
 * // Authentication Endpoints
 *
 * /**
 *  * @swagger
 *  * /auth/register:
 *  *   post:
 *  *     summary: Register new restaurant
 *  *     tags: [Authentication]
 *  *     requestBody:
 *  *       required: true
 *  *       content:
 *  *         application/json:
 *  *           schema:
 *  *             type: object
 *  *             properties:
 *  *               name: { type: string }
 *  *               email: { type: string, format: email }
 *  *               password: { type: string }
 *  *               phone: { type: string }
 *  *     responses:
 *  *       201:
 *  *         description: Restaurant created successfully
 *  *         content:
 *  *           application/json:
 *  *             schema:
 *  *               $ref: '#/components/schemas/SuccessResponse'
 *  *       400:
 *  *         description: Invalid input
 *  *         content:
 *  *           application/json:
 *  *             schema:
 *  *               $ref: '#/components/schemas/Error'
 *  * /
 *
 * // Menu Endpoints
 *
 * /**
 *  * @swagger
 *  * /menu/{restaurantId}:
 *  *   get:
 *  *     summary: Get menu items for restaurant
 *  *     tags: [Menu]
 *  *     parameters:
 *  *       - in: path
 *  *         name: restaurantId
 *  *         required: true
 *  *         schema:
 *  *           type: string
 *  *     security:
 *  *       - bearerAuth: []
 *  *     responses:
 *  *       200:
 *  *         description: Menu items fetched successfully
 *  *         content:
 *  *           application/json:
 *  *             schema:
 *  *               type: object
 *  *               properties:
 *  *                 success: { type: boolean }
 *  *                 data:
 *  *                   type: array
 *  *                   items:
 *  *                     $ref: '#/components/schemas/MenuItem'
 *  * /
 *
 * // Order Endpoints
 *
 * /**
 *  * @swagger
 *  * /orders:
 *  *   post:
 *  *     summary: Create new order
 *  *     tags: [Orders]
 *  *     requestBody:
 *  *       required: true
 *  *       content:
 *  *         application/json:
 *  *           schema:
 *  *             $ref: '#/components/schemas/Order'
 *  *     security:
 *  *       - bearerAuth: []
 *  *     responses:
 *  *       201:
 *  *         description: Order created successfully
 *  *         content:
 *  *           application/json:
 *  *             schema:
 *  *               $ref: '#/components/schemas/SuccessResponse'
 *  * /
 *
 * /**
 *  * @swagger
 *  * /orders/{orderId}:
 *  *   get:
 *  *     summary: Get order details
 *  *     tags: [Orders]
 *  *     parameters:
 *  *       - in: path
 *  *         name: orderId
 *  *         required: true
 *  *         schema:
 *  *           type: string
 *  *     security:
 *  *       - bearerAuth: []
 *  *     responses:
 *  *       200:
 *  *         description: Order details
 *  *         content:
 *  *           application/json:
 *  *             schema:
 *  *               $ref: '#/components/schemas/SuccessResponse'
 *  * /
 *
 * /**
 *  * @swagger
 *  * /orders/{orderId}:
 *  *   put:
 *  *     summary: Update order status
 *  *     tags: [Orders]
 *  *     parameters:
 *  *       - in: path
 *  *         name: orderId
 *  *         required: true
 *  *         schema:
 *  *           type: string
 *  *     requestBody:
 *  *       required: true
 *  *       content:
 *  *         application/json:
 *  *           schema:
 *  *             type: object
 *  *             properties:
 *  *               status: { type: string, enum: [pending, confirmed, preparing, ready, served] }
 *  *     security:
 *  *       - bearerAuth: []
 *  *     responses:
 *  *       200:
 *  *         description: Order updated successfully
 *  * /
 *
 * // Bill Endpoints
 *
 * /**
 *  * @swagger
 *  * /bills:
 *  *   post:
 *  *     summary: Create bill for order
 *  *     tags: [Bills]
 *  *     requestBody:
 *  *       required: true
 *  *       content:
 *  *         application/json:
 *  *           schema:
 *  *             $ref: '#/components/schemas/Bill'
 *  *     security:
 *  *       - bearerAuth: []
 *  *     responses:
 *  *       201:
 *  *         description: Bill created successfully
 *  * /
 *
 * /**
 *  * @swagger
 *  * /bills/{billId}/pay:
 *  *   post:
 *  *     summary: Process payment
 *  *     tags: [Bills]
 *  *     parameters:
 *  *       - in: path
 *  *         name: billId
 *  *         required: true
 *  *         schema:
 *  *           type: string
 *  *     requestBody:
 *  *       required: true
 *  *       content:
 *  *         application/json:
 *  *           schema:
 *  *             type: object
 *  *             properties:
 *  *               paymentMethod: { type: string, enum: [cash, card, upi, wallet] }
 *  *               amount: { type: number }
 *  *     security:
 *  *       - bearerAuth: []
 *  *     responses:
 *  *       200:
 *  *         description: Payment processed successfully
 *  * /
 */

export default {
  specs,
  setupSwagger,
};
