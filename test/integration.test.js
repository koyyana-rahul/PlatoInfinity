/**
 * test/integration.test.js
 * Comprehensive integration tests for PLATO Menu system
 * Tests frontend + backend integration, real-time events, and critical workflows
 */

import request from "supertest";
import axios from "axios";
import { io as ioClient } from "socket.io-client";

const BASE_URL = "http://localhost:5000";
const API_URL = `${BASE_URL}/api`;

/**
 * Test Suite 1: Authentication & Authorization
 */
describe("Authentication & Authorization", () => {
  let authToken;
  let restaurantId;

  test("POST /auth/register - Register new restaurant", async () => {
    const response = await request(BASE_URL)
      .post("/api/auth/register")
      .send({
        name: "Test Restaurant",
        email: `test-${Date.now()}@example.com`,
        password: "TestPassword123!",
        phone: "+1234567890",
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
    authToken = response.body.data.token;
    restaurantId = response.body.data.restaurant._id;
  });

  test("POST /auth/login - Login with credentials", async () => {
    const response = await request(BASE_URL)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "TestPassword123!",
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
  });

  test("GET /dashboard/:restaurantId - Requires authentication", async () => {
    // Without token
    await request(BASE_URL).get(`/api/dashboard/${restaurantId}`).expect(401);

    // With token
    const response = await request(BASE_URL)
      .get(`/api/dashboard/${restaurantId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
  });
});

/**
 * Test Suite 2: Menu Management
 */
describe("Menu Management", () => {
  let restaurantId = "test-restaurant-id";
  let authToken = "test-token";
  let menuItemId;

  test("GET /menu/:restaurantId - Fetch menu items", async () => {
    const response = await request(BASE_URL)
      .get(`/api/menu/${restaurantId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test("POST /menu - Create menu item", async () => {
    const response = await request(BASE_URL)
      .post("/api/menu")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Burger Deluxe",
        category: "Burgers",
        price: 599,
        description: "Premium burger with cheese",
        isAvailable: true,
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    menuItemId = response.body.data._id;
  });

  test("PUT /menu/:itemId - Update menu item", async () => {
    const response = await request(BASE_URL)
      .put(`/api/menu/${menuItemId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        price: 699,
        isAvailable: true,
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.price).toBe(699);
  });

  test("GET /menu/:restaurantId?search=burger - Search menu items", async () => {
    const response = await request(BASE_URL)
      .get(`/api/menu/${restaurantId}?search=burger`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
  });
});

/**
 * Test Suite 3: Order Management
 */
describe("Order Management", () => {
  let restaurantId = "test-restaurant-id";
  let authToken = "test-token";
  let orderId;

  test("POST /orders - Create new order", async () => {
    const response = await request(BASE_URL)
      .post("/api/orders")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        restaurantId,
        tableId: "table-1",
        items: [
          {
            itemId: "item-1",
            quantity: 2,
            price: 599,
            name: "Burger",
          },
        ],
        totalAmount: 1198,
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("pending");
    orderId = response.body.data._id;
  });

  test("GET /orders/:orderId - Fetch order details", async () => {
    const response = await request(BASE_URL)
      .get(`/api/orders/${orderId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data._id).toBe(orderId);
  });

  test("PUT /orders/:orderId - Update order status", async () => {
    const response = await request(BASE_URL)
      .put(`/api/orders/${orderId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        status: "confirmed",
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("confirmed");
  });

  test("GET /orders?restaurantId=X - List orders with filtering", async () => {
    const response = await request(BASE_URL)
      .get(`/api/orders?restaurantId=${restaurantId}&status=confirmed`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test("POST /orders/:orderId/cancel - Cancel order", async () => {
    const response = await request(BASE_URL)
      .post(`/api/orders/${orderId}/cancel`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
  });
});

/**
 * Test Suite 4: Billing & Payments
 */
describe("Billing & Payments", () => {
  let restaurantId = "test-restaurant-id";
  let authToken = "test-token";
  let billId;

  test("POST /bills - Create bill from order", async () => {
    const response = await request(BASE_URL)
      .post("/api/bills")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        orderId: "order-123",
        restaurantId,
        totalAmount: 1198,
        taxAmount: 120,
        discountAmount: 0,
        finalAmount: 1318,
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.paymentStatus).toBe("pending");
    billId = response.body.data._id;
  });

  test("POST /bills/:billId/pay - Process payment", async () => {
    const response = await request(BASE_URL)
      .post(`/api/bills/${billId}/pay`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        paymentMethod: "card",
        amount: 1318,
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.paymentStatus).toBe("completed");
  });

  test("GET /bills?restaurantId=X - List bills with pagination", async () => {
    const response = await request(BASE_URL)
      .get(`/api/bills?restaurantId=${restaurantId}&page=1&limit=10`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.pagination).toBeDefined();
  });
});

/**
 * Test Suite 5: Table Management
 */
describe("Table Management", () => {
  let restaurantId = "test-restaurant-id";
  let authToken = "test-token";

  test("GET /tables/:restaurantId - Fetch all tables", async () => {
    const response = await request(BASE_URL)
      .get(`/api/tables/${restaurantId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test("PUT /tables/:tableId - Update table status", async () => {
    const response = await request(BASE_URL)
      .put("/api/tables/table-1")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        status: "occupied",
        staffId: "staff-1",
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("occupied");
  });
});

/**
 * Test Suite 6: Real-Time Socket.io Integration
 */
describe("Real-Time Socket.io Events", () => {
  let socket;
  let socketConnected = false;

  beforeAll((done) => {
    socket = ioClient(`http://localhost:5000`, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      socketConnected = true;
      done();
    });

    socket.on("disconnect", () => {
      socketConnected = false;
    });
  });

  afterAll(() => {
    socket.close();
  });

  test("Socket connection established", () => {
    expect(socketConnected).toBe(true);
  });

  test("Receive order:created event", (done) => {
    socket.on("order:created", (data) => {
      expect(data).toHaveProperty("orderId");
      expect(data).toHaveProperty("order");
      done();
    });

    // Simulate order creation from another client
    socket.emit("order:create", {
      tableId: "table-1",
      items: [{ itemId: "item-1", quantity: 1 }],
    });
  });

  test("Receive order:status_changed event", (done) => {
    socket.on("order:status_changed", (data) => {
      expect(data).toHaveProperty("orderId");
      expect(data).toHaveProperty("status");
      done();
    });

    socket.emit("order:update_status", {
      orderId: "order-123",
      status: "confirmed",
    });
  });

  test("Receive table:status_changed event", (done) => {
    socket.on("table:status_changed", (data) => {
      expect(data).toHaveProperty("tableId");
      expect(data).toHaveProperty("status");
      done();
    });

    socket.emit("table:update_status", {
      tableId: "table-1",
      status: "occupied",
    });
  });

  test("Receive notification event", (done) => {
    socket.on("notification:send", (data) => {
      expect(data).toHaveProperty("message");
      done();
    });

    socket.emit("notification:new", {
      type: "order_ready",
      message: "Order #123 is ready",
    });
  });
});

/**
 * Test Suite 7: Rate Limiting
 */
describe("Rate Limiting Protection", () => {
  test("Auth endpoint rate limiting - Allow 5 attempts per 15 min", async () => {
    let successCount = 0;
    let blockedCount = 0;

    for (let i = 0; i < 10; i++) {
      const response = await request(BASE_URL).post("/api/auth/login").send({
        email: "test@example.com",
        password: "wrong-password",
      });

      if (response.status === 200 || response.status === 401) {
        successCount++;
      } else if (response.status === 429) {
        blockedCount++;
      }
    }

    expect(blockedCount).toBeGreaterThan(0);
  });

  test("Payment endpoint rate limiting - Allow 10 per 1 min", async () => {
    for (let i = 0; i < 12; i++) {
      const response = await request(BASE_URL)
        .post("/api/bills/bill-123/pay")
        .set("Authorization", `Bearer test-token`)
        .send({
          paymentMethod: "card",
          amount: 1000,
        });

      if (i > 9) {
        expect(response.status).toBe(429);
      }
    }
  });
});

/**
 * Test Suite 8: Input Validation
 */
describe("Input Validation & Security", () => {
  let authToken = "test-token";

  test("Reject invalid email format", async () => {
    const response = await request(BASE_URL)
      .post("/api/auth/register")
      .send({
        name: "Test",
        email: "invalid-email",
        password: "TestPassword123!",
        phone: "+1234567890",
      })
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  test("Reject weak password", async () => {
    const response = await request(BASE_URL)
      .post("/api/auth/register")
      .send({
        name: "Test",
        email: "test@example.com",
        password: "weak",
        phone: "+1234567890",
      })
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  test("Reject invalid phone number", async () => {
    const response = await request(BASE_URL)
      .post("/api/restaurants")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Test Restaurant",
        phone: "not-a-phone",
      })
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  test("Reject negative amount in bill", async () => {
    const response = await request(BASE_URL)
      .post("/api/bills")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        orderId: "order-123",
        totalAmount: -100,
      })
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  test("Prevent XSS in request body", async () => {
    const response = await request(BASE_URL)
      .post("/api/orders")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        tableId: "<script>alert('xss')</script>",
        items: [],
      })
      .expect(400);

    expect(response.body.success).toBe(false);
  });
});

/**
 * Test Suite 9: Caching Verification
 */
describe("Caching System", () => {
  let authToken = "test-token";
  let restaurantId = "test-restaurant-id";

  test("Menu data is cached after first request", async () => {
    const startTime = Date.now();
    const response1 = await request(BASE_URL)
      .get(`/api/menu/${restaurantId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);
    const time1 = Date.now() - startTime;

    const startTime2 = Date.now();
    const response2 = await request(BASE_URL)
      .get(`/api/menu/${restaurantId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);
    const time2 = Date.now() - startTime2;

    // Second request should be faster (cached)
    expect(time2).toBeLessThan(time1);
    expect(response1.body.data).toEqual(response2.body.data);
  });

  test("Dashboard analytics are cached", async () => {
    const response = await request(BASE_URL)
      .get(`/api/dashboard/${restaurantId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(response.get("x-cache")).toBe("HIT");
  });
});

/**
 * Test Suite 10: Error Handling
 */
describe("Error Handling & Status Codes", () => {
  let authToken = "test-token";

  test("404 for non-existent endpoint", async () => {
    const response = await request(BASE_URL)
      .get("/api/non-existent")
      .expect(404);

    expect(response.body.success).toBe(false);
  });

  test("401 for missing authentication", async () => {
    const response = await request(BASE_URL)
      .get("/api/dashboard/test")
      .expect(401);

    expect(response.body.success).toBe(false);
  });

  test("500 error includes error details in dev mode", async () => {
    // Trigger server error with invalid data
    const response = await request(BASE_URL)
      .post("/api/orders")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        restaurantId: null,
      })
      .expect(500);

    expect(response.body.success).toBe(false);
  });
});

/**
 * Test Suite 11: Performance Metrics
 */
describe("Performance Metrics", () => {
  let authToken = "test-token";

  test("API response time < 500ms", async () => {
    const startTime = Date.now();
    await request(BASE_URL).get("/api/health").expect(200);
    const responseTime = Date.now() - startTime;

    expect(responseTime).toBeLessThan(500);
  });

  test("GET /menu response time < 300ms", async () => {
    const startTime = Date.now();
    await request(BASE_URL)
      .get("/api/menu/test-restaurant")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);
    const responseTime = Date.now() - startTime;

    expect(responseTime).toBeLessThan(300);
  });

  test("Database query returns results", async () => {
    const response = await request(BASE_URL)
      .get("/api/orders?restaurantId=test")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.data).toBeDefined();
  });
});

/**
 * Test Suite 12: Health Check Endpoints
 */
describe("Health Check Endpoints", () => {
  test("GET /health - Returns system status", async () => {
    const response = await request(BASE_URL).get("/api/health").expect(200);

    expect(response.body).toHaveProperty("status");
    expect(response.body).toHaveProperty("timestamp");
    expect(response.body).toHaveProperty("uptime");
    expect(response.body).toHaveProperty("database");
  });

  test("GET /health/ready - Returns readiness status", async () => {
    const response = await request(BASE_URL)
      .get("/api/health/ready")
      .expect(200);

    expect(response.body).toHaveProperty("ready");
  });

  test("GET /health/live - Returns liveness status", async () => {
    const response = await request(BASE_URL)
      .get("/api/health/live")
      .expect(200);

    expect(response.body).toHaveProperty("alive");
  });

  test("GET /health/memory - Returns memory metrics", async () => {
    const response = await request(BASE_URL)
      .get("/api/health/memory")
      .expect(200);

    expect(response.body).toHaveProperty("process");
    expect(response.body).toHaveProperty("system");
  });
});

export default {
  // Exported for running specific test suites
};
