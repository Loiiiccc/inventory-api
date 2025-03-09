const request = require("supertest");
const app = require("../server"); // Import your Express app

describe("Authentication Tests", () => {
    it("should register a user", async () => {
        const res = await request(app)
            .post("/register")
            .send({ name: "Test User", email: "test@example.com", password: "password123" });

        expect(res.statusCode).toBe(201);
        expect(res.body.user).toHaveProperty("email", "test@example.com");
    });

    it("should not allow duplicate emails", async () => {
        const res = await request(app)
            .post("/register")
            .send({ name: "Test User", email: "test@example.com", password: "password123" });

        expect(res.statusCode).toBe(400);
    });
});
