const dogsList = require('../mocks/MOCK_DOGS_DATA.json');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const {
    validateDogBody,
    requiredDogBodyField,
} = require('../middleware/validate-dog.middleware');
const mockPath = path.join(__dirname, '..', 'mocks', 'MOCK_DOGS_DATA.json');
const { getFilteredDogListCtrl } = require('../controllers/dogs.controller');

const router = express.Router();

//localhost:3000/dogs/123
router.get('/:dogId', (req, res, next) => {
    const dog = dogsList.find((dog) => dog.id === req.params.dogId);
    res.json(dog);
});

//localhost:3000/dogs?status=available&gender=M
//{status: 'available', gender: 'M'}
router.get('/', (req, res, next) => {
    const { status, gender, race, minAge, maxAge, name } = req.query;
    const dogs = dogsList.filter((dog) => {
        if (status !== undefined && dog.status !== status) return false;
        if (
            gender !== undefined &&
            dog.gender.toLowerCase() !== gender.toLowerCase()
        )
            return false;
        if (
            race !== undefined &&
            !race
                .split(',')
                .map((r) => r.trim().toLowerCase())
                .includes(dog.race.toLowerCase())
        )
            return false;
        if (minAge !== undefined && !(dog.age >= minAge)) return false;
        if (maxAge !== undefined && !(dog.age <= maxAge)) return false;
        if (
            name !== undefined &&
            !dog.name.toLowerCase().includes(name.toLowerCase())
        ) {
            return false;
        }
        return true;
    });
    res.json(dogs);
});

router.post('/', validateDogBody, requiredDogBodyField, (req, res, next) => {
    const dog = {
        id: uuidv4(),
        race: req.body.race ?? 'unknown',
        gender: req.body.gender,
        age: req.body.age,
        vaccines: req.body.vaccines ?? 0,
        behave: req.body.behave ?? [],
        image: req.body.image,
        name: req.body.name ?? '',
        status: 'available',
    };

    dogsList.push(dog);

    fs.writeFileSync(mockPath, JSON.stringify(dogsList), { encoding: 'utf8' });

    res.sendStatus(201);
});

router.put('/:dogId', validateDogBody, getFilteredDogListCtrl);

router.delete('/:dogId', (req, res, next) => {
    const dogIndex = dogsList.findIndex((d) => d.id === req.params.dogId);

    if (dogIndex === -1) return res.sendStatus(204);

    dogsList.splice(dogIndex, 1);

    fs.writeFileSync(mockPath, JSON.stringify(dogsList), { encoding: 'utf8' });

    res.sendStatus(200);
});

module.exports = router;
