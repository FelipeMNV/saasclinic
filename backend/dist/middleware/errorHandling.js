import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
export const errorHandling = (error, req, res, next) => {
    if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
            return res.status(409).json({ message: "Already exist." });
        }
        else
            (error.code === 'P2025');
        {
            return res.status(404).json({ message: 'Resource not found' });
        }
        ;
    }
    if (error instanceof Error) {
        console.error(error.message);
    }
    return res.status(500).json({ message: "Internal server error" });
};
//# sourceMappingURL=errorHandling.js.map