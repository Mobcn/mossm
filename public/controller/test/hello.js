/**
 * @param {import('../../handler/index').VercelRequest} request
 * @param {import('../../handler/index').VercelResponse} response
 */
export default function handler(request, response) {
    response.status(200).json({
        content: 'hello',
        ...request.query
    });
}
