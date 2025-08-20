import type { Request, Response } from 'express';
import { prisma as p } from '../models/prisma';
import dayjs from 'dayjs';

export async function getAvailableSlots(req: Request, res: Response) {
    const { employeeId, date } = req.params;

    if (!employeeId) {
        return res.status(400).json({ message: 'Parâmetro "employeeId" é obrigatório.' });
    }

    const selectedDate = dayjs(date);
    if (!selectedDate.isValid()) {
        return res.status(400).json({ message: 'Data inválida.' });
    }

    const dayOfWeek = selectedDate.day(); // 0 = domingo 6 = sábado

    const availability = await p.availability.findMany({
        where: {
            employee_id: employeeId,
            dayOfWeek
        }
    });

    res.json(availability);
}