import knex from '../database/connection'
import { Request, Response, request } from 'express';

class PointController {

    async index(req: Request, res: Response) {
        const { city, uf, items } = req.query;

        const parseItems = String(items)
            .split(',')
            .map(item => Number(item.trim()))

        const points = await knex('points')
            .join('point_items', 'points.id', 'point_items.point_id')
            .whereIn('point_items.point_id', parseItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*');

        if (!points) {
            return res.status(400).json({ message: 'Point not found' })
        }

        const serializedPoints = points.map(point => {
            return {
                ...point,
                image_url: `http://192.168.1.102:3333/uploads/${point.image}`,
            }
        })

        return res.json(serializedPoints)
    }

    async show(req: Request, res: Response) {
        const { id } = req.params;

        const point = await knex('points').where('id', id).first();

        if (!point) {
            return res.status(400).json({ message: 'Point not found' })
        }

        const items = await knex.table('items')
            .join('point_items', 'items.id', 'point_items.item_id')
            .where('point_items.point_id', point.id)
            .select('items.title');

        const serializedPoint = {
            ...point,
            image_url: `http://192.168.1.102:3333/uploads/${point.image}`,
        };

        return res.json({ point: serializedPoint, items })
    }

    async create(req: Request, res: Response) {
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items,
        } = req.body;


        const trx = await knex.transaction();

        const point = {
            image: req.file.filename,
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
        };

        const insertedIds = await trx('points').insert(point).returning('id');


        const point_id = insertedIds[0];
        const pointItems = items
            .split(',')
            .map((item: String) => Number(item.trim()))
            .map((item_id: number) => {
                return {
                    item_id,
                    point_id,
                }
            });
        console.log('pointItems', pointItems)

        await trx('point_items').insert(pointItems);

        await trx.commit();

        return res.json({
            id: point_id,
            ...point,
        })
    }
}

export default PointController;