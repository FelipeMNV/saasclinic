import app from './app'
import { PORT } from './config/env.ts'


export const JWT_SECRET = process.env.JWT_SECRET;


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

export default app
