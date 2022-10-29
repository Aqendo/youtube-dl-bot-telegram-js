const Telegraf = require('telegraf');
const youtubedl = require('youtube-dl-exec')
const bot = new Telegraf.Telegraf(process.env.BOT_TOKEN);
const fs = require('fs');
const path = require('path');
var exec = require('child_process').exec;
bot.command("clean", async (ctx) => {

	exec('rm https*',
    function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
             console.log('exec error: ' + error);
        }
    });
    await ctx.reply("Done")
})
const findMyFile = (fileName) => {
  const extensions = ['mp4', 'mkv', 'webm', 'unknown_video'];
  for(const extension of extensions) {
    const path1 = path.resolve(process.cwd(), `${fileName}.${extension}`);
    if (fs.existsSync(path1)) {
      return {
        path1, extension, fileName
      }
    }
  }
  throw Error('No such files');
}
const reg = /[A-Za-z0-9]/g;
bot.url(async (ctx) => {
  if (!(ctx.message.from.id == 2047813473)) return;
  let filee = "";
  try {
    await youtubedl(ctx.message.text, {
    noCheckCertificates: true,
    preferFreeFormats: true,
    format: 'bestvideo[ext=mp4][height<=1080][vcodec!*=av01]+bestaudio[ext=m4a]/bestvideo[height<=1080]+bestaudio/bestvideo+bestaudio/best',
    addHeader: [
      'referer:youtube.com',
    ],
    output:`${[...ctx.message.text.matchAll(reg)].join("")}.%(ext)s`
  })
  let file = findMyFile([...ctx.message.text.matchAll(reg)].join(""))
  filee = file
  await ctx.replyWithVideo({source:file.path1}, {supports_streaming: true})
} catch (e) {
  await ctx.reply("no video tonight, the bot is broken\n" + e)
  console.log(e)
}
  try {
  await fs.unlink(filee.path1, async (err)=>{
    err && await ctx.reply(err)
  })
  } catch (e) {
    console.log(e)
  }
});
bot.launch();
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
