import request from 'supertest';
import app from '../../app';
import { IDog } from '../../interfaces/dog.interface';
import { IUser } from '../../interfaces/user.interface';
import { DogModel, UserModel } from '../../models';

describe('dogs route tests', function () {
    let exampleUserDoc: IUser;
    let exampleDogDoc: IDog;
    let cookie: string;
    let exampleDogId: string;
    let exampleDogBody: IDog;

    beforeAll(async () => {
        exampleUserDoc = (await UserModel.findOne({
            username: 'admin',
        })) as IUser;
        expect(exampleUserDoc).toBeDefined();

        const result = await request(app)
            .post('/auth/login')
            .set('Accept', 'application/json')
            .send({ username: 'admin', password: 'admin' })
            .expect(302);

        cookie = result.headers['set-cookie'][0];

        exampleDogBody = {
            owner: exampleUserDoc._id,
            adopter: null,
            race: 'mixed',
            gender: 'M',
            age: 10,
            vaccines: 3,
            behave: ['agressive'],
            name: 'charlie',
        } as unknown as IDog;

        const dog = new DogModel(exampleDogBody);
        const result2 = (await dog.save()) as unknown as IDog;

        exampleDogDoc = result2;
        exampleDogId = exampleDogDoc._id;
    });

    test('create dog API - success & failure (missing cookie)', async function () {
        {
            const body = {
                owner: null,
                adopter: null,
                race: 'mixed',
                gender: 'M',
                age: 5,
                vaccines: 5,
                behave: ['agressive'],
                name: 'winstone',
            } as unknown as IDog;

            const result = await request(app)
                .post('/dogs')
                .set('Accept', 'application/json')
                .send(body)
                .set('Cookie', [cookie])
                .expect(201);

            expect(result).toHaveProperty('_body.race', body.race);
            expect(result).toHaveProperty('_body.gender', body.gender);
            expect(result).toHaveProperty('_body.age', body.age);
            expect(result).toHaveProperty('_body.vaccines', body.vaccines);
            expect(result).toHaveProperty('_body.name', body.name);
            expect(result).toHaveProperty('_body.behave', body.behave);
        }
        {
            const body = {
                owner: null,
                adopter: null,
                race: 'mixed',
                gender: 'M',
                age: 9,
                vaccines: 4,
                behave: ['agressive'],
                name: 'evis',
            };

            await request(app)
                .post('/dogs')
                .set('Accept', 'application/json')
                .send(body)
                .expect(500);
        }
    });

    test('get dog by id API - success & failure (wrong id/missing cookie)', async function () {
        {
            const result = await request(app)
                .get(`/dogs/${exampleDogId}`)
                .set('Cookie', [cookie as string])
                .expect(200);

            expect(result).toHaveProperty('_body.race', 'mixed');
            expect(result).toHaveProperty('_body.gender', 'M');
            expect(result).toHaveProperty('_body.age', 10);
            expect(result).toHaveProperty('_body.vaccines', 3);
            expect(result).toHaveProperty('_body.name', 'charlie');
            expect(result).toHaveProperty('_body.behave', ['agressive']);
        }
    });

    test('update dog API - success with admin/owner & failure - wrong owner', async function () {
        {
            const updatedData = {
                gender: 'M',
                age: 11,
                vaccines: 3,
                behave: ['friendly'],
            };

            const updatedResult = await request(app)
                .put(`/dogs/${exampleDogId}`)
                .set('Accept', 'application/json')
                .send(updatedData)
                .set('Cookie', [cookie])
                .expect(206);

            expect(updatedResult).toHaveProperty('_body.gender', 'M');
            expect(updatedResult).toHaveProperty('_body.age', 11);
            expect(updatedResult).toHaveProperty('_body.vaccines', 3);
            expect(updatedResult).toHaveProperty('_body.behave', ['friendly']);
        }
        {
            await request(app)
                .post('/auth/logout')
                .set('Cookie', cookie)
                .expect(302);

            const result = await request(app)
                .post('/auth/login')
                .set('Accepts', 'application/json')
                .send({ username: 'user111', password: 'user111' })
                .expect(302);

            const cookie2 = result.headers['set-cookie'][0];

            const updatedData = {
                gender: 'M',
                age: 9,
                vaccines: 9,
                behave: ['friendly'],
            };

            await request(app)
                .put(`/dogs/${exampleDogId}`)
                .set('Accept', 'application/json')
                .set('Cookie', [cookie2])
                .send(updatedData)
                .expect(500);
        }
        {
            const updatedData = {
                gender: 'M',
                age: 8,
                vaccines: 8,
                behave: ['friendly'],
            };

            await request(app)
                .put(`/dogs/${exampleDogId}`)
                .set('Accept', 'application/json')
                .send(updatedData)
                .expect(500);
        }
        {
            await request(app).get(`/dogs/afek6+5`).expect(500);
        }
    });

    test('get dogs filter list API - success & empty page check & fail with wrong query check', async function () {
        {
            const url =
                '/dogs?page=1&itemsPerPage=10&race=Laotian&sortByGender=1&sortByAge=1';

            const {
                body: { data: filteredList },
            } = await request(app).get(url).expect(200);

            expect(filteredList.length).toBe(3);

            filteredList.forEach((dog: IDog) => {
                expect(dog).toHaveProperty('race', 'Laotian');
            });

            const ageSortCheck =
                filteredList[0].age <= filteredList[1].age &&
                filteredList[1].age <= filteredList[2].age;
            expect(ageSortCheck).toBeTruthy();
        }
        {
            const url =
                '/dogs?page=1&itemsPerPage=20&gender=F&sortByAge=1&sortByName=1';

            const {
                body: { data: filteredList },
            } = await request(app).get(url).expect(200);

            expect(filteredList.length).toBe(13);

            filteredList.forEach((dog: IDog) => {
                expect(dog).toHaveProperty('gender', 'F');
            });
        }
        {
            const url =
                '/dogs?page=2&itemsPerPage=10&race=Laotian&sortByGender=1&sortByAge=1';

            const {
                body: { data: filteredList },
            } = await request(app).get(url).expect(200);

            expect(filteredList.length).toBe(0);
        }
        {
            const url =
                '/dogs?page=1000&itemsPerPage=1000&race=Laotian&sortByGender=1&sortByAge=1';

            await request(app).get(url).expect(500);
        }
        {
            const url = '/dogs?race=1&sortByGender=hello&sortByAge=1';

            await request(app).get(url).expect(500);
        }
        {
            const url = '/dogs?status=notNumber';

            await request(app).get(url).expect(500);
        }
        {
            const url = '/dogs?minAge=notNumber';

            await request(app).get(url).expect(500);
        }
        {
            const url = '/dogs?maxAge=notNumber';

            await request(app).get(url).expect(500);
        }
        {
            const url = '/dogs?sortByStatus=3';

            await request(app).get(url).expect(500);
        }
        {
            const url = '/dogs?page=-99';

            await request(app).get(url).expect(500);
        }
        {
            const url = '/dogs?sortByRace=2';

            await request(app).get(url).expect(500);
        }
        {
            const url = '/dogs?sortByRace=yes';

            await request(app).get(url).expect(500);
        }
        {
            const url = '/dogs?sortByAge=yes';

            await request(app).get(url).expect(500);
        }
        {
            const url = '/dogs?sortByName=yes';

            await request(app).get(url).expect(500);
        }
        {
            const url = '/dogs?sortByLastUpdated=yes';

            await request(app).get(url).expect(500);
        }
        {
            const url = '/dogs?sortByLastUpdated=2';

            await request(app).get(url).expect(500);
        }
    });

    test('get distinct races list API - success', async function () {
        {
            const result = await request(app).get('/dogs/races').expect(200);
            const list: string[] = result.body;

            const allRaces = {
                Aleut: 1,
                'American Indian and Alaska Native (AIAN)': 1,
                'Alaskan Athabascan': 1,
                'Asian Indian': 1,
                'Black or African American': 1,
                'Costa Rican': 1,
                Chilean: 1,
                Ute: 1,
                mixed: 1,
                Micronesian: 1,
                Menominee: 1,
                Mexican: 1,
                'South American': 1,
                'Native Hawaiian': 1,
                Yuman: 1,
                Venezuelan: 1,
                Japanese: 1,
                Laotian: 1,
                Panamanian: 1,
                Ottawa: 1,
            };

            let includeRaces = true;

            for (const race of list) {
                if (!allRaces.hasOwnProperty(race)) {
                    includeRaces = false;
                    break;
                }
            }

            expect(includeRaces).toBeTruthy();
            expect(list.length).toBe(20);
        }
    });

    test('delete dog by id API success & fail - wrong owner/not admin/logged out', async function () {
        const userDoc = (await UserModel.findOne({
            username: 'user111',
        })) as IUser;
        expect(userDoc).toBeDefined();

        const loginResult = await request(app)
            .post('/auth/login')
            .set('Accept', 'application/json')
            .send({ username: 'user111', password: 'user111' })
            .expect(302);
        expect(loginResult).toBeDefined();

        const cookie = loginResult.headers['set-cookie'][0];

        const body = {
            owner: userDoc._id,
            adopter: null,
            race: 'mixed',
            gender: 'M',
            age: 6,
            vaccines: 6,
            behave: ['agressive'],
            name: 'appa',
        } as unknown as IDog;

        const dogCreation = await request(app)
            .post('/dogs')
            .set('Accept', 'application/json')
            .send(body)
            .set('Cookie', [cookie])
            .expect(201);
        expect(dogCreation).toBeDefined();

        await request(app)
            .delete(`/dogs/${dogCreation.body._id}`)
            .set('Cookie', [cookie])
            .expect(200);

        const dogCreation2 = await request(app)
            .post('/dogs')
            .set('Accept', 'application/json')
            .send(body)
            .set('Cookie', [cookie])
            .expect(201);
        expect(dogCreation2).toBeDefined();

        {
            await request(app)
                .delete(`/dogs/${dogCreation2.body._id}`)
                .expect(500);
        }
        {
            await request(app)
                .post('/auth/logout')
                .set('Cookie', [cookie])
                .expect(302);

            await request(app)
                .delete(`/dogs/${dogCreation2.body._id}`)
                .set('Cookie', [cookie])
                .expect(500);
        }
        {
            const result = await request(app)
                .post('/auth/login')
                .set('Accept', 'application/json')
                .send({ username: 'admin', password: 'admin' })
                .expect(302);
            expect(result).toBeDefined();

            const cookie = result.headers['set-cookie'][0];

            await request(app)
                .delete(`/dogs/${dogCreation2.body._id}`)
                .set('Cookie', [cookie])
                .expect(200);
        }
    });
});
