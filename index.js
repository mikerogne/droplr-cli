require('dotenv').config();
const DroplrApi = require('droplr-api');
const program = require('commander');
const moment = require('moment');

const droplr = new DroplrApi.Client({
    auth: new DroplrApi.BasicAuth(process.env.DROPLR_USERNAME, process.env.DROPLR_PASSWORD)
});

program.version('1.0.0');

program.command('get <link|id>')
       .description('get a drop by link or id')
       .action(id => {
           id = getIdFromLink(id);

           droplr.drops.get(id).then(result => {
               console.table(result);
           });
       });

program.command('expire <link|id> <when>')
       .description('set expiration for a drop. can specify "m" for minutes, "h" for hours, or "d" for days. ie: 20m, 1hr, 30d)')
       .action((id, when) => {
           let num, durationType;
           let dt;

           id = getIdFromLink(id);

           try {
               [, num, durationType] = when.match(/^(\d+?)([m|h|d])$/i);
               dt = moment().add(num, durationType);
           } catch (err) {
               console.error("Unable to parse <when> value.");
               program.help();
           }

           droplr.drops.update(id, {
               selfDestructType: 'TIME',
               selfDestructValue: dt.valueOf(),
           }).then(result => {
               console.log(`[${id}] is set to expire ${dt.calendar().toLowerCase()}`);
           }).catch(err => {
               console.error(err);
           });
       });

program.command('delete [link|id]')
       .description('delete a drop')
       .action(id => {
           try {
               id = getIdFromLink(id);

               droplr.drops.delete(id);
           } catch (err) {
               return console.log(`Encountered error when deleting drop: ${err.message}`);
           }

           console.log(`[${id}] has been deleted.`);
       });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
}

/**
 * Expects link like: https://d.pr/i/FOOBAR
 * @param {string} link
 * @return {string}
 */
function getIdFromLink(link) {
    let url;

    try {
        url = new URL(link);
    } catch (error) {
        return link;
    }

    return url.pathname.split('/').slice(-1).toString();
}
