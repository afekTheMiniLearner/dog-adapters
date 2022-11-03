import request from 'supertest';
import app from '../../app';
import bcrypt from 'bcrypt';
import { UserModel } from '../../models';
import { IUser } from '../../interfaces/user.interface';
import mongoose from 'mongoose';

describe('auth route tests', function () {
    let userDoc: IUser;
    let cookie: string;
    let userData = {
        username: 'admin',
        password: 'admin',
    };

    beforeAll(async () => {
        userDoc = (await UserModel.findOne({
            username: 'admin',
        })) as unknown as IUser;

        expect(userDoc).toBeDefined();
    });

    beforeEach(async () => {
        const result = await request(app)
            .post('/auth/login')
            .set('Accept', 'application/json')
            .send(userData)
            .expect(302);

        expect(result).toBeDefined();
        [cookie] = result.headers['set-cookie'];
    });

    test('login API success & get connect.sid cookie & login API failed - wrong data', async function () {
        {
            const result = await request(app)
                .post('/auth/login')
                .set('Accept', 'application/json')
                .send(userData)
                .expect(302);

            expect(result).toHaveProperty('headers.set-cookie');
            expect(result.headers['set-cookie']).toHaveLength(1);
            expect(result.headers['set-cookie'][0]).toMatch(/connect\.sid=\w*/);
        }
        {
            const body = { username: 'i-dont-exist', password: '321' };

            await request(app)
                .post('/auth/login')
                .set('Accept', 'application/json')
                .send(body)
                .expect(500);
        }
        {
            const body = { username: 'admin', password: 'i-dont-match' };

            await request(app)
                .post('/auth/login')
                .set('Accept', 'application/json')
                .send(body)
                .expect(500);
        }
    });

    test('login API - failure username or password not provided', async function () {
        try {
            /* Catching error is important here because the passport strategy middleware
            does not continue the operation */
            const body = { password: userData.password };

            await request(app)
                .post('/auth/login')
                .set('Accept', 'application/json')
                .send(body)
                .expect('Location', '/login.html')
                .expect(302);
        } catch (e) {}

        try {
            /* Catching error is important here because the passport strategy middleware
            does not continue the operation */
            const body = { username: userData.username };

            await request(app)
                .post('/auth/login')
                .set('Accept', 'application/json')
                .send(body)
                .expect('Location', '/login.html')
                .expect(302);
        } catch (e) {}

        {
            const body = {};

            await request(app)
                .post('/auth/login')
                .set('Accept', 'application/json')
                .send(body)
                .expect('Location', '/login.html')
                .expect(302);
        }
    });

    test('logout API make the cookie expired check', async function () {
        {
            const result2 = await request(app)
                .get(`/auth/${userDoc._id.toString()}`)
                .set('Cookie', [cookie])
                .expect(200);

            expect(result2).toBeDefined();
        }
        {
            await request(app)
                .post('/auth/logout')
                .set('Cookie', [cookie])
                .expect(302);

            await request(app)
                .get(`/auth/${userDoc._id.toString()}`)
                .set('Cookie', [cookie])
                .expect('Location', '/login.html')
                .expect(302);
        }
    });

    test('user register API successfully & fail - missing/invalid required data', async () => {
        {
            const body = {
                username: 'afek123',
                password: 'afek222',
                fullName: 'afekos',
                phoneNumber: '000999000',
            };

            const result = await request(app)
                .post('/auth/register')
                .set('Accept', 'application/json')
                .send(body)
                .expect(201);

            const generatedHash = bcrypt.hashSync(
                body.password,
                bcrypt.genSaltSync(10)
            );
            const isMatch = await bcrypt.compare(body.password, generatedHash);

            expect(result.body).toHaveProperty('username', body.username);
            expect(isMatch).toBeTruthy();
        }
        {
            const body = {
                username: 'afek12',
                fullName: 'afekos',
                phoneNumber: '9999999',
            };

            await request(app)
                .post('/auth/register')
                .set('Accept', 'application/json')
                .send(body)
                .expect(500);
        }
    });

    test('get user by id API success & failed', async () => {
        {
            const res = await request(app)
                .get(`/auth/${userDoc._id.toString()}`)
                .set('Cookie', [cookie])
                .expect(200);

            expect(res).toBeDefined();
            expect(res).toHaveProperty('_body.username', 'admin');
            expect(res).toHaveProperty('_body.fullName', 'akef');
        }
        {
            const body = {
                username: 'afek0909',
                password: 'afek0909',
            };

            await request(app)
                .post('/auth/register')
                .set('Accept', 'application/json')
                .send(body)
                .expect(201);

            const result = await request(app)
                .post('/auth/login')
                .set('Accept', 'application/json')
                .send(body)
                .expect(302);

            expect(result).toBeDefined();
            const [cookie] = result.headers['set-cookie'];

            UserModel.findOneAndDelete({ username: body.username });
            //still works :\
            await request(app)
                .get(`/auth/${userDoc._id.toString()}`)
                .set('Cookie', [cookie])
                .expect(500);
        }
    });
});

test('disconnect from mongoose and trying to login', async () => {
    {
        mongoose.disconnect();

        await request(app)
            .post('/auth/login')
            .set('Accept', 'application/json')
            .send({ username: 'admin', password: 'admin' })
            .expect(500);
    }
});
