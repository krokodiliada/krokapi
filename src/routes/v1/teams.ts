/**
 * @openapi
 *  tags:
 *    name: Teams
 *    description: API to manage teams.
 */

/**
 * @openapi
 *  components:
 *    schemas:
 *      Team:
 *        type: object
 *        required:
 *          - name
 *          - participants
 *          - event
 *          - category
 *        properties:
 *          name:
 *            type: string
 *            description: Team name
 *          participants:
 *            type: array
 *            items:
 *              type: string
 *              description: Participant unique identifier
 *          event:
 *            type: string
 *            description: Event unique identifier
 *          category:
 *            type: string
 *            description: Category unique identifier
 *          extraMapRequired:
 *            type: boolean
 *            default: false
 *            description: True when the team requested an additional map
 *          createdAt:
 *            type: string
 *            format: date
 *            description: The date of the record creation.
 *          updatedAt:
 *            type: string
 *            format: date
 *            description: The date when the record was last updated.
 *        example:
 *          _id: "5f90acf8b54764421b7160ad"
 *          name: "Capital fine hard"
 *          participants: [
 *            "5f8d0d55b54764421b715b60",
 *            "5f8d0d55b54764421b715b61"
 *          ]
 *          event: "5f8d04b3b54764421b7156dc"
 *          category: "5f8d04f7b54764421b7156df"
 *          createdAt: "2019-09-22T06:00:00.000Z"
 *          updatedAt: "2019-09-22T06:00:00.000Z"
 *    parameters:
 *      teamId:
 *        in: path
 *        name: teamId
 *        schema:
 *          type: string
 *        required: true
 *        description: Unique identifier of the team
 */

import express from "express";
import GenericController from "controller/Common";
import TeamController from "controller/Team";

// Router for /teams/ api
const router = express.Router();
const participantsRouter = express.Router({ mergeParams: true });
const teamRouteRouter = express.Router({ mergeParams: true });
const waterRouteRouter = express.Router({ mergeParams: true });

router.param("id", GenericController.validateObjectId);
router.param("id", TeamController.validateTeamExists);

// Disallow the following methods
router.post("/:id", GenericController.disallowMethod);

// Router for /teams/

/**
 * @openapi
 *  paths:
 *    /teams:
 *      get:
 *        summary: Get a list of teams.
 *        tags: [Teams]
 *        parameters:
 *          - in: query
 *            name: event
 *            schema:
 *              type: string
 *            required: false
 *            description: Event unique identifier
 *          - in: query
 *            name: category
 *            schema:
 *              type: string
 *            required: false
 *            description: Category unique identifier
 *        responses:
 *          '200':
 *            description: A JSON array of all teams
 *            content:
 *              application/json:
 *                schema:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/Team'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.get("/", TeamController.getAll);

/**
 * @openapi
 *  paths:
 *    /teams/{teamId}:
 *      get:
 *        summary: Get information about a single team.
 *        tags: [Teams]
 *        parameters:
 *          - $ref: '#/components/parameters/teamId'
 *        responses:
 *          '200':
 *            description: Team data
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/Team'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.get("/:id", TeamController.getById);

/**
 * @openapi
 *  paths:
 *    /teams:
 *      post:
 *        summary: Create team.
 *        tags: [Teams]
 *        requestBody:
 *          description: Team data
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Team'
 *              example:
 *                name: "Capital fine hard"
 *                participants: [
 *                  "5f8d0d55b54764421b715b60",
 *                  "5f8d0d55b54764421b715b61"
 *                ]
 *                event: "5f8d04b3b54764421b7156dc"
 *                category: "5f8d04f7b54764421b7156df"
 *        responses:
 *          '201':
 *            description: Team created
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/Team'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 */
router.post("/", TeamController.create);

/**
 * @openapi
 *  paths:
 *    /teams/{teamId}:
 *      patch:
 *        summary: Update team.
 *        tags: [Teams]
 *        parameters:
 *          - $ref: '#/components/parameters/teamId'
 *        requestBody:
 *          description: Team data to update
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Team'
 *              example:
 *                category: "5f8d04f7b54764421b7156df"
 *        responses:
 *          '200':
 *            description: Team updated
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/Team'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.patch("/:id", TeamController.update);

/**
 * @openapi
 *  paths:
 *    /teams/{teamId}:
 *      delete:
 *        summary: Delete team.
 *        tags: [Teams]
 *        parameters:
 *          - $ref: '#/components/parameters/teamId'
 *        responses:
 *          '204':
 *            description: Team has been deleted
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
router.delete("/:id", TeamController.deleteById);

// Router for /teams/:id/participants
router.use("/:id/participants", participantsRouter);

/**
 * @openapi
 *  paths:
 *    /teams/{teamId}/participants:
 *      get:
 *        summary: Get information about team's participants.
 *        tags: [Teams]
 *        parameters:
 *          - $ref: '#/components/parameters/teamId'
 *        responses:
 *          '200':
 *            description: List of participants for this team
 *            content:
 *              application/json:
 *                schema:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/Participant'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
participantsRouter.get("/", TeamController.getParticipants);

// Router for /teams/:id/route
router.use("/:id/route", teamRouteRouter);

/**
 * @openapi
 *  paths:
 *    /teams/{teamId}/route:
 *      get:
 *        summary: Get information about team's routes.
 *        tags: [Teams]
 *        parameters:
 *          - $ref: '#/components/parameters/teamId'
 *        responses:
 *          '200':
 *            description: List of routes for this team
 *            content:
 *              application/json:
 *                schema:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/Route'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
teamRouteRouter.get("/", TeamController.getRoute);

// Router for /teams/:id/route-water
router.use("/:id/route-water", waterRouteRouter);

/**
 * @openapi
 *  paths:
 *    /teams/{teamId}/route-water:
 *      get:
 *        summary: Get information about team's water route.
 *        tags: [Teams]
 *        parameters:
 *          - $ref: '#/components/parameters/teamId'
 *        responses:
 *          '200':
 *            description: Information about the team's water route
 *            content:
 *              application/json:
 *                schema:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/RouteWater'
 *          '400':
 *            $ref: '#/components/responses/BadRequest'
 *          '401':
 *            $ref: '#/components/responses/Unauthorized'
 *          '404':
 *            $ref: '#/components/responses/NotFound'
 */
waterRouteRouter.get("/", TeamController.getWaterRoute);

export default router;
