const userRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

userRouter.post('/', async (request, response) => {
    const { username, name, password } = request.body

    if (password.length < 3) {
        return response.status(400).json({ message: 'Password should be at least 3 characters long' })
    }
    else {
        const saltRounds = 10
        const passwordHash = await bcrypt.hash(password, saltRounds)

        const user = new User({
            username,
            name,
            passwordHash,
        })

        await user.save()
            .then(res => response.status(201).json(res))
            .catch(err => response.status(400).json('Error: ' + err))
    }
})

userRouter.get('/', async (request, response, next) => {
    const users = await User.find({})
    response.json(users)
})


module.exports = userRouter