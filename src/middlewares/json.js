export async function json(req, res) {
    const Buffers = []

    for await (const chunk of req) {
        Buffers.push(chunk)
    }

    try {
        req.body = JSON.parse(Buffer.concat(Buffers).toString())
    } catch {
        req.body = null
    }

    res.setHeader('Content-Type', 'application/json')
}