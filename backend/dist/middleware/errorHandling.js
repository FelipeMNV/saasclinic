export const errorHandling = (error, req, res, next) => {
    if (error instanceof Error) {
        console.log(error.name);
        if ('code' in error) {
            console.log(error.code);
            if (error.name === 'PrismaClientKnownRequestError') {
                if (error.code === 'P2002') {
                    return res.status(409).json({ message: "Already exist." });
                }
                if (error.code === 'P2025') {
                    return res.status(404).json({ message: "Resource not found" });
                }
            }
        }
    }
    return res.status(500).json({ message: "Internal server error" });
};
//# sourceMappingURL=errorHandling.js.map