export default function getAuth(request: any) {
    const cookieJSON: any = {};
    const cookiesArray = request.headers.get('cookie')?.split('; ');
    cookiesArray?.forEach((cookie: string) => {
        const values = cookie.split('=');
        cookieJSON[values[0]] = values[1];
    });
    const sid = cookieJSON['connect.sid'];
    return sessions[sid];
}