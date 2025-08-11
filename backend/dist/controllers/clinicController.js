import { prisma as p } from "../models/prisma.js";
import { clinicRegisterSchema } from "../validators/clinic.validators.js";
export async function createClinic(req, res) {
    const result = clinicRegisterSchema.safeParse(req.body);
    if (!req.user?.id) {
        return res.status(400).json({ message: "Usuário não autenticado" });
    }
    if (!result.success) {
        return res.status(400).json({ message: result.error.issues });
    }
    const newClinic = await p.clinica.create({
        data: {
            name: result.data.name,
            slug: result.data.slug,
            contact: result.data.contact,
            address: result.data.address,
            user_id: req.user?.id
        },
        select: {
            id: true,
            name: true,
            slug: true,
            contact: true,
            address: true,
            user_id: true,
            createdAt: true,
            employees: true
        }
    });
    return res.send(newClinic);
}
;
export async function updateClinicName(req, res) {
    const { id, name } = req.body;
    if (!id && !name) {
        return res.status(400).json({ message: 'Name are required' });
    }
    const updatedClinic = await p.clinica.update({
        where: { id },
        data: {
            name
        }
    });
    return res.send(updatedClinic);
}
export async function updateClinicSlug(req, res) {
    const { id, slug } = req.body;
    if (!id && !slug) {
        return res.status(400).json({ message: 'Contact are required' });
    }
    const updatedClinic = await p.clinica.update({
        where: { id },
        data: {
            slug
        }
    });
    return res.send(updatedClinic);
}
export async function updateClinicContact(req, res) {
    const { id, contact } = req.body;
    if (!id && !contact) {
        return res.status(400).json({ message: 'Contact are required' });
    }
    const updatedClinic = await p.clinica.update({
        where: { id },
        data: {
            contact
        }
    });
    return res.send(updatedClinic);
}
export async function updateClinicAddress(req, res) {
    const { id, address } = req.body;
    if (!id && !address) {
        return res.status(400).json({ message: 'Contact are required' });
    }
    const updatedClinic = await p.clinica.update({
        where: { id },
        data: {
            address
        }
    });
    return res.send(updatedClinic);
}
export async function getClinicBySlug(req, res) {
    const { slug } = req.params;
    if (!slug) {
        return res.status(400).json({ message: "Slug are required" });
    }
    const clinic = await p.clinica.findUnique({
        where: { slug },
        select: {
            id: true,
            name: true,
            slug: true,
            contact: true,
            address: true,
            user_id: true,
            createdAt: true,
            employees: true
        }
    });
    if (!clinic) {
        return res.status(404).json({ message: "Clinic not found" });
    }
    return res.json(clinic);
}
export async function getClinics(req, res) {
    const clinic = await p.clinica.findMany({
        select: {
            id: true,
            name: true,
            slug: true,
            contact: true,
            address: true,
            user_id: true,
            createdAt: true,
            employees: true
        }
    });
    return res.json(clinic);
}
export async function deleteClinic(req, res) {
    const { id } = req.body;
    if (!id)
        return res.status(404).json({ message: 'ID are required' });
    await p.clinica.delete({
        where: { id }
    });
    res.status(204).end();
}
//# sourceMappingURL=clinicController.js.map