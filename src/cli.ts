import { cac } from 'cac'

const cli = cac('newx')

cli.command('build', 'Build files.')
  .action((options) => {
    console.log('build: ', options)
  })

cli.command('dev', 'Watch files and running dev-server.')
  .option('-h, --host <host>', 'Server host.')
  .option('-p, --port <port>', 'Server port.')
  .option('--open', 'Open the dev server in your browser when building succeeded.')
  .action((options) => {
    console.log('dev: ', options)
  })

cli
  .option('--pages <path>', 'The directory to page files.')
  .option('--components <path>', 'The directory to page files.')
  .option('--layouts <path>', 'The directory to layout files.')
  .option('--dir <path>', 'The directory to output files.')
  .option('--clean', 'Disable clean output directory before building.')
  .option('-f, --format <type>', 'Specify the output format.')

cli.help()

cli.parse()