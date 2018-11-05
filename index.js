require('dotenv').config();
const DroplrApi = require('droplr-api');

const droplr = new DroplrApi.Client({
    auth: new Droplr.BasicAuth(process.env.USERNAME, process.env.PASSWORD)
});

droplr.drops.update('DBoVPI', {
    selfDestructType: 'TIME',
    selfDestructValue: Math.round((new Date().getTime() + 60 * 60 * 3 * 1000)) // 5 hours from now
}).then(result => {
    console.log(result);
}).catch(err => {
    console.log(err);
});

// client.drops.get('DBoVPI').then(result => {
//     console.log(result);
// });

// client.drops.list().then(result => {
//     const drops = result.results;
//     console.log(`Total drops: ${result.count}`);
//     console.log(`First drop in list: ${JSON.stringify(drops[0], null, 2)}`);
// });

