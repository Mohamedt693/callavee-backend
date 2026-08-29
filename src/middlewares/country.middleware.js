import geoip from 'geoip-lite';

export const detectCountry = (req, res, next) => {
    const rawIp = req.headers['cf-connecting-ip'] || 
                  req.headers['x-forwarded-for']?.split(',')[0] || 
                  req.socket.remoteAddress;

    const ip = rawIp ? rawIp.replace(/^.*:/, '') : '';

    let country = 'US'; 
    
    if (ip && ip !== '127.0.0.1' && ip !== 'localhost') {
        const geo = geoip.lookup(ip);
        if (geo && geo.country) {
            country = geo.country;
        }
    }

    req.userCountry = country;
    next();
};