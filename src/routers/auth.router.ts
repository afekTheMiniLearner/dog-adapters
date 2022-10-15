import express from 'express';
import passport from 'passport';

import {
    createNewUserCtrl,
    getUserByIdCtrl,
} from '../controllers/user.controller';
import { isAuthenticatedMW } from '../middleware/auth.middleware';
import { logRequestedUrlMW } from '../middleware/genral.middleware';

const router = express.Router();

router.use(logRequestedUrlMW);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: ['Auth operations']
 *     description: Login to the application
 *     requestBody:
 *        description: The user information for login
 *        required: true
 *        content:
 *           application/json:
 *               schema:
 *                  type: object
 *                  required: [ "username", "password" ]
 *                  properties:
 *                      username:
 *                          type: String
 *                          example: Hadriel Benjo
 *                      password:
 *                          type: string
 *                          example: '0000'
 *     responses:
 *       200:
 *           description: login successfully
 *           headers:
 *               Set-Cookie:
 *                   schema:
 *                       type: string
 *                       example: connect.sid=fd4698c940c6d1da602a70ac34f0b147; Path=/; HttpOnly
 *       500:
 *          description: login rejected
 *       400:
 *          description: bad request - missing data
 */
router.post(
    '/login',
    passport.authenticate('local', {
        successRedirect: '/home.html', //'http://localhost:3000/home.html',
        failureRedirect: '/login.html', //'http://localhost:3000/login.html',
    })
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: ['Auth operations']
 *     description: Logout from the application
 *     responses:
 *       200:
 *           description: logout successfully
 *       500:
 *          description: error in the logout  procces
 */
router.post('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) return next(err);
        res.redirect('/login.html');
    });
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: ['Auth operations']
 *     description: Register a new user to the application
 *     requestBody:
 *        description: the user information for registering
 *        required: true
 *        content:
 *           application/json:
 *               schema:
 *                  type: object
 *                  required: [ "username", "password" ]
 *                  properties:
 *                      username:
 *                          type: String
 *                          example: Hadriel Benjo
 *                      password:
 *                          type: string
 *                          example: '0000'
 *                      fullName:
 *                          type: string
 *                          example:
 *                      phoneNumber:
 *                          type: string
 *                          example:
 *     responses:
 *       200:
 *         description: Returns the requested user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/user"
 *       500:
 *          description: "Server error"
 *
 */
router.post('/register', createNewUserCtrl);

/**
 * @swagger
 * /auth/{userId}:
 *   get:
 *     tags: ['Auth operations']
 *     description: Get a user by userId
 *     security:
 *        cookieAuth:
 *          - connect.sid
 *     parameters:
 *      - in: path
 *        name: userId
 *        required: true
 *        type: string
 *        description: The user ID.
 *      - in: cookie
 *        name: connect.sid
 *        schema:
 *          type: String
 *     responses:
 *       200:
 *         description: return the user doc data
 *       302:
 *         description: unauthenticated user - redirect to login page
 */
router.get('/:userId', isAuthenticatedMW, getUserByIdCtrl);
//add mw isAdmin and use it here

export = router;
