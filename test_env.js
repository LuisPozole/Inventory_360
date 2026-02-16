try {
    require('dotenv').config();
    console.log('Dotenv loaded');
    console.log('PORT:', process.env.PORT);
} catch (e) {
    console.error(e);
}
