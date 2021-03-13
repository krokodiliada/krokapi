/**
 * @openapi
 *  tags:
 *    name: Categories
 *    description: API to manage categories.
 */

/**
 * @openapi
 *  components:
 *    schemas:
 *      Category:
 *        type: object
 *        required:
 *          - name
 *        properties:
 *          name:
 *            required:
 *              - short
 *              - long
 *            properties:
 *              short:
 *                type: string
 *                description: Short name of the category
 *              long:
 *                type: string
 *                description: Long name of the category
 *          description:
 *            type: string
 *            description: Category description
 *          participantsNumber:
 *            properties:
 *              min:
 *                type: integer
 *                default: 1
 *                description: Minimum number of participants in a team for
 *                             this category
 *              max:
 *                type: integer
 *                default: 5
 *                description: Maximum number of participants in a team for
 *                             this category
 *          minCheckpoints:
 *            type: integer
 *            default: 0
 *            description: Minimum number of checkpoints required to take
 *                         in this category. Otherwise the team will be
 *                         disqualified.
 *          maxTime:
 *            type: integer
 *            default: 10
 *            description: Maximum time allowed for a team to finish
 *                         in this category. Specified in hours.
 *          price:
 *            type: number
 *            default: 0
 *            description: How much it costs to participate in this category.
 *          notes:
 *            type: string
 *            description: Some additional information for this category
 *          createdAt:
 *            type: string
 *            format: date
 *            description: The date of the record creation.
 *          updatedAt:
 *            type: string
 *            format: date
 *            description: The date when the record was last updated.
 *        example:
 *          _id: "5f8d04f7b54764421b7156e6"
 *          name: {
 *            short: "L",
 *            long: "Ligero",
 *          }
 *          participantsNumber: {
 *            min: 3,
 *            max: 6,
 *          }
 *          minCheckpoints: 3
 *          createdAt: "2019-09-22T06:00:00.000Z"
 *          updatedAt: "2019-09-22T06:00:00.000Z"
 *    parameters:
 *      categoryId:
 *        in: path
 *        name: categoryId
 *        schema:
 *          type: string
 *        required: true
 *        description: Unique identifier of the category
 */

import express from "express";
import CategoryController from "controller/Category";
import GenericController from "controller/Common";

// Categories router
const router = express.Router();

router.param("id", GenericController.validateObjectId);
router.param("id", CategoryController.validateCategoryExists);

// Router for /categories/

/**
 * @openapi
 *  paths:
 *    /categories:
 *      get:
 *        summary: Get a list of categories.
 *        tags: [Categories]
 *        parameters:
 *          - in: query
 *            name: event
 *            schema:
 *              type: string
 *            required: false
 *            description: Event unique identifier
 *        responses:
 *          '200':
 *            description: A JSON array of all categories
 *            content:
 *              application/json:
 *                schema:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/Category'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.get("/", CategoryController.getAll);

/**
 * @openapi
 *  paths:
 *    /categories/{categoryId}:
 *      get:
 *        summary: Get information about a single category.
 *        tags: [Categories]
 *        parameters:
 *          - $ref: '#/components/parameters/categoryId'
 *        responses:
 *          '200':
 *            description: Category data
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/Category'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.get("/:id", CategoryController.getById);

/**
 * @openapi
 *  paths:
 *    /categories:
 *      post:
 *        summary: Create category.
 *        tags: [Categories]
 *        requestBody:
 *          description: Category data
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Category'
 *              example:
 *                name: {
 *                  short: "L",
 *                  long: "Ligero",
 *                }
 *        responses:
 *          '201':
 *            description: Category created
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/Category'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 */
router.post("/", CategoryController.create);

/**
 * @openapi
 *  paths:
 *    /categories/{categoryId}:
 *      patch:
 *        summary: Update category.
 *        tags: [Categories]
 *        parameters:
 *          - $ref: '#/components/parameters/categoryId'
 *        requestBody:
 *          description: Category data to update
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Category'
 *              example:
 *                participantsNumber: {
 *                  min: 3,
 *                  max: 6,
 *                }
 *        responses:
 *          '200':
 *            description: Category updated
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/Category'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.patch("/:id", CategoryController.update);

/**
 * @openapi
 *  paths:
 *    /categories/{categoryId}:
 *      delete:
 *        summary: Delete category.
 *        tags: [Categories]
 *        parameters:
 *          - $ref: '#/components/parameters/categoryId'
 *        responses:
 *          '204':
 *            description: Category has been deleted
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.delete("/:id", CategoryController.deleteById);

export default router;
