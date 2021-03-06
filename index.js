#!/usr/bin/env node
const DroplrApi = require('droplr-api');
const program = require('commander');
const moment = require('moment');
const chalk = require('chalk');
const Auth = require('./Auth');
const auth = new Auth();

const droplr = new DroplrApi.Client({
    auth: new DroplrApi.BasicAuth(auth.username, auth.password)
});

program.version('1.0.5');

program.command('set-auth <username> <password>')
       .description('set your droplr authentication')
       .action((username, password) => {
           auth.setAuth(username, password);

           console.log(`Updated credentials.`);
       });

program.command('get <link|id>')
       .description('get a drop by link or id')
       .action(id => {
           id = getIdFromLink(id);

           droplr.drops.get(id).then(result => {
               const data = {
                   'Title': result.title,
                   'Link': result.shortlink,
                   'Type': result.type,
                   'Active': result.active,
                   'Boards': result.boards,
                   'Date Created': new Date(result.createdAt).toLocaleString(),
                   'Deleted': result.deleted,
                   'Expires': result.selfDestructType === 'TIME' ? new Date(result.selfDestructValue).toLocaleString() : 'N/A',
               };

               console.table(data);
           }).catch(err => {
               console.error(`Encountered error getting drop: ${chalk.white(err.message)}`);
           });
       });

program.command('expire <link|id> <when>')
       .description('set expiration for a drop. can specify "m" for minutes, "h" for hours, or "d" for days. ie: 20m, 1hr, 30d)')
       .action((id, when) => {
           let num, durationType;
           let dt;

           id = getIdFromLink(id);

           try {
               [, num, durationType] = when.match(/^(\d+?)([s|m|h|d|y])$/i);
               dt = moment().add(num, durationType);
           } catch (err) {
               return console.error(`Unable to parse <when> value: ${chalk.white(when)}.`);
           }

           droplr.drops.update(id, {
               selfDestructType: 'TIME',
               selfDestructValue: dt.valueOf(),
           }).then(result => {
               console.log(`Drop [${chalk.cyanBright(id)}] is set to expire ${chalk.cyanBright(dt.calendar().toLowerCase())}.`);
           }).catch(err => {
               console.error(`Encountered error updating drop: ${chalk.white(err)}`);
           });
       });

program.command('delete [link|id]')
       .description('delete a drop')
       .action(id => {
           id = getIdFromLink(id);

           droplr.drops.delete(id).then(() => {
               console.log(`Drop [${chalk.cyanBright(id)}] has been deleted.`);
           }).catch(err => {
               console.log(`Encountered error deleting drop: ${chalk.white(err.message)}`);
           });
       });

program.on('command:*', () => {
    console.error(`Invalid command: ${chalk.white(program.args.join(' '))}\nSee --help for a list of available commands.`);
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
