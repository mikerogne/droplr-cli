require('dotenv').config();
const DroplrApi = require('droplr-api');
const program = require('commander');
const moment = require('moment');
const chalk = require('chalk');

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
               return console.error(chalk.red.bold(`Unable to parse <when> value: ${chalk.white(when)}.`));
           }

           droplr.drops.update(id, {
               selfDestructType: 'TIME',
               selfDestructValue: dt.valueOf(),
           }).then(result => {
               console.log(`Drop [${chalk.cyanBright(id)}] is set to expire ${chalk.cyanBright(dt.calendar().toLowerCase())}.`);
           }).catch(err => {
               console.error(chalk.red.bold(`Encountered error updating: ${chalk.white(err)}`));
           });
       });

program.command('delete [link|id]')
       .description('delete a drop')
       .action(id => {
           try {
               id = getIdFromLink(id);

               droplr.drops.delete(id);
           } catch (err) {
               return console.log(chalk.red.bold(`Encountered error when deleting drop: ${chalk.white(err.message)}`));
           }

           console.log(`Drop [${chalk.cyanBright(id)}] has been deleted.`);
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
