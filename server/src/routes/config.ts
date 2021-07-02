import express from 'express'

export const config = express.Router()

config.get('/', (_, res) => {
	res.json({title: "Repository Browser"})
})
