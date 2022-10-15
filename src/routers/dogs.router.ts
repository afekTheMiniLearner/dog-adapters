import express, { NextFunction, Request, Response } from 'express';

import {
    getDogByIdCtrl,
    filterDogFromQueryCtrl,
    updateDogCtrl,
    createNewDogCtrl,
    deleteDogByIdCtrl,
} from '../controllers/dogs.controller';
import { isAuthenticatedMW } from '../middleware/auth.middleware';
import {
    validateOwnerMW,
    validateAndConvertQuery,
} from '../middleware/dogs.middleware';
import { logRequestedUrlMW } from '../middleware/genral.middleware';

const router = express.Router();

router.use(logRequestedUrlMW);

/**
 * @swagger
 * /dogs/{dogId}:
 *   get:
 *     tags: ['Dog CRUD operations']
 *     description: get dog data by dogId
 *     parameters:
 *      - in: path
 *        name: dogId
 *        required: true
 *        type: string
 *        description: The dog ID.
 *     responses:
 *       200:
 *         description: return the dog doc data
 *         content:
 *           application/json:
 *               schema:
 *                  $ref: "#/components/schemas/dog"
 *       302:
 *         description: unauthenticated user - redirect to login page
 */
router.get('/:dogId', getDogByIdCtrl);

/**
 * @swagger
 * /dogs/:
 *   get:
 *     tags: ['Dog CRUD operations']
 *     description: get dogs list data by filtering with parameters
 *     parameters:
 *      - in: query
 *        name: page
 *        required: true
 *        schema:
 *          type: integer
 *          minimum: 1
 *        description: get result from page number
 *      - in: query
 *        name: itemsPerPage
 *        required: true
 *        schema:
 *          type: integer
 *          minimum: 1
 *          maximum: 100
 *        description: get result items of page the number
 *      - in: query
 *        name: status
 *        type: number
 *        enum: [0, 1]
 *        description: filter by dog's status (0-free to adopt, 1-is taken)..
 *      - in: query
 *        name: gender
 *        type: string
 *        enum: ['F','M']
 *        description: filter by dog's gender (F-female dog, M-male dog).
 *      - in: query
 *        name: race
 *        type: string
 *        description: filter by dog's race.
 *      - in: query
 *        name: minAge
 *        schema:
 *          type: integer
 *          minimum: 1
 *          maximum: 20
 *        description: filter by minimum dog's age
 *      - in: query
 *        name: maxAge
 *        schema:
 *          type: integer
 *          minimum: 1
 *          maximum: 20
 *        description: filter by maximum dog's age
 *      - in: query
 *        name: name
 *        schema:
 *          type: string
 *        description: filter by dog's name if it's includes this string
 *      - in: query
 *        name: sortByStatus
 *        type: integer
 *        enum: [-1, 1]
 *        description: sort the result by status
 *      - in: query
 *        name: sortByGender
 *        type: integer
 *        enum: [-1, 1]
 *        description: sort the result by gender
 *      - in: query
 *        name: sortByRace
 *        type: integer
 *        enum: [-1, 1]
 *        description: sort the result by race
 *      - in: query
 *        name: sortByAge
 *        type: integer
 *        enum: [-1, 1]
 *        description: sort the result by age
 *      - in: query
 *        name: sortByName
 *        type: integer
 *        enum: [-1, 1]
 *        description: sort the result by name
 *      - in: query
 *        name: sortByLastUpdated
 *        type: integer
 *        enum: [-1, 1]
 *        description: sort the result by last update date
 *     responses:
 *       200:
 *         description: return the dog doc data
 *         content:
 *           application/json:
 *               schema:
 *                  type: object
 *                  properties:
 *                      pagination:
 *                          $ref: "#/components/schemas/pagination"
 *                      data:
 *                          type: array
 *                          items:
 *                             $ref: "#/components/schemas/dog"
 *       500:
 *         description: Internal Server Error
 */
router.get('/', validateAndConvertQuery, filterDogFromQueryCtrl);

/**
 * @swagger
 * /dogs/:
 *   post:
 *     tags: ['Dog CRUD operations']
 *     description: update dog data by dogId
 *     security:
 *        cookieAuth:
 *          - connect.sid
 *     parameters:
 *      - in: cookie
 *        name: connect.sid
 *        schema:
 *          type: String
 *     requestBody:
 *        description: create a new dog
 *        required: true
 *        content:
 *           application/json:
 *               schema:
 *                  $ref: "#/components/schemas/dog"
 *     responses:
 *       201:
 *         description: return the dog doc data
 *         content:
 *           application/json:
 *               schema:
 *                  $ref: "#/components/schemas/dog"
 *       302:
 *         description: unauthenticated user - redirect to login page
 *       500:
 *         description: Internal Server Error
 */
router.post('/', isAuthenticatedMW, createNewDogCtrl);

/**
 * @swagger
 * /dogs/{dogId}:
 *   put:
 *     tags: ['Dog CRUD operations']
 *     description: update dog data by dogId
 *     security:
 *        cookieAuth:
 *          - connect.sid
 *     parameters:
 *      - in: path
 *        name: dogId
 *        required: true
 *        type: string
 *        description: The dog ID.
 *      - in: cookie
 *        name: connect.sid
 *        schema:
 *          type: String
 *     requestBody:
 *        description: update dog information
 *        required: true
 *        content:
 *           application/json:
 *               schema:
 *                  $ref: "#/components/schemas/dog"
 *     responses:
 *       206:
 *         description: return the dog doc data
 *         content:
 *           application/json:
 *               schema:
 *                  $ref: "#/components/schemas/dog"
 *       500:
 *         description: Unauthorized user!
 */
router.put('/:dogId', isAuthenticatedMW, validateOwnerMW, updateDogCtrl);

/**
 * @swagger
 * /dogs/{dogId}:
 *   delete:
 *     tags: ['Dog CRUD operations']
 *     description: remove dog data by dogId
 *     security:
 *        cookieAuth:
 *          - connect.sid
 *     parameters:
 *      - in: path
 *        name: dogId
 *        required: true
 *        type: string
 *        description: The dog ID.
 *      - in: cookie
 *        name: connect.sid
 *        schema:
 *          type: String
 *     responses:
 *       200:
 *         description: dog deleted successfully
 *       302:
 *         description: unauthenticated user - redirect to login page
 *       500:
 *         description: Internal Server Error
 */
router.delete('/:dogId', isAuthenticatedMW, validateOwnerMW, deleteDogByIdCtrl);
//add admin only mw here

//todo add route of races distincts by schema its an option

export = router;
