import app from './app'
import { PORT } from './config/env.ts'

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

export default app
