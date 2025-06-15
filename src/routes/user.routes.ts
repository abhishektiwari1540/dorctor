import { Router } from "express";
import { checkJwt } from "../middlewares/checkJwt";
import { checkRole } from "../middlewares/checkRole";
import { UserRole } from "../entities/user.entity";
import { body } from "express-validator";
import { UsersController } from "../controllers/users.controller";

const router = Router();

// Convert NestJS controller methods to Express handlers
const wrapAsync = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Test route
router.get('/test', (req, res) => {
  res.send('Test route working');
});

// Get all users
router.get(
  "/",
  [checkJwt, checkRole([UserRole.PARTNER])],
  wrapAsync(async (req, res) => {
    const result = await UsersController.prototype.listAll();
    res.json(result);
  })
);

// Get one user
router.get(
  "/:id",
  [checkJwt, checkRole([UserRole.PARTNER])],
  wrapAsync(async (req, res) => {
    const result = await UsersController.prototype.getOneById(req.params);
    res.json(result);
  })
);

// Create new user
router.post(
  "/",
  [
    checkJwt,
    checkRole([UserRole.PARTNER]),
    body("countryCode").isString().isLength({ min: 1, max: 5 }),
    body("phone").isString().isLength({ min: 10, max: 15 }),
    body("name").optional().isString().isLength({ min: 2, max: 100 }),
    body("email").optional().isEmail(),
    body("age").optional().isInt({ min: 1, max: 120 }),
    body("password").optional().isLength({ min: 8 }),
    body("role").optional().isIn([UserRole.PATIENT, UserRole.PARTNER]),
  ],
  wrapAsync(async (req, res) => {
    const result = await UsersController.prototype.newUser(req.body);
    res.status(201).json(result);
  })
);

// Edit user
// router.patch(
//   "/:id",
//   [
//     checkJwt,
//     checkRole([UserRole.PARTNER]),
//     body("name").optional().isString().isLength({ min: 2, max: 100 }),
//     body("email").optional().isEmail(),
//     body("age").optional().isInt({ min: 1, max: 120 }),
//   ],
//   wrapAsync(async (req, res) => {
//     const params = { ...req.params, ...req.body };
//     const result = await UsersController.prototype.editUser(params);
//     res.json(result);
//   })
// );

// Delete user
router.delete(
  "/:id",
  [checkJwt, checkRole([UserRole.PARTNER])],
  wrapAsync(async (req, res) => {
    const result = await UsersController.prototype.deleteUser(req.params);
    res.json(result);
  })
);

// OTP routes (no authentication needed)
router.post(
  "/send-otp",
  wrapAsync(async (req, res) => {
    const result = await UsersController.prototype.sendOtp(req.body);
    res.json(result);
  })
);

// Error handling middleware
router.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(500).json({ message: err.message });
});

export default router;