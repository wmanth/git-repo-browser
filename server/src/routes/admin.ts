import express from 'express';

export const admin = express.Router();

admin.get('/', (_, res) => {
	res.json({title: "Repository Browser"});
});
