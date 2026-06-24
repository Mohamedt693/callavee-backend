import geoip from 'geoip-lite';

export const detectCountry = (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const geo = geoip.lookup(ip);
    
    req.userCountry = geo ? geo.country : 'US';
    next();
};