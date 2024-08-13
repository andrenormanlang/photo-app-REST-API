"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserRules = exports.getUserByEmail = void 0;
/**
 * Validation Rules for User resource
 */
const express_validator_1 = require("express-validator");
//import { getUserByEmail } from "../services/user_service";
// problemas nessa importacao
const prisma_1 = __importDefault(require("../prisma"));
const getUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.user.findUnique({
        where: {
            email: email,
        }
    });
});
exports.getUserByEmail = getUserByEmail;
exports.createUserRules = [
    (0, express_validator_1.body)("email").isEmail().custom((value) => __awaiter(void 0, void 0, void 0, function* () {
        // check if a User with that email already exists
        const user = yield (0, exports.getUserByEmail)(value);
        if (user) {
            // user already exists, throw a hissy-fit
            return Promise.reject("Email already exists");
        }
    })),
    (0, express_validator_1.body)("password").isString().bail().isLength({ min: 6 }),
    (0, express_validator_1.body)("first_name").isString().bail().isLength({ min: 3 }),
    (0, express_validator_1.body)("last_name").isString().bail().isLength({ min: 3 }),
];