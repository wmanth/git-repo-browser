import express from 'express'

export const config = express.Router()

config.get('/', (req, res) => {
	res.json({title: "Git Repository Browser"})
})
